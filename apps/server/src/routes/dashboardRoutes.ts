import express, { Router } from 'express';
import { 
  getTeacherDashboard,
  getParentDashboard
} from '../controllers/dashboardController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router: Router = express.Router();

// Teacher dashboard
router.get('/teacher', authenticateToken, requireRole('Teacher'), getTeacherDashboard);

// Parent dashboard
router.get('/parent', authenticateToken, requireRole('Parent'), getParentDashboard);

export default router;