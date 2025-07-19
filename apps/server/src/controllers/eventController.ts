import { Response } from 'express';
import Event from '../models/event.model';
import { AuthRequest } from '../middleware/authMiddleware';

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { title, type, description, date } = req.body;
    const createdBy = req.user!._id;

    const event = new Event({
      title,
      type,
      description,
      date: new Date(date),
      createdBy
    });

    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'name role');

    // TODO: Emit socket event for real-time notifications
    // io.emit('new_announcement', populatedEvent);

    res.status(201).json({ 
      message: 'Event created successfully', 
      event: populatedEvent 
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllEvents = async (req: AuthRequest, res: Response) => {
  try {
    const { type, startDate, endDate } = req.query;
    
    let filter: any = {};
    
    if (type) {
      filter.type = type;
    }
    
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    } else {
      // Default to upcoming events
      filter.date = { $gte: new Date() };
    }

    const events = await Event.find(filter)
      .populate('createdBy', 'name role')
      .sort({ date: 1 });

    res.json({ events });
  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.date) {
      updates.date = new Date(updates.date);
    }

    const event = await Event.findByIdAndUpdate(id, updates, { new: true })
      .populate('createdBy', 'name role');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event updated successfully', event });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const event = await Event.findByIdAndDelete(id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

