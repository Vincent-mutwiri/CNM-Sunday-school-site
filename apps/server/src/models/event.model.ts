import { Schema, model, Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  type: 'Announcement' | 'Event' | 'Birthday' | 'Memory Verse';
  description?: string;
  date: Date;
  createdBy: Schema.Types.ObjectId;
  scheduledFor?: Date;
  status: 'Draft' | 'Scheduled' | 'Sent';
}

const eventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  type: { type: String, enum: ['Announcement', 'Event', 'Birthday', 'Memory Verse'], required: true },
  description: { type: String },
  date: { type: Date, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledFor: { type: Date, index: true },
  status: { type: String, enum: ['Draft', 'Scheduled', 'Sent'], default: 'Draft' },
}, { timestamps: true });

const Event = model<IEvent>('Event', eventSchema);

export default Event;

