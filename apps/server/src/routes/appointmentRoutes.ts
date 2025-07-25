import express, { Router } from 'express';
import { 
  createAppointmentRequest,
  getAppointmentRequestsForTeacher,
  getAppointmentRequestsForParent,
  updateAppointmentRequestStatus
} from '../controllers/appointmentController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router: Router = express.Router();

// Parent routes
router.post('/', authenticateToken, requireRole('Parent'), createAppointmentRequest);
router.get('/', authenticateToken, requireRole('Parent'), getAppointmentRequestsForParent);

// Teacher routes
router.get('/teacher', authenticateToken, requireRole('Teacher'), getAppointmentRequestsForTeacher);
router.put('/:id/status', authenticateToken, requireRole('Teacher'), updateAppointmentRequestStatus);

export default router;