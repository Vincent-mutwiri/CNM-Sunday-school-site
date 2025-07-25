import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user.model';

export interface AuthRequest extends Request {
  user?: IUser & {
    _id: Types.ObjectId;
  };
}

type UserRole = 'Admin' | 'Teacher' | 'Parent';

const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Alias for authMiddleware for backward compatibility
const authenticateToken = authMiddleware;

const requireRole = (roles: UserRole | UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const userRoles = Array.isArray(roles) ? roles : [roles];
    if (!userRoles.includes(req.user.role as UserRole)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    next();
  };
};

export { authMiddleware, authenticateToken, requireRole };
