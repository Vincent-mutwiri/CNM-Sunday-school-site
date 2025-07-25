import { Schema, model, Document, Types } from 'mongoose';

export interface IAppointmentRequest extends Document {
  parent: Types.ObjectId;
  teacher: Types.ObjectId;
  reason: string;
  proposedDate: Date;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: Date;
  updatedAt: Date;
}

const appointmentRequestSchema = new Schema<IAppointmentRequest>({
  parent: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  proposedDate: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
}, { timestamps: true });

// Indexes for better query performance
appointmentRequestSchema.index({ parent: 1 });
appointmentRequestSchema.index({ teacher: 1 });
appointmentRequestSchema.index({ status: 1 });

const AppointmentRequest = model<IAppointmentRequest>('AppointmentRequest', appointmentRequestSchema);

export default AppointmentRequest;