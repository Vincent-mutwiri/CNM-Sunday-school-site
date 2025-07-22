import { Router, type IRouter } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController';
import { authMiddleware } from '../middleware/authMiddleware';
import { checkRole } from '../middleware/roleMiddleware';

const router: IRouter = Router();

router.get('/', authMiddleware, getSettings);
router.put('/', authMiddleware, checkRole(['Admin']), updateSettings);

export default router;
