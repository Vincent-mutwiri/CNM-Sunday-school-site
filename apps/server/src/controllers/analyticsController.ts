import { Response } from 'express';
import Attendance from '../models/attendance.model';
import Class from '../models/class.model';
import Schedule from '../models/schedule.model';
import { AuthRequest } from '../middleware/authMiddleware';
import User from '../models/user.model';

export const attendanceTrends = async (req: AuthRequest, res: Response) => {
  const { timeframe = 'weekly', classId } = req.query;
  const now = new Date();
  const days = timeframe === 'monthly' ? 30 : 7;
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const match: any = { 'schedule.date': { $gte: start, $lte: now } };
  if (classId) match['schedule.class'] = classId;

  const data = await Attendance.aggregate([
    { $lookup: { from: 'schedules', localField: 'schedule', foreignField: '_id', as: 'schedule' } },
    { $unwind: '$schedule' },
    { $match: match },
    { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$schedule.date' } },
        total: { $sum: 1 },
        present: { $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] } }
    }},
    { $project: { _id: 0, date: '$_id', percentage: { $multiply: [{ $cond: [{ $eq: ['$total', 0] }, 0, { $divide: ['$present', '$total'] }] }, 100] } } },
    { $sort: { date: 1 } }
  ]);

  res.json({ data });
};

export const classCapacity = async (req: AuthRequest, res: Response) => {
  const classes = await Class.find().select('name capacity students');
  const data = classes.map(c => ({
    _id: c._id,
    name: c.name,
    capacity: c.capacity,
    currentEnrollment: c.students.length
  }));
  res.json({ data });
};

export const teacherWorkload = async (req: AuthRequest, res: Response) => {
  const { timeframe = 'monthly' } = req.query;
  const now = new Date();
  const days = timeframe === 'weekly' ? 7 : 30;
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const data = await Schedule.aggregate([
    { $match: { date: { $gte: start, $lte: now } } },
    { $group: { _id: '$teacher', count: { $sum: 1 } } },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'teacher' } },
    { $unwind: '$teacher' },
    { $project: { _id: 0, teacher: '$teacher.name', classes: '$count' } }
  ]);

  res.json({ data });
};

