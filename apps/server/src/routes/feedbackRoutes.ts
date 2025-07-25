import express, { Router } from 'express';
import { 
  submitFeedback,
  getFeedbackForTeacher,
  getTeacherAverageRating
} from '../controllers/feedbackController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router: Router = express.Router();

// Parent route to submit feedback
router.post('/', authenticateToken, requireRole('Parent'), submitFeedback);

// Teacher/Admin routes to view feedback
router.get('/teacher/:teacherId', authenticateToken, requireRole(['Teacher', 'Admin']), getFeedbackForTeacher);
router.get('/teacher/:teacherId/average', authenticateToken, getTeacherAverageRating);

export default router;