import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { IUser } from '../models/user.model';
import Class from '../models/class.model';
import Schedule from '../models/schedule.model';
import Child from '../models/child.model';
import Attendance from '../models/attendance.model';
import Grade from '../models/grade.model';
import { Types } from 'mongoose';

// Get data for teacher dashboard
export const getTeacherDashboard = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const teacher = req.user;

    // Get classes assigned to the teacher
    const classes = await Class.find({ teachers: teacher._id })
      .populate('students', 'name profilePictureUrl')
      .populate('teachers', 'name');

    // Get upcoming schedules for the teacher
    const upcomingSchedules = await Schedule.find({ 
      class: { $in: classes.map(c => c._id) },
      date: { $gte: new Date() }
    })
    .populate('class', 'name')
    .sort({ date: 1 })
    .limit(5);

    // Get recent grades entered by the teacher
    const recentGrades = await Grade.find({ teacher: teacher._id })
      .populate('student', 'name')
      .populate('class', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      classes,
      upcomingSchedules,
      recentGrades
    });
  } catch (error) {
    console.error('Error fetching teacher dashboard data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};