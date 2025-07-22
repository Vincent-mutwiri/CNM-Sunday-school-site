import { Types } from 'mongoose';
import { parse } from 'csv-parse/sync';
import bcrypt from 'bcryptjs';
import User, { IUser } from '../models/user.model';
import Family from '../models/family.model';
import { NotFoundError, BadRequestError, ValidationError } from '../utils/errors';

export const createUser = async (userData: Partial<IUser>) => {
  const user = new User(userData);
  return await user.save();
};

export const getUserById = async (id: string) => {
  const user = await User.findById(id)
    .populate('children')
    .populate('familyMembers', 'name email profilePictureUrl role')
    .populate('familyId');
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
};

export const updateUser = async (id: string, updateData: Partial<IUser>) => {
  const user = await User.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  )
    .populate('children')
    .populate('familyMembers', 'name email profilePictureUrl role')
    .populate('familyId');
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
};

export const deleteUser = async (id: string) => {
  const user = await User.findByIdAndDelete(id);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  // Remove user from any family they belong to
  await Family.updateMany(
    { $or: [{ members: id }, { primaryContact: id }] },
    { 
      $pull: { members: id },
      $set: { 
        primaryContact: { $cond: [{ $eq: ['$primaryContact', id] }, null, '$primaryContact'] }
      }
    }
  );
  
  return user;
};

export const createFamily = async (familyData: {
  familyName: string;
  primaryContact: string;
  members: string[];
  address?: string;
  phoneNumber?: string;
}) => {
  const session = await User.startSession();
  session.startTransaction();
  
  try {
    // Verify all members exist
    const memberCount = await User.countDocuments({
      _id: { $in: [...familyData.members, familyData.primaryContact] }
    }).session(session);
    
    if (memberCount !== familyData.members.length + 1) {
      throw new BadRequestError('One or more users not found');
    }
    
    // Create the family
    const family = new Family({
      familyName: familyData.familyName,
      primaryContact: familyData.primaryContact,
      members: familyData.members,
      address: familyData.address,
      phoneNumber: familyData.phoneNumber
    });
    
    await family.save({ session });
    
    // Update all members with the family ID
    await User.updateMany(
      { _id: { $in: familyData.members } },
      { $set: { familyId: family._id } },
      { session }
    );
    
    // Update the primary contact
    await User.findByIdAndUpdate(
      familyData.primaryContact,
      { $set: { familyId: family._id } },
      { session }
    );
    
    await session.commitTransaction();
    session.endSession();
    
    return family;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const addFamilyMembers = async (familyId: string, userIds: string[]) => {
  const session = await User.startSession();
  session.startTransaction();
  
  try {
    const family = await Family.findById(familyId).session(session);
    if (!family) {
      throw new NotFoundError('Family not found');
    }
    
    // Add new members
    const newMembers = userIds.filter(id => !family.members.includes(new Types.ObjectId(id)));
    
    if (newMembers.length > 0) {
      family.members.push(...newMembers.map(id => new Types.ObjectId(id)));
      await family.save({ session });
      
      // Update users with family ID
      await User.updateMany(
        { _id: { $in: newMembers } },
        { $set: { familyId: family._id } },
        { session }
      );
    }
    
    await session.commitTransaction();
    session.endSession();
    
    return family.populate('members', 'name email profilePictureUrl role');
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const removeFamilyMember = async (familyId: string, userId: string) => {
  const session = await User.startSession();
  session.startTransaction();
  
  try {
    const family = await Family.findById(familyId).session(session);
    if (!family) {
      throw new NotFoundError('Family not found');
    }
    
    // If user is primary contact, we need to assign a new one
    if (family.primaryContact.toString() === userId) {
      // Find another family member to be primary contact
      const otherMember = family.members.find(
        memberId => memberId.toString() !== userId
      );
      
      if (!otherMember) {
        // No other members, delete the family
        await Family.findByIdAndDelete(familyId).session(session);
      } else {
        // Make the other member the primary contact
        family.primaryContact = otherMember;
        await family.save({ session });
      }
    }
    
    // Remove user from family
    await Family.findByIdAndUpdate(
      familyId,
      { $pull: { members: userId } },
      { session }
    );
    
    // Update user's family reference
    await User.findByIdAndUpdate(
      userId,
      { $unset: { familyId: '' } },
      { session }
    );
    
    await session.commitTransaction();
    session.endSession();
    
    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const searchUsers = async (query: string, excludeIds: string[] = []) => {
  const searchRegex = new RegExp(query, 'i');
  
  return await User.find({
    $and: [
      { _id: { $nin: excludeIds } },
      {
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phoneNumber: searchRegex }
        ]
      }
    ]
  }).select('name email profilePictureUrl role');
};

interface CSVUserRecord {
  name: string;
  email: string;
  password: string;
  role?: 'Admin' | 'Teacher' | 'Parent';
  profilePictureUrl?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  familyName?: string;
  availability?: string;
}

export const bulkCreateUsersFromCSV = async (csvContent: string) => {
  // Parse CSV content
  const records: CSVUserRecord[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  if (!records.length) {
    throw new BadRequestError('CSV file is empty or has no valid data');
  }

  const results = {
    success: 0,
    failed: 0,
    errors: [] as Array<{ row: number; email: string; error: string }>,
  };

  // Process each record
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const rowNumber = i + 2; // +2 because of header row and 0-based index

    try {
      // Validate required fields
      if (!record.name || !record.email || !record.password) {
        throw new ValidationError({
          'name': ['Name is required'],
          'email': ['Email is required'],
          'password': ['Password is required']
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: record.email });
      if (existingUser) {
        throw new ValidationError({
          'email': ['User with this email already exists']
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(record.password, salt);

      // Create user data
      const userData: Partial<IUser> = {
        name: record.name,
        email: record.email,
        password: hashedPassword,
        role: record.role || 'Parent',
        phoneNumber: record.phoneNumber,
        address: record.address,
      };

      // Set date of birth if provided
      if (record.dateOfBirth) {
        userData.dateOfBirth = new Date(record.dateOfBirth);
      }

      // Set availability if provided
      if (record.availability) {
        userData.availability = record.availability
          .split(',')
          .map(day => day.trim())
          .filter(Boolean);
      }

      // Create user
      const user = new User(userData);
      await user.save();
      results.success++;

      // Handle family association if familyName is provided
      if (record.familyName) {
        try {
          let family = await Family.findOne({ familyName: record.familyName });
          
          if (!family) {
            // Create new family if it doesn't exist
            family = new Family({
              familyName: record.familyName,
              primaryContact: user._id as Types.ObjectId,
              members: [user._id as Types.ObjectId],
            });
          } else {
            // Add user to existing family
            const userId = user._id as Types.ObjectId;
            if (!family.members.some(memberId => memberId.equals(userId))) {
              family.members.push(userId);
            }
          }
          
          await family.save();
          
          // Update user with family reference
          user.familyId = family._id as Types.ObjectId;
          await user.save();
        } catch (familyError) {
          console.error(`Error processing family for user ${user.email}:`, familyError);
          // Continue with user creation even if family processing fails
        }
      }
    } catch (error) {
      results.failed++;
      results.errors.push({
        row: rowNumber,
        email: record.email || 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
};
