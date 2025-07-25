import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Feedback from '../models/feedback.model';
import User from '../models/user.model';
import { IUser } from '../models/user.model';
import Class from '../models/class.model';

// Submit feedback
export const submitFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { teacher, class: classId, rating, comments } = req.body;
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const parent = req.user;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Verify that the teacher exists
    const teacherDoc = await User.findById(teacher);
    if (!teacherDoc || teacherDoc.role !== 'Teacher') {
      return res.status(400).json({ message: 'Invalid teacher' });
    }

    // If class is provided, verify it exists
    if (classId) {
      const classDoc = await Class.findById(classId);
      if (!classDoc) {
        return res.status(400).json({ message: 'Invalid class' });
      }
    }

    const feedback = new Feedback({
      parent: parent._id,
      teacher,
      class: classId,
      rating,
      comments
    });

    await feedback.save();

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get feedback for a teacher
export const getFeedbackForTeacher = async (req: AuthRequest, res: Response) => {
  try {
    const { teacherId } = req.params;
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const teacher = req.user;

    // If not admin, only allow teachers to view their own feedback
    if (teacher.role !== 'Admin' && teacher._id.toString() !== teacherId) {
      return res.status(403).json({ message: 'Not authorized to view this feedback' });
    }

    const feedback = await Feedback.find({ teacher: teacherId })
      .populate('parent', 'name')
      .populate('class', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get average rating for a teacher
export const getTeacherAverageRating = async (req: AuthRequest, res: Response) => {
  try {
    const { teacherId } = req.params;

    const result = await Feedback.aggregate([
      { $match: { teacher: teacherId } },
      { $group: { _id: null, averageRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    const averageRating = result.length > 0 ? result[0].averageRating : 0;
    const count = result.length > 0 ? result[0].count : 0;

    res.status(200).json({ averageRating, count });
  } catch (error) {
    console.error('Error calculating average rating:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};