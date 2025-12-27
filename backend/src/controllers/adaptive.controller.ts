import { learningPathGenerator } from '../adaptive/learningPathGenerator';
import { depthAdjustmentEngine } from '../adaptive/depthAdjustmentEngine';
import { recommendationEngine } from '../adaptive/recommendationEngine';
import { progressStore } from '../progress/progressStore';
import { DepthLevel, TopicMetrics } from '../types/index';

export class AdaptiveController {
  
  /**
   * Get personalized learning path for a student
   */
  public async getLearningPath(studentId: string, currentDepth: DepthLevel) {
    const path = learningPathGenerator.generatePath(studentId, currentDepth);
    return path;
  }

  /**
   * Get depth adjustment signal for a specific topic
   */
  public async getDepthAdjustment(studentId: string, topic: string) {
    const profile = await progressStore.getProfile(studentId);
    if (!profile) {
      return { error: 'Student profile not found' };
    }

    const topicMetrics = profile.topics[topic];
    if (!topicMetrics) {
      return { 
        signal: {
          topic,
          signalType: 'MAINTAIN',
          reason: 'No data available for this topic yet.'
        }
      };
    }

    const signal = depthAdjustmentEngine.getSignalForTopic(topicMetrics);
    return { signal };
  }

  /**
   * Get topic recommendations for a student
   */
  public async getRecommendations(studentId: string, topic: string) {
    const recommendations = recommendationEngine.getRecommendations(topic);
    return { recommendations };
  }

  /**
   * Analyze student performance and suggest optimal depth
   */
  public async analyzeAndSuggestDepth(studentId: string, topic: string): Promise<{
    currentDepth: DepthLevel;
    suggestedDepth: DepthLevel;
    reason: string;
  }> {
    const profile = await progressStore.getProfile(studentId);
    if (!profile) {
      return {
        currentDepth: DepthLevel.Core,
        suggestedDepth: DepthLevel.Core,
        reason: 'New student - starting at Core level'
      };
    }

    const topicMetrics = profile.topics[topic];
    if (!topicMetrics) {
      return {
        currentDepth: DepthLevel.Core,
        suggestedDepth: DepthLevel.Core,
        reason: 'New topic - starting at Core level'
      };
    }

    const signal = depthAdjustmentEngine.getSignalForTopic(topicMetrics);
    let suggestedDepth = topicMetrics.lastDepth;

    if (signal.signalType === 'INCREASE_DEPTH') {
      suggestedDepth = this.getNextDepth(topicMetrics.lastDepth);
    } else if (signal.signalType === 'REDUCE_COMPLEXITY') {
      suggestedDepth = this.getPreviousDepth(topicMetrics.lastDepth);
    }

    return {
      currentDepth: topicMetrics.lastDepth,
      suggestedDepth,
      reason: signal.reason
    };
  }

  private getNextDepth(current: DepthLevel): DepthLevel {
    if (current === DepthLevel.Core) return DepthLevel.Applied;
    if (current === DepthLevel.Applied) return DepthLevel.Mastery;
    return DepthLevel.Mastery;
  }

  private getPreviousDepth(current: DepthLevel): DepthLevel {
    if (current === DepthLevel.Mastery) return DepthLevel.Applied;
    if (current === DepthLevel.Applied) return DepthLevel.Core;
    return DepthLevel.Core;
  }
}

export const adaptiveController = new AdaptiveController();
