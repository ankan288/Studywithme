// Analytics API Routes - Expose metrics for dashboard
import { Router } from 'express';
import { analyticsService } from '../analytics/analyticsService';

const router = Router();

/**
 * GET /api/analytics/summary
 * Get overall metrics summary
 */
router.get('/summary', (req, res) => {
  try {
    const metrics = analyticsService.getMetricsSummary();
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Analytics Route Error]', error);
    res.status(500).json({ success: false, error: 'Failed to get metrics' });
  }
});

/**
 * GET /api/analytics/subjects
 * Get popular subjects ranking
 */
router.get('/subjects', (req, res) => {
  try {
    const subjects = analyticsService.getPopularSubjects();
    
    res.json({
      success: true,
      data: subjects,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Analytics Route Error]', error);
    res.status(500).json({ success: false, error: 'Failed to get subjects' });
  }
});

/**
 * GET /api/analytics/depth
 * Get depth level distribution
 */
router.get('/depth', (req, res) => {
  try {
    const distribution = analyticsService.getDepthDistribution();
    
    res.json({
      success: true,
      data: distribution,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Analytics Route Error]', error);
    res.status(500).json({ success: false, error: 'Failed to get depth distribution' });
  }
});

/**
 * GET /api/analytics/events
 * Get recent events (for debugging/monitoring)
 */
router.get('/events', (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const events = analyticsService.getRecentEvents(limit);
    
    res.json({
      success: true,
      data: events,
      count: events.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Analytics Route Error]', error);
    res.status(500).json({ success: false, error: 'Failed to get events' });
  }
});

/**
 * GET /api/analytics/status
 * Check if analytics service is ready
 */
router.get('/status', (req, res) => {
  try {
    const isReady = analyticsService.isReady();
    
    res.json({
      success: true,
      status: isReady ? 'active' : 'initializing',
      wandbConnected: isReady,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Analytics Route Error]', error);
    res.status(500).json({ success: false, error: 'Failed to get status' });
  }
});

/**
 * POST /api/analytics/session/start
 * Track session start
 */
router.post('/session/start', async (req, res) => {
  try {
    const { sessionId, userId } = req.body;
    
    await analyticsService.trackSession({
      type: 'session_start',
      sessionId: sessionId || `session-${Date.now()}`,
      userId
    });
    
    res.json({
      success: true,
      message: 'Session started',
      sessionId: sessionId || `session-${Date.now()}`
    });
  } catch (error) {
    console.error('[Analytics Route Error]', error);
    res.status(500).json({ success: false, error: 'Failed to track session' });
  }
});

/**
 * POST /api/analytics/session/end
 * Track session end
 */
router.post('/session/end', async (req, res) => {
  try {
    const { sessionId, userId, duration, pagesVisited } = req.body;
    
    await analyticsService.trackSession({
      type: 'session_end',
      sessionId,
      userId,
      duration,
      pagesVisited
    });
    
    res.json({
      success: true,
      message: 'Session ended'
    });
  } catch (error) {
    console.error('[Analytics Route Error]', error);
    res.status(500).json({ success: false, error: 'Failed to track session end' });
  }
});

export const analyticsRoutes = router;
