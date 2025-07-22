import { Router, type Request, type Response, type NextFunction } from 'express';
import { getAllUsers, updateUserRole, deleteUser, getTeachers } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';
import { checkRole } from '../middleware/roleMiddleware';

const router: import("express").Router = Router();

// Admin only routes
router.get('/', authMiddleware, checkRole(['Admin']), getAllUsers);
router.get('/teachers', authMiddleware, getTeachers);
router.put('/:id/role', authMiddleware, checkRole(['Admin']), updateUserRole);
router.delete('/:id', authMiddleware, checkRole(['Admin']), deleteUser);

export default router;

