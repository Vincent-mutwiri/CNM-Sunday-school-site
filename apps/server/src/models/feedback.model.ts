import { Schema, model, Document, Types } from 'mongoose';

export interface IFeedback extends Document {
  parent: Types.ObjectId;
  teacher: Types.ObjectId;
  class?: Types.ObjectId;
  rating: number;
  comments?: string;
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema<IFeedback>({
  parent: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  class: { type: Schema.Types.ObjectId, ref: 'Class' },
  rating: { type: Number, min: 1, max: 5, required: true },
  comments: { type: String },
}, { timestamps: true });

// Indexes for better query performance
feedbackSchema.index({ parent: 1 });
feedbackSchema.index({ teacher: 1 });
feedbackSchema.index({ class: 1 });

const Feedback = model<IFeedback>('Feedback', feedbackSchema);

export default Feedback;