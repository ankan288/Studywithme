import { Router } from 'express';
import { assignmentController } from '../controllers/assignment.controller';
import { DepthLevel, AssignmentStructure } from '../types/index';

const router = Router();

/**
 * POST /api/assignments/initialize
 * Initialize with API key
 */
router.post('/initialize', (req, res) => {
  try {
    const { apiKey } = req.body;
    assignmentController.initialize(apiKey);
    res.json({ success: true });
  } catch (error) {
    console.error('[Assignment Route Error]', error);
    res.status(500).json({ success: false, error: 'Failed to initialize' });
  }
});

/**
 * POST /api/assignments/generate
 * Generate a new assignment
 */
router.post('/generate', async (req, res) => {
  try {
    const { topic, depth } = req.body;
    const data = await assignmentController.generate(topic, depth);
    res.json({ success: true, data });
  } catch (error) {
    console.error('[Assignment Route Error]', error);
    res.status(500).json({ success: false, error: 'Generation failed' });
  }
});

/**
 * POST /api/assignments/evaluate
 * Evaluate student's assignment answer
 */
router.post('/evaluate', async (req, res) => {
  try {
    const { assignment, answer } = req.body;
    const data = await assignmentController.evaluate(assignment, answer);
    res.json({ success: true, data });
  } catch (error) {
    console.error('[Assignment Route Error]', error);
    res.status(500).json({ success: false, error: 'Evaluation failed' });
  }
});

export const assignmentRoutes = router;

// Also export for direct usage
export const AssignmentRoutes = {
  initialize: (apiKey: string) => {
    assignmentController.initialize(apiKey);
  },

  generate: async (topic: string, depth: DepthLevel) => {
    try {
      const data = await assignmentController.generate(topic, depth);
      return { success: true, data };
    } catch (e) {
      return { success: false, error: "Generation failed" };
    }
  },

  evaluate: async (assignment: AssignmentStructure, answer: string) => {
    try {
      const data = await assignmentController.evaluate(assignment, answer);
      return { success: true, data };
    } catch (e) {
      return { success: false, error: "Evaluation failed" };
    }
  }
};