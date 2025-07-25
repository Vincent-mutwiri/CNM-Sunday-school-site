import express, { Router } from 'express';
import { 
  getConversations,
  createOrGetConversation,
  getMessages,
  sendMessage
} from '../controllers/communicationController';
import { authenticateToken } from '../middleware/authMiddleware';

const router: Router = express.Router();

// All routes require authentication
router.get('/', authenticateToken, getConversations);
router.post('/conversation', authenticateToken, createOrGetConversation);
router.get('/messages/:conversationId', authenticateToken, getMessages);
router.post('/messages', authenticateToken, sendMessage);

export default router;