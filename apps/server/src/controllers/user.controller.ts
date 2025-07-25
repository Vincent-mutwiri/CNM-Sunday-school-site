import { Request, Response, NextFunction, RequestHandler as ExpressRequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import path from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';

import * as userService from '../services/user.service';
import User, { IUser } from '../models/user.model';
import Family from '../models/family.model';
import { AuthRequest } from '../middleware/authMiddleware';
import { 
  BadRequestError, 
  NotFoundError, 
  ForbiddenError, 
  ValidationError 
} from '../utils/errors';
import { 
  uploadProfilePicture,
  getFileUrl, 
  deleteFile 
} from '../utils/fileUpload';

const pipelineAsync = promisify(pipeline);

interface CSVUserRecord {
  name: string;
  email: string;
  password: string;
  role?: 'Admin' | 'Teacher' | 'Parent';
  profilePictureUrl?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  familyName?: string;
  availability?: string; // Comma-separated string of available days
}

// Get current user profile
export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?._id).select('-password -__v');
    if (!user) {
      throw new NotFoundError('User not found');
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// Get all users
export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({})
      .select('-password -__v')
      .sort({ createdAt: -1 });
    
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
export const getUserById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id).select('-password -__v');
    if (!user) {
      throw new NotFoundError('User not found');
    }
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// Update user role
export const updateUserRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;
    
    if (!['Admin', 'Teacher', 'Parent'].includes(role)) {
      throw new BadRequestError('Invalid role');
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({ 
      success: true, 
      message: 'User role updated successfully',
      user: user.toObject()
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateUserProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, email, phoneNumber, address, dateOfBirth } = req.body;
    const userId = req.params.id || req.user?._id;

    const updates: Partial<IUser> = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phoneNumber) updates.phoneNumber = phoneNumber;
    if (address) updates.address = address;
    if (dateOfBirth) updates.dateOfBirth = new Date(dateOfBirth);

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true
    }).select('-password -__v');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user 
    });
  } catch (error) {
    next(error);
  }
};

// Delete user
export const deleteUserHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Clean up profile picture if exists
    if (user.profilePictureUrl) {
      try {
        await deleteFile(user.profilePictureUrl);
      } catch (error) {
        console.error('Error deleting profile picture:', error);
      }
    }

    res.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    next(error);
  }
};

// Upload profile picture
type AuthRequestHandler = (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;

export const uploadProfilePictureHandler: [
  ExpressRequestHandler,
  AuthRequestHandler
] = [
  uploadProfilePicture.single('profilePicture'),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new BadRequestError('Please upload a file');
      }

      const userId = req.params.id || req.user?._id;
      if (!userId) {
        throw new BadRequestError('User ID is required');
      }

      // Get the current user to check permissions
      const currentUser = await User.findById(req.user?._id);
      if (!currentUser) {
        throw new NotFoundError('Current user not found');
      }

      // Only allow admins or the user themselves to update the profile picture
      if (currentUser.role !== 'Admin' && userId.toString() !== currentUser._id?.toString()) {
        throw new ForbiddenError('Not authorized to update this profile');
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // If there's an existing profile picture, delete it
      if (user.profilePictureUrl && !user.profilePictureUrl.startsWith('http')) {
        try {
          await deleteFile(user.profilePictureUrl);
        } catch (error) {
          console.error('Error deleting old profile picture:', error);
          // Continue even if deletion fails
        }
      }

      // Update user with new profile picture URL
      const fileUrl = `/uploads/profile-pictures/${req.file.filename}`;
      user.profilePictureUrl = fileUrl;
      await user.save();

      // Generate full URL for the response
      const fullFileUrl = getFileUrl(req, fileUrl);
      if (!fullFileUrl) {
        throw new Error('Failed to generate file URL');
      }

      res.json({
        success: true,
        data: {
          profilePictureUrl: fullFileUrl
        }
      });
    } catch (error) {
      // Clean up the uploaded file if there was an error
      if (req.file) {
        try {
          const filePath = path.join(process.cwd(), 'uploads', 'profile-pictures', req.file.filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
      }
      next(error);
    }
  }
];

// Bulk create users from CSV
export const bulkCreateUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new BadRequestError('No file uploaded'));
  }

  try {
    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const results = await userService.bulkCreateUsersFromCSV(fileContent);
    
    // Clean up the uploaded file
    try {
      await fs.promises.unlink(filePath);
    } catch (err) {
      console.error('Error cleaning up file:', err);
    }

    res.status(201).json({
      success: true,
      message: 'Users created successfully',
      data: results
    });
  } catch (error: unknown) {
    // Clean up the uploaded file in case of error
    if (req.file) {
      try {
        await fs.promises.unlink(req.file.path);
      } catch (err) {
        console.error('Error cleaning up file:', err);
      }
    }
    
    if (error instanceof Error) {
      next(error);
    } else {
      next(new Error('An unknown error occurred during bulk user creation'));
    }
  }
};

// Create family
export const createFamily = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { familyName, primaryContactId, members } = req.body;
    
    if (!familyName) {
      throw new BadRequestError('Family name is required');
    }
    
    const family = await userService.createFamily({
      familyName,
      primaryContact: primaryContactId,
      members: members || []
    });

    res.status(201).json({
      success: true,
      message: 'Family created successfully',
      data: family
    });
  } catch (error) {
    next(error);
  }
};

// Add family members
export const addFamilyMembers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { familyId } = req.params;
    const { memberIds } = req.body;

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      throw new BadRequestError('At least one member ID is required');
    }

    const family = await userService.addFamilyMembers(familyId, memberIds);

    res.json({
      success: true,
      message: 'Family members added successfully',
      data: family
    });
  } catch (error) {
    next(error);
  }
};

// Remove family member
export const removeFamilyMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { familyId, userId } = req.params;
    
    const family = await userService.removeFamilyMember(familyId, userId);

    res.json({
      success: true,
      message: 'Family member removed successfully',
      data: family
    });
  } catch (error) {
    next(error);
  }
};

// Get family details
export const getFamilyDetails = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { familyId } = req.params;
    
    const family = await Family.findById(familyId)
      .populate('primaryContact', 'name email phoneNumber')
      .populate('members', 'name email role profilePictureUrl');

    if (!family) {
      throw new NotFoundError('Family not found');
    }

    res.json({
      success: true,
      data: family
    });
  } catch (error) {
    next(error);
  }
};

// Get teachers
export const getTeachers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const teachers = await User.find({ role: 'Teacher' })
      .select('-password -__v -createdAt -updatedAt')
      .sort({ name: 1 });

    res.json({ users: teachers });
  } catch (error) {
    next(error);
  }
};

// Create user
export const createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role, phoneNumber, address, dateOfBirth } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      throw new BadRequestError('Name, email, and password are required');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError('User with this email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'Parent',
      phoneNumber,
      address,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined
    });

    await user.save();

    // Remove sensitive data before sending response
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.__v;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userObj
    });
  } catch (error) {
    next(error);
  }
};

// Update my availability
export const updateMyAvailability = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { availability } = req.body;
    
    if (!availability || !Array.isArray(availability)) {
      throw new BadRequestError('Availability array is required');
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { availability },
      { new: true, runValidators: true }
    ).select('-password -__v');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({
      success: true,
      message: 'Availability updated successfully',
      data: user.availability
    });
  } catch (error) {
    next(error);
  }
};

export const registerPushToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    if (!token) {
      throw new BadRequestError('Token is required');
    }
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { $addToSet: { pushTokens: token } },
      { new: true }
    );
    if (!user) {
      throw new NotFoundError('User not found');
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
