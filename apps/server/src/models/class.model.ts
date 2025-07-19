import { Schema, model, Document } from 'mongoose';

export interface IClass extends Document {
  name: string;
  ageRange: string;
  capacity: number;
  description?: string;
}

const classSchema = new Schema<IClass>({
  name: { type: String, required: true },
  ageRange: { type: String, required: true },
  capacity: { type: Number, required: true },
  description: { type: String },
}, { timestamps: true });

const Class = model<IClass>('Class', classSchema);

export default Class;

