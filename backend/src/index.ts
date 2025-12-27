import 'dotenv/config';
import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 StudyWithMe Backend running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard API: http://localhost:${PORT}/api/dashboard`);
  console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`);
});

// Re-export modules for direct import usage
export * from './controllers/chat.controller';
export * from './controllers/assignment.controller';
export * from './controllers/progress.controller';
export * from './controllers/adaptive.controller';
export * from './controllers/dashboard.controller';