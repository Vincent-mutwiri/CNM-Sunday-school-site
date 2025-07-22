import { Response } from 'express';
import Settings from '../models/settings.model';
import { AuthRequest } from '../middleware/authMiddleware';

export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    const settings = await Settings.findOne();
    res.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const updates = req.body;
    const settings = await Settings.findOneAndUpdate({}, updates, {
      new: true,
      upsert: true,
    });
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
