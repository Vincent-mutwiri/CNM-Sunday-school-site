import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import AppointmentRequest from '../models/appointmentRequest.model';
import { IUser } from '../models/user.model';

// Create a new appointment request
export const createAppointmentRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { teacher, reason, proposedDate } = req.body;
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const parent = req.user;

    const newRequest = new AppointmentRequest({
      parent: parent._id,
      teacher,
      reason,
      proposedDate,
      status: 'Pending'
    });

    await newRequest.save();

    res.status(201).json({
      message: 'Appointment request created successfully',
      appointmentRequest: newRequest
    });
  } catch (error) {
    console.error('Error creating appointment request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get appointment requests for a teacher
export const getAppointmentRequestsForTeacher = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const teacher = req.user;

    const requests = await AppointmentRequest.find({ teacher: teacher._id })
      .populate('parent', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching appointment requests:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get appointment requests for a parent
export const getAppointmentRequestsForParent = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const parent = req.user;

    const requests = await AppointmentRequest.find({ parent: parent._id })
      .populate('teacher', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching appointment requests:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update appointment request status
export const updateAppointmentRequestStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const teacher = req.user;

    const request = await AppointmentRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Appointment request not found' });
    }

    // Check if the teacher is the one assigned to this request
    if (request.teacher.toString() !== teacher._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this appointment request' });
    }

    request.status = status;
    await request.save();

    res.status(200).json({
      message: 'Appointment request updated successfully',
      appointmentRequest: request
    });
  } catch (error) {
    console.error('Error updating appointment request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};