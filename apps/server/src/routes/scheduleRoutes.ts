import { Router, type Request, type Response, type NextFunction } from 'express';
import { 
  createSchedule, 
  getAllSchedules, 
  getTeacherSchedules, 
  updateSchedule, 
  deleteSchedule 
} from '../controllers/scheduleController';
import { authMiddleware } from '../middleware/authMiddleware';
import { checkRole } from '../middleware/roleMiddleware';

const router: import("express").Router = Router();

// Admin only routes
router.post('/', authMiddleware, checkRole(['Admin']), createSchedule);
router.put('/:id', authMiddleware, checkRole(['Admin']), updateSchedule);
router.delete('/:id', authMiddleware, checkRole(['Admin']), deleteSchedule);

// Authenticated routes
router.get('/', authMiddleware, getAllSchedules);

// Teacher routes
router.get('/teacher/me', authMiddleware, checkRole(['Teacher']), getTeacherSchedules);

export default router;

