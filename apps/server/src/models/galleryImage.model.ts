import { Schema, model, Document } from 'mongoose';

export interface IGalleryImage extends Document {
  secure_url: string;
  public_id: string;
  caption?: string;
  event?: Schema.Types.ObjectId;
  class?: Schema.Types.ObjectId;
  uploadedBy: Schema.Types.ObjectId;
  status: 'Pending' | 'Approved' | 'Rejected';
}

const galleryImageSchema = new Schema<IGalleryImage>({
  secure_url: { type: String, required: true },
  public_id: { type: String, required: true },
  caption: { type: String },
  event: { type: Schema.Types.ObjectId, ref: 'Event' },
  class: { type: Schema.Types.ObjectId, ref: 'Class' },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
}, { timestamps: true });

const GalleryImage = model<IGalleryImage>('GalleryImage', galleryImageSchema);

export default GalleryImage;

