import cron from 'node-cron';
import Event from '../models/event.model';

export const startAnnouncementJob = () => {
  cron.schedule('* * * * *', async () => {
    const dueEvents = await Event.find({
      status: 'Scheduled',
      scheduledFor: { $lte: new Date() }
    });

    for (const event of dueEvents) {
      event.status = 'Sent';
      await event.save();
      const populated = await Event.findById(event._id).populate('createdBy', 'name role');
      global.io.emit('new_announcement', populated);
    }
  });
};
