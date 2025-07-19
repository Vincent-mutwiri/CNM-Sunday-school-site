import { Router, type Request, type Response, type NextFunction } from 'express';
import { 
  markAttendance, 
  getChildAttendance, 
  getScheduleAttendance 
} from '../controllers/attendanceController';
import { authMiddleware } from '../middleware/authMiddleware';
import { checkRole } from '../middleware/roleMiddleware';

const router: import("express").Router = Router();

// Teacher routes
router.post('/mark', authMiddleware, checkRole(['Teacher']), markAttendance);

// Parent routes
router.get('/child/:childId', authMiddleware, checkRole(['Parent', 'Admin']), getChildAttendance);

// Teacher/Admin routes
router.get('/schedule/:scheduleId', authMiddleware, checkRole(['Teacher', 'Admin']), getScheduleAttendance);

export default router;

