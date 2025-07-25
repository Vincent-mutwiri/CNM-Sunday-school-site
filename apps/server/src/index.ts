import express from 'express';
import cors, { CorsOptions } from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';

import { connectDB } from './utils/database';
import { errorHandler } from './utils/errors';
import { startAnnouncementJob } from './jobs/announcementJob';

// =================================================================
// 1. IMPORT ALL ROUTES (MERGED FROM BOTH BRANCHES)
// =================================================================

// Core Routes
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

// Phase 2: Teacher/Parent Enhancement Routes
import gradeRoutes from './routes/gradeRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import communicationRoutes from './routes/communicationRoutes';
import volunteerRoutes from './routes/volunteerRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

// Phase 3: Analytics & Reporting Routes
import analyticsRoutes from './routes/analyticsRoutes';
import reportRoutes from './routes/reportRoutes';


// =================================================================
// 2. INITIAL SETUP & CONFIGURATION
// =================================================================

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// Define allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'http://127.0.0.1:5173',
  'http://localhost:3000', // Common React dev server
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL,  // Production frontend URL
].filter(Boolean) as string[]; // Filter out undefined/null values

// Refactored CORS options for cleaner implementation
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests) in dev
    if (!origin && process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    if (origin && allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

const io = new Server(server, {
  cors: corsOptions, // Use the same CORS options for Socket.IO
});


// =================================================================
// 3. EXPRESS MIDDLEWARE
// =================================================================

app.use(cors(corsOptions)); // Use the cors middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// =================================================================
// 4. API ROUTE MOUNTING (MERGED & ORGANIZED)
// =================================================================

// --- Core Features ---
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

// --- Phase 2 Features (Teacher/Parent Enhancements) ---
app.use('/api/grades', gradeRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/communications', communicationRoutes); // Note: Renamed from 'communication' for consistency
app.use('/api/volunteer-slots', volunteerRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/dashboard', dashboardRoutes);

// --- Phase 3 Features (Analytics & Reporting) ---
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', analyticsRoutes);

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});


// =================================================================
// 5. ERROR HANDLING & SOCKET.IO SETUP
// =================================================================

// 404 Handler for non-existent API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: `API endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler (must be last)
app.use(errorHandler);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`[Socket.IO] User connected: ${socket.id}`);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`[Socket.IO] User ${socket.id} joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] User disconnected: ${socket.id}`);
  });
});

// Make `io` available to other modules (e.g., controllers)
// This is a simple approach. Dependency injection is a more advanced alternative.
declare global {
  var io: Server;
}
global.io = io;


// =================================================================
// 6. SERVER STARTUP LOGIC
// =================================================================

const startServer = async () => {
  try {
    console.log('🚀 Starting Sunday School Management System Server...');
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    console.log('🔌 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected successfully.');
    
    server.listen(PORT, () => {
      console.log(`\n================================================`);
      console.log(`✅ Server is listening on http://localhost:${PORT}`);
      console.log(`================================================\n`);
      // Start background jobs after the server is running
      startAnnouncementJob();
    });

  } catch (error) {
    console.error('❌ Fatal error during server startup:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

// Graceful shutdown handlers
process.on('unhandledRejection', (reason: Error) => {
  console.error('❌ Unhandled Rejection:', reason.name, reason.message);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err: Error) => {
  console.error('❌ Uncaught Exception:', err.name, err.message);
  server.close(() => process.exit(1));
});

// Initiate server startup
startServer();