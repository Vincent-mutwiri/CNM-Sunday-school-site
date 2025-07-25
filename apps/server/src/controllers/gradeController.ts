import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Grade from '../models/grade.model';
import Class from '../models/class.model';
import Child from '../models/child.model';
import { IUser } from '../models/user.model';
import { Types } from 'mongoose';

// Create a new grade entry
export const createGrade = async (req: AuthRequest, res: Response) => {
  try {
    const { student, class: classId, assignmentTitle, grade, notes, date } = req.body;
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const teacher = req.user;

    // Verify that the student exists and belongs to the class
    const studentDoc = await Child.findById(student);
    if (!studentDoc) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if the teacher is assigned to this class
    if (classDoc.teacher.toString() !== teacher._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to grade students in this class' });
    }

    // Check if the student is enrolled in this class
    const studentIds = Array.isArray(classDoc.students) 
      ? classDoc.students.map(s => s.toString())
      : [];
      
    if (!studentIds.includes((studentDoc._id as Types.ObjectId).toString())) {
      return res.status(400).json({ message: 'Student is not enrolled in this class' });
    }

    const newGrade = new Grade({
      student,
      class: classId,
      teacher: teacher._id,
      assignmentTitle,
      grade,
      notes,
      date
    });

    await newGrade.save();

    res.status(201).json({
      message: 'Grade created successfully',
      grade: newGrade
    });
  } catch (error) {
    console.error('Error creating grade:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all grades for a specific class
export const getGradesByClass = async (req: AuthRequest, res: Response) => {
  try {
    const { classId } = req.params;
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const teacher = req.user;

    // Verify that the class exists
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if the teacher is assigned to this class
    if (classDoc.teacher.toString() !== teacher._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view grades for this class' });
    }

    // Get all grades for this class
    const grades = await Grade.find({ class: classId })
      .populate('student', 'name')
      .sort({ date: -1 });

    res.json(grades);
  } catch (error) {
    console.error('Error fetching grades by class:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all grades for a specific child
export const getGradesByChild = async (req: AuthRequest, res: Response) => {
  try {
    const { childId } = req.params;
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const parent = req.user;

    // Verify that the child exists and belongs to the parent
    const child = await Child.findOne({ _id: childId, parents: parent._id });
    if (!child) {
      return res.status(404).json({ message: 'Child not found or not authorized' });
    }

    // Get all grades for this child
    const grades = await Grade.find({ student: childId })
      .populate('class', 'name')
      .sort({ date: -1 });

    res.json(grades);
  } catch (error) {
    console.error('Error fetching grades by child:', error);
    res.status(500).json({ message: 'Server error' });
  }
};