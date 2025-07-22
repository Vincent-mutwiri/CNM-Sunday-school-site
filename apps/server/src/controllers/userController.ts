import { Response } from 'express';
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
