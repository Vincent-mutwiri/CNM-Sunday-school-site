import { Response } from 'express';
import { Schema } from 'mongoose';
import Class, { IClass } from '../models/class.model';
import Child from '../models/child.model';
import { AuthRequest } from '../middleware/authMiddleware';

export const createClass = async (req: AuthRequest, res: Response) => {
  try {
    const { name, ageRange, capacity, description } = req.body;

    const newClass = new Class({
      name,
      ageRange,
      capacity,
      description
    });

    await newClass.save();
    res.status(201).json({ message: 'Class created successfully', class: newClass });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllClasses = async (req: AuthRequest, res: Response) => {
  try {
    const classes = await Class.find();
    res.json({ classes });
  } catch (error) {
    console.error('Get all classes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getClassById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const classData = await Class.findById(id);
    
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Get students assigned to this class
    const students = await Child.find({ assignedClass: id }).populate('parent', 'name email');

    res.json({ 
      class: classData,
      students 
    });
  } catch (error) {
    console.error('Get class by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateClass = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedClass = await Class.findByIdAndUpdate(id, updates, { new: true });
    
    if (!updatedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json({ message: 'Class updated successfully', class: updatedClass });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteClass = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if there are students assigned to this class
    const studentsInClass = await Child.countDocuments({ assignedClass: id });
    
    if (studentsInClass > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete class with assigned students. Please reassign or remove students first.' 
      });
    }
    
    // Remove class assignment from all children
    await Child.updateMany({ assignedClass: id }, { $unset: { assignedClass: 1 } });

    const deletedClass = await Class.findByIdAndDelete(id);
    
    if (!deletedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Interface for the teacher data returned from populate
export interface ITeacherData {
  _id: string;
  name: string;
  email: string;
}

// Interface for the student data returned from populate
interface IStudentData {
  _id: string;
  name: string;
}

// Interface for the populated class document
interface IPopulatedClass extends Omit<IClass, 'teacher' | 'students'> {
  teacher: ITeacherData;
  students: IStudentData[];
  studentCount: number;
}

export const getTeacherClasses = async (req: AuthRequest, res: Response) => {
  try {
    const teacherId = req.user?._id;
    
    if (!teacherId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Find all classes where the teacher is assigned
    const classes = await Class.find({ teacher: teacherId })
      .populate<{ teacher: ITeacherData }>('teacher', 'name email')
      .populate<{ students: IStudentData[] }>('students', 'name')
      .lean()
      .exec() as unknown as Array<Omit<IClass, 'teacher' | 'students'> & { 
        teacher: ITeacherData; 
        students: IStudentData[];
      }>;
      
    // Transform the data to include student count
    const classesWithStudentCount = classes.map(cls => ({
      ...cls,
      studentCount: cls.students?.length || 0
    }));
    
    res.json({ classes: classesWithStudentCount });
  } catch (error) {
    console.error('Get teacher classes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const assignStudentToClass = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // class ID
    const { childId } = req.body;

    // Check if class exists
    const classData = await Class.findById(id);
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if child exists
    const child = await Child.findById(childId);
    if (!child) {
      return res.status(404).json({ message: 'Child not found' });
    }

    // Check class capacity
    const currentStudents = await Child.countDocuments({ assignedClass: id });
    if (currentStudents >= classData.capacity) {
      return res.status(400).json({ message: 'Class is at full capacity' });
    }

    // Assign child to class
    await Child.findByIdAndUpdate(childId, { assignedClass: id });

    res.json({ message: 'Student assigned to class successfully' });
  } catch (error) {
    console.error('Assign student to class error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

