import { Schema, model, Document } from 'mongoose';

export interface ISettings extends Document {
  siteName: string;
  siteDescription?: string;
  defaultUserRole: 'Admin' | 'Teacher' | 'Parent';
}

const settingsSchema = new Schema<ISettings>({
  siteName: { type: String, required: true },
  siteDescription: { type: String },
  defaultUserRole: {
    type: String,
    enum: ['Admin', 'Teacher', 'Parent'],
    default: 'Parent'
  }
}, { timestamps: true });

const Settings = model<ISettings>('Settings', settingsSchema);

export default Settings;
