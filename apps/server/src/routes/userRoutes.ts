import { Router, type Request, type Response, type NextFunction } from 'express';
import multer from 'multer';
import { getAllUsers, updateUserRole, deleteUser, getTeachers, createUser, bulkCreateUsers, updateMyAvailability } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';
import { checkRole } from '../middleware/roleMiddleware';

const router: import("express").Router = Router();
const upload = multer({ dest: 'uploads' });

// Admin only routes
router.get('/', authMiddleware, checkRole(['Admin']), getAllUsers);
router.get('/teachers', authMiddleware, getTeachers);
router.post('/', authMiddleware, checkRole(['Admin']), createUser);
router.post('/bulk', authMiddleware, checkRole(['Admin']), upload.single('file'), bulkCreateUsers);
router.put('/:id/role', authMiddleware, checkRole(['Admin']), updateUserRole);
router.delete('/:id', authMiddleware, checkRole(['Admin']), deleteUser);

// Teacher profile
router.put('/me/availability', authMiddleware, checkRole(['Teacher']), updateMyAvailability);

export default router;

