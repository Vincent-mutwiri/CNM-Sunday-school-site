import { Response } from 'express';
import Attendance from '../models/attendance.model';
import Schedule from '../models/schedule.model';
import { AuthRequest } from '../middleware/authMiddleware';

export const markAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { scheduleId, records } = req.body;
    const teacherId = req.user?._id;
    if (!teacherId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify that the teacher is assigned to this schedule
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Ensure schedule.teacher is a valid ObjectId before comparison
    const scheduleTeacherId = schedule.teacher?.toString();
    if (!scheduleTeacherId || scheduleTeacherId !== teacherId.toString()) {
      return res.status(403).json({ message: 'Access denied. You are not assigned to this class.' });
    }

    // Delete existing attendance records for this schedule
    await Attendance.deleteMany({ schedule: scheduleId });

    // Create new attendance records
    const attendanceRecords = records.map((record: any) => ({
      schedule: scheduleId,
      child: record.childId,
      status: record.status,
      notes: record.notes || '',
      markedBy: teacherId
    }));

    const savedRecords = await Attendance.insertMany(attendanceRecords);

    const populatedRecords = await Attendance.find({ schedule: scheduleId })
      .populate('child', 'firstName lastName')
      .populate('markedBy', 'name');

    res.json({ 
      message: 'Attendance marked successfully', 
      attendanceRecords: populatedRecords 
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getChildAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { childId } = req.params;
    const { startDate, endDate } = req.query;

    let filter: any = { child: childId };

    if (startDate && endDate) {
      // Get schedules within date range first
      const schedules = await Schedule.find({
        date: {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string)
        }
      });
      
      const scheduleIds = schedules.map(s => s._id);
      filter.schedule = { $in: scheduleIds };
    }

    const attendanceRecords = await Attendance.find(filter)
      .populate({
        path: 'schedule',
        populate: [
          { path: 'class', select: 'name ageRange' },
          { path: 'teacher', select: 'name' }
        ]
      })
      .sort({ createdAt: -1 });

    res.json({ attendanceRecords });
  } catch (error) {
    console.error('Get child attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getScheduleAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { scheduleId } = req.params;

    const attendanceRecords = await Attendance.find({ schedule: scheduleId })
      .populate('child', 'firstName lastName')
      .populate('markedBy', 'name');

    const schedule = await Schedule.findById(scheduleId)
      .populate('class', 'name ageRange')
      .populate('teacher', 'name')
      .populate('students', 'firstName lastName');

    res.json({ 
      schedule,
      attendanceRecords 
    });
  } catch (error) {
    console.error('Get schedule attendance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

