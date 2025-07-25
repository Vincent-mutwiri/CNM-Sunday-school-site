import { Schema, model, Document, Types } from 'mongoose';

export interface IVolunteerSlot extends Document {
  event: Types.ObjectId;
  title: string;
  slotsAvailable: number;
  volunteers: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const volunteerSlotSchema = new Schema<IVolunteerSlot>({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  title: { type: String, required: true },
  slotsAvailable: { type: Number, required: true },
  volunteers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

// Indexes for better query performance
volunteerSlotSchema.index({ event: 1 });

const VolunteerSlot = model<IVolunteerSlot>('VolunteerSlot', volunteerSlotSchema);

export default VolunteerSlot;