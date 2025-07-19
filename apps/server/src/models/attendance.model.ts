import { Schema, model, Document } from 'mongoose';

export interface IAttendance extends Document {
  schedule: Schema.Types.ObjectId;
  child: Schema.Types.ObjectId;
  status: 'Present' | 'Absent';
  notes?: string;
  markedBy: Schema.Types.ObjectId;
}

const attendanceSchema = new Schema<IAttendance>({
  schedule: { type: Schema.Types.ObjectId, ref: 'Schedule', required: true },
  child: { type: Schema.Types.ObjectId, ref: 'Child', required: true },
  status: { type: String, enum: ['Present', 'Absent'], required: true },
  notes: { type: String },
  markedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const Attendance = model<IAttendance>('Attendance', attendanceSchema);

export default Attendance;

