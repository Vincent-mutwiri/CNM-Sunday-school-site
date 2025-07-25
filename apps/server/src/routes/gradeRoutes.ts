import express, { Router } from 'express';
import { 
  createGrade, 
  getGradesByClass, 
  getGradesByChild 
} from '../controllers/gradeController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router: Router = express.Router();

// Teacher routes
router.post('/', authenticateToken, requireRole('Teacher'), createGrade);
router.get('/class/:classId', authenticateToken, requireRole('Teacher'), getGradesByClass);

// Parent routes
router.get('/child/:childId', authenticateToken, requireRole('Parent'), getGradesByChild);

export default router;