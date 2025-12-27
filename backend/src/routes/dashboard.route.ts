import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';

const router = Router();

/**
 * GET /api/dashboard/metrics
 * Get dashboard metrics
 */
router.get('/metrics', async (req, res) => {
  console.log(`[API] GET /api/dashboard/metrics`);
  try {
    const data = await dashboardController.getDashboardMetrics();
    res.json({ success: true, data });
  } catch (error) {
    console.error('[Dashboard Route Error]', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard metrics' });
  }
});

export const dashboardRoutes = router;

// Also export for direct usage
export const DashboardRoutes = {
  getMetrics: async () => {
    console.log(`[API] GET /api/dashboard/metrics`);
    try {
      const data = await dashboardController.getDashboardMetrics();
      return { success: true, data };
    } catch (e) {
      console.error("[API Error]", e);
      return { success: false, error: "Failed to fetch dashboard metrics" };
    }
  }
};