import { Schema, model, Document, Types } from 'mongoose';

export interface IGrade extends Document {
  student: Types.ObjectId;
  class: Types.ObjectId;
  teacher: Types.ObjectId;
  assignmentTitle: string;
  grade: string;
  notes?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const gradeSchema = new Schema<IGrade>({
  student: { type: Schema.Types.ObjectId, ref: 'Child', required: true },
  class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignmentTitle: { type: String, required: true },
  grade: { type: String, required: true },
  notes: { type: String },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

// Indexes for better query performance
gradeSchema.index({ student: 1 });
gradeSchema.index({ class: 1 });
gradeSchema.index({ teacher: 1 });

const Grade = model<IGrade>('Grade', gradeSchema);

export default Grade;