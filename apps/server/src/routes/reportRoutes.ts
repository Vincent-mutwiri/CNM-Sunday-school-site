import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { checkRole } from '../middleware/roleMiddleware';
import { generateReport } from '../controllers/reportsController';

const router: Router = Router();
router.post('/generate', authMiddleware, checkRole(['Admin']), generateReport);
export default router;
