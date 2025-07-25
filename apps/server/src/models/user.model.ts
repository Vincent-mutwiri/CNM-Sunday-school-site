import { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string; // Password will be hashed and not selected by default
  role: 'Admin' | 'Teacher' | 'Parent';
  children: Types.ObjectId[];
  familyMembers: Types.ObjectId[];
  familyId?: Types.ObjectId;
  profilePictureUrl: string;
  availability: string[];
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: Date;
  // Teacher-specific fields
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
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  password: { 
    type: String, 
    required: true, 
    select: false,
    minlength: [8, 'Password must be at least 8 characters long']
  },
  role: { 
    type: String, 
    enum: ['Admin', 'Teacher', 'Parent'], 
    default: 'Parent' 
  },
  children: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Child' 
  }],
  familyMembers: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  familyId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Family' 
  },
  profilePictureUrl: { 
    type: String, 
    default: '/images/default-avatar.png' 
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  availability: { 
    type: [String], 
    default: [] 
  },
  // Teacher-specific fields
  qualifications: { 
    type: [String], 
    default: [] 
  },
  weeklyAvailability: {
    monday: { type: [String], default: [] },
    tuesday: { type: [String], default: [] },
    wednesday: { type: [String], default: [] },
    thursday: { type: [String], default: [] },
    friday: { type: [String], default: [] },
    saturday: { type: [String], default: [] },
    sunday: { type: [String], default: [] },
  },
}, { 
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ familyId: 1 });

const User = model<IUser>('User', userSchema);

export default User;

