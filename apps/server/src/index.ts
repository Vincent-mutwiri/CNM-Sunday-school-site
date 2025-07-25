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
import analyticsRoutes from './routes/analyticsRoutes';
import reportRoutes from './routes/reportRoutes';
import { errorHandler } from './utils/errors';
import { startAnnouncementJob } from './jobs/announcementJob';

// Load environment variables
dotenv.config();

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000', // Production client
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

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
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
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', analyticsRoutes);

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
    console.log(`🔌 Connecting to database...`);
    
    await connectDB();
    
    server.listen(PORT, () => {
      console.log(`
================================================
✅ Server is running on port ${PORT}
📡 API URL: http://localhost:${PORT}/api
📚 API Documentation: http://localhost:${PORT}/api-docs
================================================
`);
      startAnnouncementJob();
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

