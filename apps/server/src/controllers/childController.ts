import { Response } from 'express';
import Child from '../models/child.model';
import User from '../models/user.model';
import { AuthRequest } from '../middleware/authMiddleware';

export const registerChild = async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, dateOfBirth, allergies, specialNotes } = req.body;
    const parentId = req.user!._id;

    const child = new Child({
      firstName,
      lastName,
      dateOfBirth,
      parent: parentId,
      allergies,
      specialNotes
    });

    await child.save();

    // Add child to parent's children array
    await User.findByIdAndUpdate(parentId, {
      $push: { children: child._id }
    });

    res.status(201).json({ message: 'Child registered successfully', child });
  } catch (error) {
    console.error('Register child error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyChildren = async (req: AuthRequest, res: Response) => {
  try {
    const parentId = req.user!._id;
    const children = await Child.find({ parent: parentId }).populate('assignedClass');
    res.json({ children });
  } catch (error) {
    console.error('Get my children error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateChild = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const parentId = req.user!._id;
    const updates = req.body;

    // Ensure parent can only update their own children
    const child = await Child.findOne({ _id: id, parent: parentId });
    if (!child) {
      return res.status(404).json({ message: 'Child not found or access denied' });
    }

    const updatedChild = await Child.findByIdAndUpdate(id, updates, { new: true });
    res.json({ message: 'Child updated successfully', child: updatedChild });
  } catch (error) {
    console.error('Update child error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteChild = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const parentId = req.user!._id;

    // Ensure parent can only delete their own children
    const child = await Child.findOne({ _id: id, parent: parentId });
    if (!child) {
      return res.status(404).json({ message: 'Child not found or access denied' });
    }

    await Child.findByIdAndDelete(id);

    // Remove child from parent's children array
    await User.findByIdAndUpdate(parentId, {
      $pull: { children: id }
    });

    res.json({ message: 'Child deleted successfully' });
  } catch (error) {
    console.error('Delete child error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getChildrenByClass = async (req: AuthRequest, res: Response) => {
  try {
    const { classId } = req.params;
    const children = await Child.find({ assignedClass: classId }).populate('parent', 'name email');
    res.json({ children });
  } catch (error) {
    console.error('Get children by class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

