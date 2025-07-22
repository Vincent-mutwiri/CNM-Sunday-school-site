import { Schema, model, Document } from 'mongoose';

export interface ISchedule extends Document {
  class: Schema.Types.ObjectId;
  teacher: Schema.Types.ObjectId;
  students: Schema.Types.ObjectId[];
  date: Date;
  room?: string;
}

const scheduleSchema = new Schema<ISchedule>({
  class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{ type: Schema.Types.ObjectId, ref: 'Child' }],
  date: { type: Date, required: true },
  room: { type: String },
}, { timestamps: true });

const Schedule = model<ISchedule>('Schedule', scheduleSchema);

export default Schedule;

