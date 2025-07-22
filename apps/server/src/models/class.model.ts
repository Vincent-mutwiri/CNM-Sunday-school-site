import { Schema, model, Document } from 'mongoose';

export interface IClass extends Document {
  name: string;
  ageRange: string;
  capacity: number;
  description?: string;
  teacher: Schema.Types.ObjectId;
  students: Schema.Types.ObjectId[];
}

const classSchema = new Schema<IClass>({
  name: { type: String, required: true },
  ageRange: { type: String, required: true },
  capacity: { type: Number, required: true },
  description: { type: String },
  teacher: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  students: [{
    type: Schema.Types.ObjectId,
    ref: 'Child'
  }]
}, { timestamps: true });

const Class = model<IClass>('Class', classSchema);

export default Class;

