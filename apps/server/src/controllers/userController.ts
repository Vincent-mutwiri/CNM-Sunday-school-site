import { Response } from 'express';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import User from '../models/user.model';
import { AuthRequest } from '../middleware/authMiddleware';

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().populate('children');
    res.json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    console.log('Update role request:', { id, role, body: req.body });

    if (!role) {
      return res.status(400).json({ 
        success: false,
        message: 'Role is required',
        received: req.body
      });
    }

    if (!['Admin', 'Teacher', 'Parent'].includes(role)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid role. Role must be one of: Admin, Teacher, Parent',
        received: role
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found',
        userId: id
      });
    }

    // Remove sensitive data before sending response
    const userObj = user.toObject();
    delete userObj.password;

    res.json({ 
      success: true,
      message: 'User role updated successfully',
      user: userObj 
    });
  } catch (error: any) {
    console.error('Update user role error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }

    // Handle cast errors (invalid ID format)
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
        error: error.message
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Failed to update user role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getTeachers = async (req: AuthRequest, res: Response) => {
  try {
    const teachers = await User.find({ role: 'Teacher' })
      .select('-password -__v -createdAt -updatedAt')
      .lean();

    res.json({ users: teachers });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ success: false, message: 'Error fetching teachers' });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role, profilePictureUrl, availability } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    if (role && !['Admin', 'Teacher', 'Parent'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || 'Parent',
      profilePictureUrl,
      availability
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({ message: 'User created', user: userObj });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const bulkCreateUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'CSV file is required' });
    }

    const fileContent = fs.readFileSync(req.file.path);
    const records = parse(fileContent, { columns: true, skip_empty_lines: true });

    const created: any[] = [];
    const errors: Array<{ row: number; message: string }> = [];

    for (const [index, record] of records.entries()) {
      const { name, email, password, role, profilePictureUrl, availability } = record;

      if (!name || !email || !password) {
        errors.push({ row: index + 1, message: 'Missing required fields' });
        continue;
      }

      if (role && !['Admin', 'Teacher', 'Parent'].includes(role)) {
        errors.push({ row: index + 1, message: 'Invalid role' });
        continue;
      }

      const exists = await User.findOne({ email });
      if (exists) {
        errors.push({ row: index + 1, message: 'User already exists' });
        continue;
      }

      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email,
        password: hashed,
        role: role || 'Parent',
        profilePictureUrl,
        availability
      });

      created.push({ _id: user._id, name: user.name, email: user.email, role: user.role });
    }

    fs.unlink(req.file.path, () => undefined);

    res.json({ message: 'Bulk upload complete', created, errors });
  } catch (error) {
    console.error('Bulk create users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateMyAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { availability } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { availability },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Availability updated', user });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
