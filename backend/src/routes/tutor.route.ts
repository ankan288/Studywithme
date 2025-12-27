// Tutor API Routes
import { Router } from 'express';
import { personalizedTutor, UserLevel } from '../tutor/personalizedTutor';

const router = Router();

/**
 * POST /api/tutor/start
 * Start a new personalized learning journey
 */
router.post('/start', async (req, res) => {
  try {
    const { subject, level, priorKnowledge, learningStyle, hoursPerDay, targetDays, userId } = req.body;
    
    if (!subject) {
      return res.status(400).json({ success: false, error: 'Subject is required' });
    }
    
    const userLevel: UserLevel = {
      level: level || 'beginner',
      priorKnowledge: priorKnowledge || [],
      learningStyle: learningStyle || 'mixed',
      availableHoursPerDay: hoursPerDay || 2,
      targetCompletionDays: targetDays || 30
    };
    
    const plan = await personalizedTutor.createLearningJourney(subject, userLevel, userId || 'default-user');
    
    res.json({
      success: true,
      planId: plan.id,
      plan,
      message: personalizedTutor.formatPlanAsMessage(plan)
    });
  } catch (error) {
    console.error('[Tutor Route Error]', error);
    res.status(500).json({ success: false, error: 'Failed to create learning plan' });
  }
});

/**
 * GET /api/tutor/plan/:planId
 * Get a learning plan by ID
 */
router.get('/plan/:planId', (req, res) => {
  try {
    const { planId } = req.params;
    const plan = personalizedTutor.getPlan(planId);
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }
    
    res.json({
      success: true,
      plan,
      message: personalizedTutor.formatPlanAsMessage(plan)
    });
  } catch (error) {
    console.error('[Tutor Route Error]', error);
    res.status(500).json({ success: false, error: 'Failed to get plan' });
  }
});

/**
 * GET /api/tutor/today/:planId
 * Get today's workflow for a plan
 */
router.get('/today/:planId', async (req, res) => {
  try {
    const { planId } = req.params;
    const workflow = await personalizedTutor.getTodayWorkflow(planId);
    
    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }
    
    res.json({
      success: true,
      workflow
    });
  } catch (error) {
    console.error('[Tutor Route Error]', error);
    res.status(500).json({ success: false, error: 'Failed to get today workflow' });
  }
});

/**
 * GET /api/tutor/day/:planId/:day
 * Get content for a specific day
 */
router.get('/day/:planId/:day', async (req, res) => {
  try {
    const { planId, day } = req.params;
    const dayContent = await personalizedTutor.generateDayContent(planId, parseInt(day));
    
    if (!dayContent) {
      return res.status(404).json({ success: false, error: 'Day not found' });
    }
    
    res.json({
      success: true,
      day: dayContent
    });
  } catch (error) {
    console.error('[Tutor Route Error]', error);
    res.status(500).json({ success: false, error: 'Failed to generate day content' });
  }
});

/**
 * POST /api/tutor/complete/:planId/:day
 * Mark a day as complete
 */
router.post('/complete/:planId/:day', async (req, res) => {
  try {
    const { planId, day } = req.params;
    const plan = await personalizedTutor.markDayComplete(planId, parseInt(day));
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan or day not found' });
    }
    
    res.json({
      success: true,
      message: `🎉 Day ${day} completed! You're ${plan.progress.percentComplete}% done.`,
      progress: plan.progress
    });
  } catch (error) {
    console.error('[Tutor Route Error]', error);
    res.status(500).json({ success: false, error: 'Failed to mark complete' });
  }
});

/**
 * POST /api/tutor/missed/:planId/:day
 * Mark a day as missed and get catch-up plan
 */
router.post('/missed/:planId/:day', async (req, res) => {
  try {
    const { planId, day } = req.params;
    const plan = await personalizedTutor.markDayMissed(planId, parseInt(day));
    
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan or day not found' });
    }
    
    res.json({
      success: true,
      message: `Don't worry! Here's your catch-up plan.`,
      catchUpPlan: plan.catchUpPlan,
      progress: plan.progress
    });
  } catch (error) {
    console.error('[Tutor Route Error]', error);
    res.status(500).json({ success: false, error: 'Failed to process missed day' });
  }
});

/**
 * GET /api/tutor/user/:userId/plans
 * Get all plans for a user
 */
router.get('/user/:userId/plans', (req, res) => {
  try {
    const { userId } = req.params;
    const plans = personalizedTutor.getUserPlans(userId);
    
    res.json({
      success: true,
      plans: plans.map(p => ({
        id: p.id,
        subject: p.subject,
        progress: p.progress,
        createdAt: p.createdAt
      }))
    });
  } catch (error) {
    console.error('[Tutor Route Error]', error);
    res.status(500).json({ success: false, error: 'Failed to get user plans' });
  }
});

export const tutorRoutes = router;
