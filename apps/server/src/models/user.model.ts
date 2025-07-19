import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Password will be hashed and not selected by default
  role: 'Admin' | 'Teacher' | 'Parent';
  children?: Schema.Types.ObjectId[];
  profilePictureUrl: string;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['Admin', 'Teacher', 'Parent'], default: 'Parent' },
  children: [{ type: Schema.Types.ObjectId, ref: 'Child' }],
  profilePictureUrl: { type: String, default: 'default-avatar-url' },
}, { timestamps: true });

const User = model<IUser>('User', userSchema);

export default User;

