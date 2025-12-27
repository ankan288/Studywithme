// Analytics Service - Tracks all learning metrics for insights
import 'dotenv/config';

// Event types for tracking
export interface ChatEvent {
  type: 'chat';
  sessionId: string;
  message: string;
  depth: string;
  mode: string;
  responseTime: number;
  ethicsFlag: boolean;
  subject?: string;
  timestamp: Date;
}

export interface LearningEvent {
  type: 'learning_start' | 'day_complete' | 'day_missed' | 'catch_up';
  userId: string;
  planId: string;
  subject: string;
  day?: number;
  progress?: number;
  streak?: number;
  timestamp: Date;
}

export interface AIEvent {
  type: 'ai_request';
  model: string;
  promptTokens: number;
  responseTokens: number;
  latency: number;
  success: boolean;
  error?: string;
  timestamp: Date;
}

export interface SessionEvent {
  type: 'session_start' | 'session_end';
  sessionId: string;
  userId?: string;
  duration?: number;
  pagesVisited?: number;
  timestamp: Date;
}

// Aggregated metrics for dashboard
export interface DailyMetrics {
  date: string;
  totalSessions: number;
  uniqueUsers: number;
  totalChats: number;
  subjectBreakdown: Record<string, number>;
  depthBreakdown: Record<string, number>;
  learningPlansCreated: number;
  daysCompleted: number;
  daysMissed: number;
  avgResponseTime: number;
  ethicsFlagsTriggered: number;
  avgStreak: number;
}

class AnalyticsService {
  private isInitialized: boolean = false;
  private projectName: string;
  private apiKey: string | null;
  
  // In-memory storage for events (would be database in production)
  private events: Array<ChatEvent | LearningEvent | AIEvent | SessionEvent> = [];
  private dailyMetrics: Map<string, DailyMetrics> = new Map();
  
  // Real-time counters
  private sessionCount: number = 0;
  private chatCount: number = 0;
  private subjectCounts: Record<string, number> = {};
  private depthCounts: Record<string, number> = {};
  private responseTimes: number[] = [];
  private ethicsFlags: number = 0;
  private learningPlansCreated: number = 0;
  private daysCompleted: number = 0;
  private daysMissed: number = 0;
  private streaks: number[] = [];

  constructor() {
    this.apiKey = process.env.WANDB_API_KEY || null;
    this.projectName = process.env.WANDB_PROJECT || 'studywm';
    
    if (this.apiKey) {
      this.initialize();
    }
  }

