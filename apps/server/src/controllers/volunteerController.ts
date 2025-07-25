import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import VolunteerSlot from '../models/volunteerSlot.model';
import Event from '../models/event.model';
import { IUser } from '../models/user.model';

// Get all available volunteer slots
export const getVolunteerSlots = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  try {
    // Get slots with available positions
    const slots = await VolunteerSlot.find({ slotsAvailable: { $gt: 0 } })
      .populate('event', 'title date')
      .populate('volunteers', 'name');

    res.status(200).json(slots);
  } catch (error) {
    console.error('Error fetching volunteer slots:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Sign up for a volunteer slot
export const signUpForVolunteerSlot = async (req: AuthRequest, res: Response) => {
  try {
    const { slotId } = req.params;
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const user = req.user;

    // Find the volunteer slot
    const slot = await VolunteerSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ message: 'Volunteer slot not found' });
    }

    // Check if there are available slots
    if (slot.slotsAvailable <= 0) {
      return res.status(400).json({ message: 'No slots available' });
    }

    // Check if user is already signed up
    if (slot.volunteers.some(volunteer => volunteer.toString() === user._id.toString())) {
      return res.status(400).json({ message: 'Already signed up for this slot' });
    }

    // Add user to volunteers and decrease available slots
    slot.volunteers.push(user._id as any);
    slot.slotsAvailable -= 1;
    await slot.save();

    res.status(200).json({
      message: 'Successfully signed up for volunteer slot',
      slot
    });
  } catch (error) {
    console.error('Error signing up for volunteer slot:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

interface CreateVolunteerSlotRequest extends AuthRequest {
  body: {
    event: string;
    title: string;
    slotsAvailable: number;
  };
}

// Create a new volunteer slot (admin only)
export const createVolunteerSlot = async (req: CreateVolunteerSlotRequest, res: Response) => {
  try {
    const { event, title, slotsAvailable } = req.body;

    // Verify that the event exists
    const eventDoc = await Event.findById(event);
    if (!eventDoc) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const newSlot = new VolunteerSlot({
      event,
      title,
      slotsAvailable
    });

    await newSlot.save();

    res.status(201).json({
      message: 'Volunteer slot created successfully',
      slot: newSlot
    });
  } catch (error) {
    console.error('Error creating volunteer slot:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};