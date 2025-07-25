import { Response } from 'express';
import GalleryImage from '../models/galleryImage.model';
import { AuthRequest } from '../middleware/authMiddleware';

export const uploadGalleryImage = async (req: AuthRequest, res: Response) => {
  try {
    const { caption, eventId, classId } = req.body;
    const uploadedBy = req.user!._id;

    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const { path: secure_url, filename: public_id } = req.file as any;

    const galleryImage = new GalleryImage({
      secure_url,
      public_id,
      caption,
      event: eventId || undefined,
      class: classId || undefined,
      uploadedBy,
      status: 'Pending'
    });

    await galleryImage.save();

    const populatedImage = await GalleryImage.findById(galleryImage._id)
      .populate('uploadedBy', 'name')
      .populate('event', 'title type')
      .populate('class', 'name ageRange');

    res.status(201).json({ 
      message: 'Image uploaded successfully', 
      image: populatedImage 
    });
  } catch (error) {
    console.error('Upload gallery image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getApprovedImages = async (req: AuthRequest, res: Response) => {
  try {
    const { eventId, classId } = req.query;
    
    let filter: any = { status: 'Approved' };
    
    if (eventId) {
      filter.event = eventId;
    }
    
    if (classId) {
      filter.class = classId;
    }

    const images = await GalleryImage.find(filter)
      .populate('uploadedBy', 'name')
      .populate('event', 'title type')
      .populate('class', 'name ageRange')
      .sort({ createdAt: -1 });

    res.json({ images });
  } catch (error) {
    console.error('Get approved images error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPendingImages = async (req: AuthRequest, res: Response) => {
  try {
    const images = await GalleryImage.find({ status: 'Pending' })
      .populate('uploadedBy', 'name email')
      .populate('event', 'title type')
      .populate('class', 'name ageRange')
      .sort({ createdAt: -1 });

    res.json({ images });
  } catch (error) {
    console.error('Get pending images error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateImageStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const image = await GalleryImage.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('uploadedBy', 'name email')
     .populate('event', 'title type')
     .populate('class', 'name ageRange');

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.json({ 
      message: `Image ${status.toLowerCase()} successfully`, 
      image 
    });
  } catch (error) {
    console.error('Update image status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

