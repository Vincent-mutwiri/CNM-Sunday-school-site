import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { checkRole } from '../middleware/roleMiddleware';
import { attendanceTrends, classCapacity, teacherWorkload } from '../controllers/analyticsController';

const router: Router = Router();

router.use(authMiddleware);
router.get('/attendance-trends', checkRole(['Admin', 'Teacher']), attendanceTrends);
router.get('/class-capacity', checkRole(['Admin']), classCapacity);
router.get('/teacher-workload', checkRole(['Admin']), teacherWorkload);

export default router;
