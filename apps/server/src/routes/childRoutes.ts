import { Router, type Request, type Response, type NextFunction } from 'express';
import { 
  registerChild, 
  getMyChildren, 
  updateChild, 
  deleteChild, 
  getChildrenByClass 
} from '../controllers/childController';
import { authMiddleware } from '../middleware/authMiddleware';
import { checkRole } from '../middleware/roleMiddleware';

const router: import("express").Router = Router();

// Parent routes
router.post('/', authMiddleware, checkRole(['Parent']), registerChild);
router.get('/my-children', authMiddleware, checkRole(['Parent']), getMyChildren);
router.put('/:id', authMiddleware, checkRole(['Parent']), updateChild);
router.delete('/:id', authMiddleware, checkRole(['Parent']), deleteChild);

// Teacher routes
router.get('/class/:classId', authMiddleware, checkRole(['Teacher', 'Admin']), getChildrenByClass);

export default router;

