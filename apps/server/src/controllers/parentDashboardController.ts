import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Types } from 'mongoose';
import { IUser } from '../models/user.model';
import Child from '../models/child.model';
import Class from '../models/class.model';
import Schedule from '../models/schedule.model';
import Attendance from '../models/attendance.model';
import Grade from '../models/grade.model';

// Get data for parent dashboard
export const getParentDashboard = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const parent = req.user;

    // Get children of the parent with their class information
    const children = await Child.find({ parents: parent._id })
      .populate<{ class: { _id: Types.ObjectId; name: string } }>('class', 'name');

    // Get upcoming schedules for the children
    const childClassIds = children
      .filter(child => child.class)
      .map(child => child.class._id);
    const upcomingSchedules = await Schedule.find({ 
      class: { $in: childClassIds },
      date: { $gte: new Date() }
    })
    .populate('class', 'name')
    .sort({ date: 1 })
    .limit(5);

    // Get recent attendance records for the children
    const recentAttendance = await Attendance.find({ 
      child: { $in: children.map(child => child._id) }
    })
    .populate('child', 'name')
    .populate('class', 'name')
    .sort({ date: -1 })
    .limit(10);

    // Get recent grades for the children
    const recentGrades = await Grade.find({ 
      student: { $in: children.map(child => child._id) }
    })
    .populate('student', 'name')
    .populate('class', 'name')
    .populate('teacher', 'name')
    .sort({ date: -1 })
    .limit(10);

    res.status(200).json({
      children,
      upcomingSchedules,
      recentAttendance,
      recentGrades
    });
  } catch (error) {
    console.error('Error fetching parent dashboard data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};