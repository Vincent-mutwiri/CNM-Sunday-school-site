export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Teacher' | 'Parent';
  password?: string;
  profilePictureUrl: string;
  children?: string[] | Child[];
  createdAt: string;
  updatedAt: string;
}

export interface Child {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  parent: string | User;
  assignedClass?: string | Class;
  allergies?: string;
  specialNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChildInput {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  allergies?: string;
  specialNotes?: string;
}

export interface UpdateChildInput extends Partial<Omit<CreateChildInput, 'dateOfBirth'>> {
  dateOfBirth?: string; // Still optional but needs to be handled specially if needed
}

export interface Class {
  _id: string;
  name: string;
  ageRange: string;
  capacity: number;
  description?: string;
  teacher?: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  _id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  class?: string | Class;
  className?: string; // For display purposes when populated
  teacher: string | User;
  students: string[] | Child[];
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  _id: string;
  schedule: string | Schedule;
  child: string | Child;
  status: 'Present' | 'Absent';
  notes?: string;
  markedBy: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  _id: string;
  title: string;
  description?: string;
  type: 'Lesson Plan' | 'Song' | 'Video' | 'Craft';
  fileUrl: string;
  uploadedBy: string | User;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  _id: string;
  title: string;
  type: 'Announcement' | 'Event' | 'Birthday' | 'Memory Verse';
  description?: string;
  date: string;
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryImage {
  _id: string;
  imageUrl: string;
  caption?: string;
  event?: string | Event;
  class?: string | Class;
  uploadedBy: string | User;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
}

export interface Settings {
  _id: string;
  siteName: string;
  siteDescription?: string;
  defaultUserRole: 'Admin' | 'Teacher' | 'Parent';
  createdAt: string;
  updatedAt: string;
}

