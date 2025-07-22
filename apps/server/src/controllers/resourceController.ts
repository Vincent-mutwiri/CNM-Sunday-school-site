import { Response } from 'express';
import Resource from '../models/resource.model';
import { AuthRequest } from '../middleware/authMiddleware';

export const uploadResource = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, type } = req.body;
    const teacherId = req.user!._id;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // In a real application, you would upload to cloud storage (Cloudinary, AWS S3, etc.)
    // For now, we'll use the local file path
    const fileUrl = `/uploads/${req.file.filename}`;

    const resource = new Resource({
      title,
      description,
      type,
      fileUrl,
      uploadedBy: teacherId,
      status: 'Pending'
    });

    await resource.save();

    const populatedResource = await Resource.findById(resource._id)
      .populate('uploadedBy', 'name email');

    res.status(201).json({ 
      message: 'Resource uploaded successfully', 
      resource: populatedResource 
    });
  } catch (error) {
    console.error('Upload resource error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getApprovedResources = async (req: AuthRequest, res: Response) => {
  try {
    const { type, ageRange } = req.query;
    
    let filter: any = { status: 'Approved' };
    
    if (type) {
      filter.type = type;
    }

    const resources = await Resource.find(filter)
      .populate('uploadedBy', 'name')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ resources });
  } catch (error) {
    console.error('Get approved resources error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPendingResources = async (req: AuthRequest, res: Response) => {
  try {
    const resources = await Resource.find({ status: 'Pending' })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ resources });
  } catch (error) {
    console.error('Get pending resources error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateResourceStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = req.user!._id;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const resource = await Resource.findByIdAndUpdate(
      id,
      { 
        status,
        approvedBy: status === 'Approved' ? adminId : undefined
      },
      { new: true }
    ).populate('uploadedBy', 'name email')
     .populate('approvedBy', 'name');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json({ 
      message: `Resource ${status.toLowerCase()} successfully`, 
      resource 
    });
  } catch (error) {
    console.error('Update resource status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTeacherResources = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.user!._id;
    
    const resources = await Resource.find({ uploadedBy: teacherId })
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name')
      .populate('approvedBy', 'name');

    res.json({ resources });
  } catch (error) {
    console.error('Get teacher resources error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
