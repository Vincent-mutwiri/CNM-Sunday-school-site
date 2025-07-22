import { Response } from 'express';
import Schedule from '../models/schedule.model';
import Child from '../models/child.model';
import User from '../models/user.model';
import { AuthRequest } from '../middleware/authMiddleware';

export const createSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const { classId, teacherId, date, room, recurrence } = req.body;

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'Teacher') {
      return res.status(400).json({ message: 'Invalid teacher' });
    }

    const dateObj = new Date(date);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    if (teacher.availability && !teacher.availability.includes(dayName)) {
      return res.status(400).json({ message: 'Teacher not available for this date' });
    }

    const existing = await Schedule.findOne({ date: dateObj, room });
    if (existing) {
      return res.status(400).json({ message: 'Room is already booked for this time' });
    }

    // Get all students assigned to this class
    const students = await Child.find({ assignedClass: classId });
    const studentIds = students.map(student => student._id);

    const schedulesToCreate = [] as any[];
    const createSingle = (d: Date) => ({
      class: classId,
      teacher: teacherId,
      students: studentIds,
      date: d,
      room,
    });

    schedulesToCreate.push(createSingle(dateObj));

    if (recurrence && recurrence.frequency && recurrence.count) {
      for (let i = 1; i < recurrence.count; i++) {
        const next = new Date(dateObj);
        const interval = recurrence.interval || 1;
        if (recurrence.frequency === 'weekly') {
          next.setDate(next.getDate() + i * 7 * interval);
        } else if (recurrence.frequency === 'daily') {
          next.setDate(next.getDate() + i * interval);
        } else if (recurrence.frequency === 'monthly') {
          next.setMonth(next.getMonth() + i * interval);
        }
        schedulesToCreate.push(createSingle(next));
      }
    }

    const created = await Schedule.insertMany(schedulesToCreate);

    const populatedSchedules = await Schedule.find({ _id: { $in: created.map(s => s._id) } })
      .populate('class', 'name ageRange')
      .populate('teacher', 'name email')
      .populate('students', 'firstName lastName');

    res.status(201).json({ message: 'Schedule created successfully', schedules: populatedSchedules });
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

    if (updates.teacherId) {
      const teacher = await User.findById(updates.teacherId);
      if (!teacher || teacher.role !== 'Teacher') {
        return res.status(400).json({ message: 'Invalid teacher' });
      }
      const dayName = updates.date ? new Date(updates.date).toLocaleDateString('en-US', { weekday: 'long' }) : undefined;
      if (dayName && teacher.availability && !teacher.availability.includes(dayName)) {
        return res.status(400).json({ message: 'Teacher not available for this date' });
      }
      updates.teacher = updates.teacherId;
      delete updates.teacherId;
    }

    if (updates.date && updates.room) {
      const conflict = await Schedule.findOne({ date: new Date(updates.date), room: updates.room, _id: { $ne: id } });
      if (conflict) {
        return res.status(400).json({ message: 'Room is already booked for this time' });
      }
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

