import express, { Router } from 'express';
import { 
  getVolunteerSlots,
  signUpForVolunteerSlot,
  createVolunteerSlot
} from '../controllers/volunteerController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router: Router = express.Router();

// Public route for parents to view available slots
router.get('/', authenticateToken, requireRole(['Parent', 'Admin']), getVolunteerSlots);

// Parent route to sign up for a slot
router.post('/:slotId/signup', authenticateToken, requireRole('Parent'), signUpForVolunteerSlot);

// Admin route to create slots
router.post('/', authenticateToken, requireRole('Admin'), createVolunteerSlot);

export default router;