import { Schema, model, Document } from 'mongoose';

export interface IResource extends Document {
  title: string;
  description?: string;
  type: 'Lesson Plan' | 'Song' | 'Video' | 'Craft';
  fileUrl: string;
  uploadedBy: Schema.Types.ObjectId;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: Schema.Types.ObjectId;
}

const resourceSchema = new Schema<IResource>({
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['Lesson Plan', 'Song', 'Video', 'Craft'], required: true },
  fileUrl: { type: String, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Resource = model<IResource>('Resource', resourceSchema);

export default Resource;

