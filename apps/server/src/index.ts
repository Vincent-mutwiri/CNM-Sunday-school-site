import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';

import { connectDB } from './utils/database';

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/user.routes';
import childRoutes from './routes/childRoutes';
import classRoutes from './routes/classRoutes';
import scheduleRoutes from './routes/scheduleRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import resourceRoutes from './routes/resourceRoutes';
import eventRoutes from './routes/eventRoutes';
import galleryRoutes from './routes/galleryRoutes';
import settingsRoutes from './routes/settingsRoutes';
// New routes
import gradeRoutes from './routes/gradeRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import communicationRoutes from './routes/communicationRoutes';
import volunteerRoutes from './routes/volunteerRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import { errorHandler } from './utils/errors';

// Load environment variables
dotenv.config();

// CORS configuration
const isDevelopment = process.env.NODE_ENV !== 'production';
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'http://127.0.0.1:5173', // Vite dev server (alternative)
  'http://localhost:3000', // Common React dev server
  'http://127.0.0.1:3000', // Common React dev server (alternative)
  process.env.CLIENT_URL   // Environment variable for production
].filter((origin): origin is string => Boolean(origin)); // Remove any undefined values and ensure string[] type

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// CORS middleware configuration
app.use((req, res, next) => {
  // Get the origin of the request
  const origin = req.headers.origin;
  
  // In development, allow all origins for easier development
  if (isDevelopment) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    return next();
  }
  
  // In production, use the strict CORS policy
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
  } else if (origin) {
    // Origin not allowed
    return res.status(403).json({ error: 'Not allowed by CORS' });
  }
  
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/children', childRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/settings', settingsRoutes);
// New routes
app.use('/api/grades', gradeRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/communications', communicationRoutes);
app.use('/api/volunteer-slots', volunteerRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Not Found',
    error: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use(errorHandler);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available globally for controllers
declare global {
  var io: Server;
}
global.io = io;

// Connect to database and start server
const startServer = async () => {
  try {
    console.log('🚀 Starting Sunday School Management System Server...');
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('🔌 Connecting to database...');
    
    await connectDB();
    
    server.listen(PORT, () => {
      console.log(`
================================================
✅ Server is running on port ${PORT}
📡 API URL: http://localhost:${PORT}/api
📚 API Documentation: http://localhost:${PORT}/api-docs
================================================
`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err: Error) => {
      console.error('❌ Unhandled Rejection:', err);
      // Close server & exit process
      server.close(() => process.exit(1));
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err: Error) => {
      console.error('❌ Uncaught Exception:', err);
      // Close server & exit process
      server.close(() => process.exit(1));
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

// Start the server
startServer().catch(err => {
  console.error('❌ Fatal error during server startup:', err);
  process.exit(1);
});

