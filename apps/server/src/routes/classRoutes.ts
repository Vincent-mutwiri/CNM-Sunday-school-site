import { Router, type Request, type Response, type NextFunction } from 'express';
import { 
  createClass, 
  getAllClasses, 
  getClassById, 
  updateClass,
  archiveClass,
  deleteClass,
  assignStudentToClass,
  getTeacherClasses
} from '../controllers/classController';
import { authMiddleware } from '../middleware/authMiddleware';
import { checkRole } from '../middleware/roleMiddleware';

const router: import("express").Router = Router();

// Admin only routes
router.post('/', authMiddleware, checkRole(['Admin']), createClass);
router.put('/:id', authMiddleware, checkRole(['Admin']), updateClass);
router.put('/:id/archive', authMiddleware, checkRole(['Admin']), archiveClass);
router.delete('/:id', authMiddleware, checkRole(['Admin']), deleteClass);
router.post('/:id/assign-student', authMiddleware, checkRole(['Admin']), assignStudentToClass);

// Teacher routes
router.get('/teacher/classes', authMiddleware, checkRole(['Teacher']), getTeacherClasses);

// Authenticated routes
router.get('/', authMiddleware, getAllClasses);
router.get('/:id', authMiddleware, getClassById);

export default router;

