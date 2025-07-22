import { Response } from 'express';
import Schedule from '../models/schedule.model';
import Child from '../models/child.model';
import { AuthRequest } from '../middleware/authMiddleware';

export const createSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const { classId, teacherId, date, room } = req.body;

    // Get all students assigned to this class
    const students = await Child.find({ assignedClass: classId });
    const studentIds = students.map(student => student._id);

    const schedule = new Schedule({
      class: classId,
      teacher: teacherId,
      students: studentIds,
      date: new Date(date),
      room
    });

    await schedule.save();
    
    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate('class', 'name ageRange')
      .populate('teacher', 'name email')
      .populate('students', 'firstName lastName');

    res.status(201).json({ message: 'Schedule created successfully', schedule: populatedSchedule });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllSchedules = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, teacherId, classId } = req.query;
    
    let filter: any = {};
    
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }
    
    if (teacherId) {
      filter.teacher = teacherId;
    }
    
    if (classId) {
      filter.class = classId;
    }

    const schedules = await Schedule.find(filter)
      .populate('class', 'name ageRange')
      .populate('teacher', 'name email')
      .populate('students', 'firstName lastName')
      .sort({ date: 1 });

    res.json({ schedules });
  } catch (error) {
    console.error('Get all schedules error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTeacherSchedules = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.user!._id;
    const currentDate = new Date();

    const schedules = await Schedule.find({
      teacher: teacherId,
      date: { $gte: currentDate }
    })
      .populate('class', 'name ageRange')
      .populate('students', 'firstName lastName')
      .sort({ date: 1 });

    res.json({ schedules });
  } catch (error) {
    console.error('Get teacher schedules error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // If class is being updated, update students list
    if (updates.classId) {
      const students = await Child.find({ assignedClass: updates.classId });
      updates.students = students.map(student => student._id);
      updates.class = updates.classId;
      delete updates.classId;
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(id, updates, { new: true })
      .populate('class', 'name ageRange')
      .populate('teacher', 'name email')
      .populate('students', 'firstName lastName');

    if (!updatedSchedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    res.json({ message: 'Schedule updated successfully', schedule: updatedSchedule });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const deletedSchedule = await Schedule.findByIdAndDelete(id);
    
    if (!deletedSchedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

