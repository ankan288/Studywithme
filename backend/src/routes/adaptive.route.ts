import { Router, Request, Response } from 'express';
import { adaptiveController } from '../controllers/adaptive.controller';
import { DepthLevel } from '../types/index';

const router = Router();

/**
 * GET /api/adaptive/path/:studentId
 * Get personalized learning path
 */
router.get('/path/:studentId', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const depth = (req.query.depth as DepthLevel) || DepthLevel.Core;
    const path = await adaptiveController.getLearningPath(studentId, depth);
    res.json({ success: true, data: path });
  } catch (error) {
    console.error('[Adaptive Route Error]', error);
    res.status(500).json({ success: false, error: 'Failed to get learning path' });
  }
});

/**
 * GET /api/adaptive/adjustment/:studentId/:topic
 * Get depth adjustment signal for a topic
 */
router.get('/adjustment/:studentId/:topic', async (req: Request, res: Response) => {
  try {
    const { studentId, topic } = req.params;
    const result = await adaptiveController.getDepthAdjustment(studentId, topic);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[Adaptive Route Error]', error);
    res.status(500).json({ success: false, error: 'Failed to get depth adjustment' });
  }
});

/**
 * GET /api/adaptive/recommendations/:studentId/:topic
 * Get topic recommendations
 */
router.get('/recommendations/:studentId/:topic', async (req: Request, res: Response) => {
  try {
    const { studentId, topic } = req.params;
    const result = await adaptiveController.getRecommendations(studentId, topic);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('[Adaptive Route Error]', error);
    res.status(500).json({ success: false, error: 'Failed to get recommendations' });
  }
});

/**
 * GET /api/adaptive/analyze/:studentId/:topic
 * Analyze and suggest optimal depth
 */
router.get('/analyze/:studentId/:topic', async (req: Request, res: Response) => {
  try {
    const { studentId, topic } = req.params;
    const analysis = await adaptiveController.analyzeAndSuggestDepth(studentId, topic);
    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('[Adaptive Route Error]', error);
    res.status(500).json({ success: false, error: 'Failed to analyze depth' });
  }
});

export const adaptiveRoutes = router;

// Also export for direct usage
export const AdaptiveRoutes = {
  getLearningPath: adaptiveController.getLearningPath.bind(adaptiveController),
  getDepthAdjustment: adaptiveController.getDepthAdjustment.bind(adaptiveController),
  getRecommendations: adaptiveController.getRecommendations.bind(adaptiveController),
  analyzeAndSuggestDepth: adaptiveController.analyzeAndSuggestDepth.bind(adaptiveController)
};
