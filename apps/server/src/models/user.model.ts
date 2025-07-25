import { Schema, model, Document, Types } from 'mongoose';

/**
 * Represents a User in the system.
 * This interface defines the structure for a user document, including all potential fields
 * for different roles (Admin, Teacher, Parent).
 */
export interface IUser extends Document {
  // --- Core Information ---
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string; // Hashed, not selected by default
  role: 'Admin' | 'Teacher' | 'Parent';

  // --- Relational IDs ---
  children: Types.ObjectId[];
  familyMembers: Types.ObjectId[];
  familyId?: Types.ObjectId;

  // --- Profile Details ---
  profilePictureUrl: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: Date;

  // --- Teacher-Specific Fields ---
  qualifications: string[];
  weeklyAvailability: {
    monday: string[];
    tuesday: string[];
    wednesday: string[];
    thursday: string[];
    friday: string[];
    saturday: string[];
    sunday: string[];
  };
  
  // --- Technical / System Fields ---
  pushTokens: string[]; // For mobile push notifications
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
}

const userSchema = new Schema<IUser>({
  // --- Core Information ---
  name: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    lowercase: true, 
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'], 
    select: false, // Prevents password from being sent in queries by default
    minlength: [8, 'Password must be at least 8 characters long']
  },
  role: { 
    type: String, 
    enum: ['Admin', 'Teacher', 'Parent'], 
    default: 'Parent' 
  },
  
  // --- Relational IDs ---
  children: [{ type: Schema.Types.ObjectId, ref: 'Child' }],
  familyMembers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  familyId: { type: Schema.Types.ObjectId, ref: 'Family' },
  
  // --- Profile Details ---
  profilePictureUrl: { type: String, default: '/images/default-avatar.png' },
  phoneNumber: { type: String, trim: true },
  address: { type: String, trim: true },
  dateOfBirth: { type: Date },

  // --- Teacher-Specific Fields ---
  qualifications: { type: [String], default: [] },
  weeklyAvailability: {
    monday:    { type: [String], default: [] },
    tuesday:   { type: [String], default: [] },
    wednesday: { type: [String], default: [] },
    thursday:  { type: [String], default: [] },
    friday:    { type: [String], default: [] },
    saturday:  { type: [String], default: [] },
    sunday:    { type: [String], default: [] },
  },
  
  // --- Technical / System Fields ---
  pushTokens: [{ type: String }],

}, { 
  timestamps: true,
  // Ensure password is not returned even if explicitly selected
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// =================================================================
// Indexes for better query performance
// =================================================================
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ familyId: 1 });
userSchema.index({ pushTokens: 1 }); // Index for finding users by push token

const User = model<IUser>('User', userSchema);

export default User;