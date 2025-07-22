import { Schema, model, Document, Types } from 'mongoose';

export interface IFamily extends Document {
  familyName: string;
  primaryContact: Types.ObjectId;
  members: Types.ObjectId[];
  address?: string;
  phoneNumber?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  __v?: number; // Added to fix TypeScript error
}

const familySchema = new Schema<IFamily>({
  familyName: { 
    type: String, 
    required: true,
    trim: true
  },
  primaryContact: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  address: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  emergencyContact: {
    name: {
      type: String,
      trim: true
    },
    relationship: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  notes: {
    type: String,
    trim: true
  }
}, { 
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      const transformed = { ...ret } as any;
      transformed.id = transformed._id.toString();
      delete transformed._id;
      delete transformed.__v;
      return transformed;
    }
  }
});

// Indexes for better query performance
familySchema.index({ familyName: 1 });
familySchema.index({ primaryContact: 1 });
familySchema.index({ 'emergencyContact.phone': 1 });

const Family = model<IFamily>('Family', familySchema);

export default Family;
