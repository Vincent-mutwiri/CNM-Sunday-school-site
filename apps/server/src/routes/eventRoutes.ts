import { Router, type Request, type Response, type NextFunction } from 'express';
import { createEvent, getAllEvents, updateEvent, deleteEvent } from '../controllers/eventController';
import { authMiddleware } from '../middleware/authMiddleware';
import { checkRole } from '../middleware/roleMiddleware';

const router: import("express").Router = Router();

// Admin/Teacher routes
router.post('/', authMiddleware, checkRole(['Admin', 'Teacher']), createEvent);
router.put('/:id', authMiddleware, checkRole(['Admin', 'Teacher']), updateEvent);
router.delete('/:id', authMiddleware, checkRole(['Admin']), deleteEvent);

// Authenticated routes
router.get('/', authMiddleware, getAllEvents);

export default router;

