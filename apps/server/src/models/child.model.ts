import { Schema, model, Document } from 'mongoose';

export interface IChild extends Document {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  parent: Schema.Types.ObjectId;
  assignedClass?: Schema.Types.ObjectId;
  allergies?: string;
  specialNotes?: string;
}

const childSchema = new Schema<IChild>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  parent: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedClass: { type: Schema.Types.ObjectId, ref: 'Class' },
  allergies: { type: String },
  specialNotes: { type: String },
}, { timestamps: true });

const Child = model<IChild>('Child', childSchema);

export default Child;

