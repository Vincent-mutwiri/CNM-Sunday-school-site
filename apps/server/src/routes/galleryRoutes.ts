import { Router, type Request, type Response, type NextFunction } from 'express';
import { cloudinaryUpload } from '../middleware/cloudinaryUpload';
import { 
  uploadGalleryImage, 
  getApprovedImages, 
  getPendingImages, 
  updateImageStatus 
} from '../controllers/galleryController';
import { authMiddleware } from '../middleware/authMiddleware';
import { checkRole } from '../middleware/roleMiddleware';

const router: import("express").Router = Router();


// Teacher routes
router.post('/upload', authMiddleware, checkRole(['Teacher']), cloudinaryUpload.single('image'), uploadGalleryImage);

// Authenticated routes
router.get('/', authMiddleware, getApprovedImages);

// Admin routes
router.get('/pending', authMiddleware, checkRole(['Admin']), getPendingImages);
router.put('/:id/status', authMiddleware, checkRole(['Admin']), updateImageStatus);

export default router;

