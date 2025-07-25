import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Conversation from '../models/conversation.model';
import Message from '../models/message.model';
import { IUser } from '../models/user.model';
import { Types } from 'mongoose';

// Get all conversations for the logged-in user
export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const user = req.user;

    const conversations = await Conversation.find({ participants: user._id })
      .populate('participants', 'name profilePictureUrl')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a new conversation or get existing one
export const createOrGetConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { participantId } = req.body;
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const user = req.user;

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [user._id, participantId] }
    });

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [user._id, participantId]
      });
      await conversation.save();
    }

    // Populate participants
    await conversation.populate('participants', 'name profilePictureUrl');

    res.status(200).json(conversation);
  } catch (error) {
    console.error('Error creating/getting conversation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all messages for a specific conversation
export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const user = req.user;

    // Check if user is part of the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.participants.some(participant => 
      participant.toString() === user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to view this conversation' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name profilePictureUrl')
      .sort({ createdAt: 1 });

    // Mark messages as read by the current user
    await Message.updateMany(
      { 
        conversation: conversationId, 
        sender: { $ne: user._id },
        readBy: { $ne: user._id }
      },
      { $addToSet: { readBy: user._id } }
    );

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Send a new message
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId, content } = req.body;
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const sender = req.user;

    // Validate input
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Message content is required' });
    }

    // Check if conversation exists and user is part of it
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.participants.some(participant => 
      participant.toString() === sender._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to send message in this conversation' });
    }

    // Create new message
    const message = new Message({
      conversation: conversationId,
      sender: sender._id,
      content,
      readBy: [sender._id] // Mark as read by sender
    });

    await message.save();

    // Populate sender info
    await message.populate('sender', 'name profilePictureUrl');

    // Update conversation's lastMessage
    conversation.lastMessage = message._id as Types.ObjectId;
    await conversation.save();

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};