import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import cloudinary from '../utils/cloudinary';

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'gallery' } as any
});

export const cloudinaryUpload = multer({ storage });
