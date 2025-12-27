// W&B Client - Integration with Weights & Biases for experiment tracking
import { analyticsService } from '../analytics/analyticsService';

export class WandbClient {
  private initialized: boolean = false;
  private runId: string | null = null;

  constructor() {
    this.init({});
  }

  public init(config: any) {
    this.runId = `run-${Date.now()}`;
    this.initialized = true;
    console.log('📊 W&B Client initialized');
  }

  public async log(data: any) {
    if (!this.initialized) {
      console.debug("[W&B] Not initialized, skipping log");
      return;
    }

    // Route to appropriate analytics tracking
    if (data.type === 'chat') {
      await analyticsService.trackChat({
        sessionId: data.sessionId || 'default',
        message: data.message || '',
        depth: data.depth || 'core',
        mode: data.mode || 'learning',
        responseTime: data.responseTime || 0,
        ethicsFlag: data.ethicsFlag || false,
        subject: data.subject
      });
    } else if (data.type === 'learning') {
      await analyticsService.trackLearning({
        type: data.eventType || 'learning_start',
        userId: data.userId || 'default',
        planId: data.planId || '',
        subject: data.subject || '',
        day: data.day,
        progress: data.progress,
        streak: data.streak
      });
    } else if (data.type === 'ai') {
      await analyticsService.trackAI({
        model: data.model || 'gemini-2.5-flash',
        promptTokens: data.promptTokens || 0,
        responseTokens: data.responseTokens || 0,
        latency: data.latency || 0,
        success: data.success !== false,
        error: data.error
      });
    } else {
      // Generic log
      console.debug("[W&B] Log:", data);
    }
  }

  public getMetrics() {
    return analyticsService.getMetricsSummary();
  }

  public isInitialized(): boolean {
    return this.initialized;
  }
}

export const wandbClient = new WandbClient();