  private async initialize(): Promise<void> {
    try {
      // For now, we'll use a lightweight approach with HTTP calls to W&B API
      // This avoids heavy Python dependencies
      console.log('📊 Analytics Service initialized');
      console.log(`   Project: ${this.projectName}`);
      this.isInitialized = true;
      
      // Log initialization event
      await this.logToWandB({
        type: 'system',
        event: 'analytics_initialized',
        project: this.projectName,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to initialize W&B:', error);
    }
  }

  /**
   * Log data to W&B via HTTP API
   */
  private async logToWandB(data: Record<string, any>): Promise<void> {
    if (!this.apiKey) return;
    
    try {
      // W&B HTTP API endpoint
      const response = await fetch('https://api.wandb.ai/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          query: `
            mutation CreateRun($project: String!, $entity: String, $config: JSONString) {
              upsertRun(input: {project: $project, entity: $entity, config: $config}) {
                run {
                  id
                  name
                }
              }
            }
          `,
          variables: {
            project: this.projectName,
            config: JSON.stringify(data)
          }
        })
      });
      
      if (!response.ok) {
        console.debug('W&B log response:', response.status);
      }
    } catch (error) {
      // Silent fail - don't break the app if analytics fails
      console.debug('W&B logging error (non-critical):', error);
    }
  }

  /**
   * Track a chat interaction
   */
  async trackChat(event: Omit<ChatEvent, 'type' | 'timestamp'>): Promise<void> {
    const chatEvent: ChatEvent = {
      type: 'chat',
      ...event,
      timestamp: new Date()
    };
    
    this.events.push(chatEvent);
    this.chatCount++;
    this.responseTimes.push(event.responseTime);
    
    if (event.depth) {
      this.depthCounts[event.depth] = (this.depthCounts[event.depth] || 0) + 1;
    }
    
    if (event.subject) {
      this.subjectCounts[event.subject] = (this.subjectCounts[event.subject] || 0) + 1;
    }
    
    if (event.ethicsFlag) {
      this.ethicsFlags++;
    }
    
    // Log to W&B
    await this.logToWandB({
      type: 'chat',
      session_id: event.sessionId,
      depth: event.depth,
      mode: event.mode,
      response_time_ms: event.responseTime,
      ethics_flag: event.ethicsFlag,
      subject: event.subject || 'general',
      timestamp: chatEvent.timestamp.toISOString()
    });
    
    console.log(`📊 Chat tracked: ${event.mode} mode, ${event.depth} depth, ${event.responseTime}ms`);
  }

  /**
   * Track learning events (plan creation, completion, missed days)
   */
  async trackLearning(event: Omit<LearningEvent, 'timestamp'>): Promise<void> {
    const learningEvent: LearningEvent = {
      ...event,
      timestamp: new Date()
    };
    
    this.events.push(learningEvent);
    
    switch (event.type) {
      case 'learning_start':
        this.learningPlansCreated++;
        this.subjectCounts[event.subject] = (this.subjectCounts[event.subject] || 0) + 1;
        break;
      case 'day_complete':
        this.daysCompleted++;
        if (event.streak) this.streaks.push(event.streak);
        break;
      case 'day_missed':
        this.daysMissed++;
        break;
    }
    
    // Log to W&B
    await this.logToWandB({
      type: 'learning',
      event_type: event.type,
      user_id: event.userId,
      plan_id: event.planId,
      subject: event.subject,
      day: event.day,
      progress_percent: event.progress,
      streak: event.streak,
      timestamp: learningEvent.timestamp.toISOString()
    });
    
    console.log(`📊 Learning tracked: ${event.type} for ${event.subject}`);
  }

  /**
   * Track AI/Gemini API calls
   */
  async trackAI(event: Omit<AIEvent, 'type' | 'timestamp'>): Promise<void> {
    const aiEvent: AIEvent = {
      type: 'ai_request',
      ...event,
      timestamp: new Date()
    };
    
    this.events.push(aiEvent);
    
    // Log to W&B
    await this.logToWandB({
      type: 'ai',
      model: event.model,
      prompt_tokens: event.promptTokens,
      response_tokens: event.responseTokens,
      latency_ms: event.latency,
      success: event.success,
      error: event.error,
      timestamp: aiEvent.timestamp.toISOString()
    });
  }

  /**
   * Track session start/end
   */
  async trackSession(event: Omit<SessionEvent, 'timestamp'>): Promise<void> {
    const sessionEvent: SessionEvent = {
      ...event,
      timestamp: new Date()
    };
    
    this.events.push(sessionEvent);
    
    if (event.type === 'session_start') {
      this.sessionCount++;
    }
    
    // Log to W&B
    await this.logToWandB({
      type: 'session',
      event_type: event.type,
      session_id: event.sessionId,
      user_id: event.userId,
      duration_seconds: event.duration,
      pages_visited: event.pagesVisited,
      timestamp: sessionEvent.timestamp.toISOString()
    });
  }

  /**
   * Get real-time metrics summary
   */
  getMetricsSummary(): {
    totalSessions: number;
    totalChats: number;
    subjectBreakdown: Record<string, number>;
    depthBreakdown: Record<string, number>;
    avgResponseTime: number;
    ethicsFlagsTriggered: number;
    learningPlansCreated: number;
    daysCompleted: number;
    daysMissed: number;
    avgStreak: number;
    completionRate: number;
  } {
    const avgResponseTime = this.responseTimes.length > 0
      ? Math.round(this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length)
      : 0;
    
    const avgStreak = this.streaks.length > 0
      ? Math.round(this.streaks.reduce((a, b) => a + b, 0) / this.streaks.length * 10) / 10
      : 0;
    
    const totalDays = this.daysCompleted + this.daysMissed;
    const completionRate = totalDays > 0
      ? Math.round((this.daysCompleted / totalDays) * 100)
      : 100;
    
    return {
      totalSessions: this.sessionCount,
      totalChats: this.chatCount,
      subjectBreakdown: { ...this.subjectCounts },
      depthBreakdown: { ...this.depthCounts },
      avgResponseTime,
      ethicsFlagsTriggered: this.ethicsFlags,
      learningPlansCreated: this.learningPlansCreated,
      daysCompleted: this.daysCompleted,
      daysMissed: this.daysMissed,
      avgStreak,
      completionRate
    };
  }

  /**
   * Get popular subjects ranking
   */
  getPopularSubjects(): Array<{ subject: string; count: number; percentage: number }> {
    const total = Object.values(this.subjectCounts).reduce((a, b) => a + b, 0);
    
    return Object.entries(this.subjectCounts)
      .map(([subject, count]) => ({
        subject,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get depth level distribution
   */
  getDepthDistribution(): Array<{ depth: string; count: number; percentage: number }> {
    const total = Object.values(this.depthCounts).reduce((a, b) => a + b, 0);
    
    return Object.entries(this.depthCounts)
      .map(([depth, count]) => ({
        depth,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get recent events for debugging/monitoring
   */
  getRecentEvents(limit: number = 50): Array<ChatEvent | LearningEvent | AIEvent | SessionEvent> {
    return this.events.slice(-limit);
  }

  /**
   * Check if analytics is properly initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
