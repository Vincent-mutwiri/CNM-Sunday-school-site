import { Router, type Request, type Response, type NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { 
  uploadGalleryImage, 
  getApprovedImages, 
  getPendingImages, 
  updateImageStatus 
} from '../controllers/galleryController';
import { authMiddleware } from '../middleware/authMiddleware';
import { checkRole } from '../middleware/roleMiddleware';

const router: import("express").Router = Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/gallery/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpg|jpeg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Teacher routes
router.post('/upload', authMiddleware, checkRole(['Teacher']), upload.single('image'), uploadGalleryImage);

// Authenticated routes
router.get('/', authMiddleware, getApprovedImages);

// Admin routes
router.get('/pending', authMiddleware, checkRole(['Admin']), getPendingImages);
router.put('/:id/status', authMiddleware, checkRole(['Admin']), updateImageStatus);

export default router;

