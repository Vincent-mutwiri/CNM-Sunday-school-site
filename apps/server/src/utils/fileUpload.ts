import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';
import fs from 'fs';

// Define the type for the file filter function
type FileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => void;

// File filter for image uploads
export const imageFilter: FileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'));
  }
};

// Configure storage for profile pictures
export const profilePictureStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'profile-pictures');
    // Create directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

// Configure multer for file uploads
export const uploadProfilePicture = multer({
  storage: profilePictureStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Generate file URL based on the request
export const getFileUrl = (req: Request, filename: string, basePath: string = 'uploads'): string => {
  if (!filename) return '';
  
  // If it's already a full URL, return as is
  if (filename.startsWith('http')) {
    return filename;
  }
  
  // Construct the full URL
  const protocol = req.secure ? 'https' : 'http';
  const host = req.get('host');
  
  // Remove any leading slashes from the filename
  const cleanFilename = filename.replace(/^\/+/, '');
  
  return `${protocol}://${host}/${basePath}/${cleanFilename}`;
};

// Promisify fs functions
const accessAsync = promisify(fs.access);
const unlinkAsync = promisify(fs.unlink);

// Delete file from the file system
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    // Resolve the full path
    const fullPath = path.join(process.cwd(), filePath);
    
    try {
      // Check if file exists
      await accessAsync(fullPath, fs.constants.F_OK);
    } catch (err: unknown) {
      // File doesn't exist, nothing to delete
      if (err instanceof Error && 'code' in err && err.code === 'ENOENT') {
        return;
      }
      throw err;
    }
    
    // Delete the file
    await unlinkAsync(fullPath);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};
