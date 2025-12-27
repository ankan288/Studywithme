import { Router } from 'express';
import { progressController } from '../controllers/progress.controller';
import { LearningEvent } from '../types/index';

const router = Router();

/**
 * POST /api/progress/event
 * Record a learning event
 */
router.post('/event', async (req, res) => {
  try {
    const event: LearningEvent = req.body;
    const result = await progressController.recordEvent(event);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[Progress Route Error]', error);
    res.status(500).json({ success: false, error: 'Failed to update progress' });
  }
});

/**
 * GET /api/progress/summary/:studentId
 * Get student summary
 */
router.get('/summary/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const data = await progressController.getStudentSummary(studentId);
    res.json({ success: true, data });
  } catch (error) {
    console.error('[Progress Route Error]', error);
    res.status(500).json({ success: false, error: 'Failed to fetch summary' });
  }
});

export const progressRoutes = router;

// Also export for direct usage
export const ProgressRoutes = {
  updateProgress: async (event: LearningEvent) => {
    try {
      return await progressController.recordEvent(event);
    } catch (e) {
      console.error("[API Error]", e);
      return { success: false, error: "Failed to update progress" };
    }
  },

  getSummary: async (studentId: string) => {
    try {
      const data = await progressController.getStudentSummary(studentId);
      return { success: true, data };
    } catch (e) {
      console.error("[API Error]", e);
      return { success: false, error: "Failed to fetch summary" };
    }
  }
};