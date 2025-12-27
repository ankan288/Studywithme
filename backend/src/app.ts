import express from 'express';
import cors from 'cors';
import { chatRoutes } from './routes/chat.route';
import { assignmentRoutes } from './routes/assignment.route';
import { progressRoutes } from './routes/progress.route';
import { adaptiveRoutes } from './routes/adaptive.route';
import { dashboardRoutes } from './routes/dashboard.route';
import syllabusRoutes from './routes/syllabus.route';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Increased limit for syllabus uploads

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/adaptive', adaptiveRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/syllabus', syllabusRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

export default app;
