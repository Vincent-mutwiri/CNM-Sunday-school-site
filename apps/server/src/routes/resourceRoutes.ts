import { Router, type Request, type Response, type NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { 
  uploadResource, 
  getApprovedResources, 
  getPendingResources, 
  updateResourceStatus,
  getTeacherResources,
  shareResource,
  getSharedResources
} from '../controllers/resourceController';
import { authMiddleware } from '../middleware/authMiddleware';
import { checkRole } from '../middleware/roleMiddleware';

const router: import("express").Router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/resources/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|ppt|pptx|mp4|mp3|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Teacher routes
router.post('/upload', authMiddleware, checkRole(['Teacher']), upload.single('file'), uploadResource);
router.get('/teacher/resources', authMiddleware, checkRole(['Teacher']), getTeacherResources);
router.put('/:id/share', authMiddleware, checkRole(['Teacher']), shareResource);
router.get('/shared', authMiddleware, checkRole(['Teacher']), getSharedResources);

// Authenticated routes
router.get('/', authMiddleware, getApprovedResources);

// Admin routes
router.get('/pending', authMiddleware, checkRole(['Admin']), getPendingResources);
router.put('/:id/status', authMiddleware, checkRole(['Admin']), updateResourceStatus);

export default router;

