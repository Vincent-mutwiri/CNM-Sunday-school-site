import { Schema, model, Document, Types } from 'mongoose';
import { IUser } from './user.model';

export interface IResource extends Document {
  title: string;
  description?: string;
  type: 'Lesson Plan' | 'Song' | 'Video' | 'Craft';
  fileUrl: string;
  uploadedBy: Types.ObjectId | IUser;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: Types.ObjectId | IUser;
  // Sharing capabilities
  isShared: boolean;
  sharedWith: Types.ObjectId[];
}

const resourceSchema = new Schema<IResource>({
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['Lesson Plan', 'Song', 'Video', 'Craft'], required: true },
  fileUrl: { type: String, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  // Sharing capabilities
  isShared: { type: Boolean, default: false },
  sharedWith: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const Resource = model<IResource>('Resource', resourceSchema);

export default Resource;

