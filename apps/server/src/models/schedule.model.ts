import { Schema, model, Document } from 'mongoose';

export interface ISchedule extends Document {
  class: Schema.Types.ObjectId;
  teacher: Schema.Types.ObjectId;
  students: Schema.Types.ObjectId[];
  date: Date;
  room?: string;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    count?: number;
    until?: Date;
  };
}

const scheduleSchema = new Schema<ISchedule>({
  class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{ type: Schema.Types.ObjectId, ref: 'Child' }],
  date: { type: Date, required: true },
  room: { type: String },
  recurrence: {
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
    interval: { type: Number, default: 1 },
    count: { type: Number },
    until: { type: Date }
  },
}, { timestamps: true });

const Schedule = model<ISchedule>('Schedule', scheduleSchema);

export default Schedule;

