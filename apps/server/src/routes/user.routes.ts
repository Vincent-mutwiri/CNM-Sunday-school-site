import { Router, type Request, type Response, type NextFunction, type IRouter } from 'express';
import multer from 'multer';
import * as userController from '../controllers/user.controller';
import { authMiddleware } from '../middleware/authMiddleware';
import { checkRole } from '../middleware/roleMiddleware';
import { errorHandler } from '../utils/errors';

const router: IRouter = Router();
const upload = multer();

// Public routes (if any)

// Protected routes (require authentication)
router.use(authMiddleware);

// User profile routes
router.get('/me', userController.getCurrentUser);
router.put('/me/profile', userController.updateUserProfile);
router.post('/me/availability', userController.updateMyAvailability);

// Profile picture upload route with proper middleware typing
router.post('/me/profile-picture', 
  ...userController.uploadProfilePictureHandler as any
);

// Admin-only routes
router.use(checkRole(['Admin']));

// User management routes
router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.get('/teachers', userController.getTeachers);
router.get('/:id', userController.getUserById);
router.put('/:id/role', userController.updateUserRole);
router.put('/:id/profile', userController.updateUserProfile);
router.delete('/:id', userController.deleteUserHandler);

// Bulk user operations
router.post('/bulk-upload', upload.single('file'), userController.bulkCreateUsers);

// Family management routes
router.post('/families', userController.createFamily);
router.get('/families/:familyId', userController.getFamilyDetails);
router.post('/families/:familyId/members', userController.addFamilyMembers);
router.delete('/families/:familyId/members/:userId', userController.removeFamilyMember);

// Error handling middleware
router.use(errorHandler);

export default router;
