import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { authMiddleware } from '../middleware/authMiddleware';
import { checkRole } from '../middleware/roleMiddleware';

const router = Router();

router.get('/', authMiddleware, getSettings);
router.put('/', authMiddleware, checkRole(['Admin']), updateSettings);

export default router;
