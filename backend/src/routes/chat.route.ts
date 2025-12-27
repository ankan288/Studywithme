import { Router, Request, Response } from 'express';
import { chatController } from '../controllers/chat.controller';
import { DepthLevel, TaskMode } from '../types/index';

const router = Router();

/**
 * POST /api/chat/message
 * Send a chat message
 */
router.post('/message', async (req: Request, res: Response) => {
  try {
    const { message, depth, mode, sessionId } = req.body;
    const response = await chatController.handleChat(message, depth, mode, sessionId || 'default-session');
    res.json({ success: true, data: response });
  } catch (error) {
    console.error('[Chat Route Error]', error);
    res.status(500).json({ success: false, error: 'Failed to process message' });
  }
});

/**
 * POST /api/chat/initialize
 * Initialize the chat system with API key
 */
router.post('/initialize', (req: Request, res: Response) => {
  try {
    const { apiKey } = req.body;
    chatController.initialize(apiKey);
    res.json({ success: true });
  } catch (error) {
    console.error('[Chat Route Error]', error);
    res.status(500).json({ success: false, error: 'Failed to initialize' });
  }
});

export const chatRoutes = router;

// Also export for direct usage (frontend-student integration)
export const ChatRoutes = {
  sendMessage: async (message: string, depth: DepthLevel, mode: TaskMode) => {
    return await chatController.handleChat(message, depth, mode);
  },

  initialize: (apiKey: string) => {
    chatController.initialize(apiKey);
    return { success: true };
  }
};