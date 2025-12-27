import { geminiClient } from '../ai/geminiClient';
import { DepthLevel, TaskMode } from '../types/index';
import { personalizedTutor, UserLevel } from '../tutor/personalizedTutor';
import { analyticsService } from '../analytics/analyticsService';

// Learning intent detection patterns
const LEARNING_PATTERNS = [
  /^(teach me|learn|i want to learn|study|start learning)\s+(.+)/i,
  /^(dbms|sql|python|java|javascript|react|node|data structures|algorithms|machine learning|ai|web development|css|html)/i,
  /^(help me learn|guide me through|explain)\s+(.+)/i
];

export class ChatController {
  
  // Store active learning plans per session
  private activePlans: Map<string, string> = new Map();
  
  public async handleChat(
    message: string, 
    depth: DepthLevel, 
    mode: TaskMode,
    sessionId: string = 'default'
  ): Promise<{ text: string; ethicsFlag: boolean; error?: string; planId?: string }> {
    
    const startTime = Date.now();
    
    // Auto-initialize from environment if not already initialized
    try {
      geminiClient.ensureInitialized();
    } catch (initError) {
      return { 
        text: '', 
        ethicsFlag: false, 
        error: 'System not initialized. Please provide API Key.' 
      };
    }

    // Check if this is a learning intent
    const learningIntent = this.detectLearningIntent(message);
    if (learningIntent) {
      const result = await this.handleLearningRequest(learningIntent, depth, sessionId);
      
      // Track learning request
      await analyticsService.trackChat({
        sessionId,
        message,
        depth,
        mode,
        responseTime: Date.now() - startTime,
        ethicsFlag: result.ethicsFlag,
        subject: learningIntent.subject
      });
      
      return result;
    }
    
    // Check for plan-related commands
    const planCommand = this.detectPlanCommand(message, sessionId);
    if (planCommand) {
      const result = await this.handlePlanCommand(planCommand, sessionId);
      
      // Track plan command
      await analyticsService.trackChat({
        sessionId,
        message,
        depth,
        mode,
        responseTime: Date.now() - startTime,
        ethicsFlag: result.ethicsFlag
      });
      
      return result;
    }

    try {
      const response = await geminiClient.sendMessage(message, depth, mode);
      
      // Track regular chat
      await analyticsService.trackChat({
        sessionId,
        message,
        depth,
        mode,
        responseTime: Date.now() - startTime,
        ethicsFlag: response.ethicsFlag
      });
      
      return response;
    } catch (error) {
      console.error('Chat Controller Error:', error);
      return {
        text: 'Sorry, I encountered an error processing your request.',
        ethicsFlag: false,
        error: 'Internal processing error'
      };
    }
  }

  private detectLearningIntent(message: string): { subject: string } | null {
    const lowerMessage = message.toLowerCase().trim();
    
    for (const pattern of LEARNING_PATTERNS) {
      const match = lowerMessage.match(pattern);
      if (match) {
        // Extract the subject from the match
        const subject = match[2] || match[1] || match[0];
        return { subject: subject.trim() };
      }
    }
    
    // Check for short subject names (1-3 words, no question marks)
    const words = message.trim().split(/\s+/);
    if (words.length <= 3 && !message.includes('?') && !message.includes('what') && !message.includes('how')) {
      const potentialSubjects = ['dbms', 'sql', 'python', 'java', 'javascript', 'react', 'nodejs', 'css', 'html', 
        'data structures', 'algorithms', 'machine learning', 'ai', 'artificial intelligence', 'web development',
        'database', 'networking', 'operating system', 'os', 'computer networks', 'cn', 'dsa'];
      
      if (potentialSubjects.some(s => lowerMessage.includes(s))) {
        return { subject: message.trim() };
      }
    }
    
    return null;
  }

  private detectPlanCommand(message: string, sessionId: string): { command: string; arg?: string } | null {
    const lowerMessage = message.toLowerCase().trim();
    
    if (lowerMessage.includes('show today') || lowerMessage.includes("today's task") || lowerMessage.includes('what should i learn')) {
      return { command: 'today' };
    }
    
    if (lowerMessage.includes('mark complete') || lowerMessage.includes('done') || lowerMessage.includes('completed')) {
      return { command: 'complete' };
    }
    
    if (lowerMessage.includes('missed') || lowerMessage.includes('skip') || lowerMessage.includes("couldn't study")) {
      return { command: 'missed' };
    }
    
    if (lowerMessage.includes('show plan') || lowerMessage.includes('my plan') || lowerMessage.includes('show syllabus')) {
      return { command: 'showPlan' };
    }
    
    if (lowerMessage.includes('catch up') || lowerMessage.includes('how to recover')) {
      return { command: 'catchUp' };
    }
    
    return null;
  }

  private async handleLearningRequest(
    intent: { subject: string }, 
    depth: DepthLevel,
    sessionId: string
  ): Promise<{ text: string; ethicsFlag: boolean; planId?: string }> {
    
    // Map depth to user level
    const levelMap: Record<DepthLevel, 'beginner' | 'intermediate' | 'advanced'> = {
      [DepthLevel.Core]: 'beginner',
      [DepthLevel.Applied]: 'intermediate',
      [DepthLevel.Mastery]: 'advanced'
    };
    
    const userLevel: UserLevel = {
      level: levelMap[depth],
      priorKnowledge: [],
      learningStyle: 'mixed',
      availableHoursPerDay: 2,
      targetCompletionDays: 30
    };
    
    try {
      const plan = await personalizedTutor.createLearningJourney(intent.subject, userLevel, sessionId);
      
      // Store the active plan for this session
      this.activePlans.set(sessionId, plan.id);
      
      const message = personalizedTutor.formatPlanAsMessage(plan);
      
      return {
        text: message,
        ethicsFlag: false,
        planId: plan.id
      };
    } catch (error) {
      console.error('Learning request error:', error);
      return {
        text: `I'd love to help you learn ${intent.subject}! However, I encountered an issue creating your learning plan. Please try again.`,
        ethicsFlag: false
      };
    }
  }

  private async handlePlanCommand(
    command: { command: string; arg?: string },
    sessionId: string
  ): Promise<{ text: string; ethicsFlag: boolean }> {
    
    const planId = this.activePlans.get(sessionId);
    
    if (!planId) {
      return {
        text: "You don't have an active learning plan yet. Tell me what subject you'd like to learn (e.g., 'teach me DBMS' or just type 'Python') and I'll create a personalized learning path for you!",
        ethicsFlag: false
      };
    }
    
    const plan = personalizedTutor.getPlan(planId);
    if (!plan) {
      return {
        text: "I couldn't find your learning plan. Let's start fresh! What would you like to learn?",
        ethicsFlag: false
      };
    }
    
    switch (command.command) {
      case 'today': {
        const workflow = await personalizedTutor.getTodayWorkflow(planId);
        if (!workflow) {
          return { text: "Couldn't load today's workflow.", ethicsFlag: false };
        }
        
        let response = `# ${workflow.greeting}\n\n`;
        response += `💪 *${workflow.motivationalMessage}*\n\n`;
        
        if (workflow.missedTasks.length > 0) {
          response += `⚠️ **Missed Days:** ${workflow.missedTasks.length}\n`;
          response += `Consider catching up on: ${workflow.missedTasks.map(t => t.topicName).join(', ')}\n\n`;
        }
        
        if (workflow.todayTask) {
          response += `## 📚 Today's Task (Day ${workflow.todayTask.day})\n\n`;
          response += `**Topic:** ${workflow.todayTask.topicName}\n`;
          response += `**Subtopics:** ${workflow.todayTask.subtopics.join(', ')}\n`;
          response += `**Estimated Time:** ${workflow.todayTask.estimatedMinutes} minutes\n\n`;
          
          // Generate content if not already generated
          const dayContent = await personalizedTutor.generateDayContent(planId, workflow.todayTask.day);
          if (dayContent && dayContent.content.explanation) {
            response += `### 📖 Lesson Content\n\n`;
            response += `${dayContent.content.explanation}\n\n`;
            
            if (dayContent.content.keyPoints.length > 0) {
              response += `### 🎯 Key Points\n`;
              dayContent.content.keyPoints.forEach(point => {
                response += `- ${point}\n`;
              });
              response += '\n';
            }
            
            if (dayContent.content.practiceQuestions.length > 0) {
              response += `### ❓ Practice Questions\n`;
              dayContent.content.practiceQuestions.forEach((q, i) => {
                response += `${i + 1}. ${q}\n`;
              });
            }
          }
          
          response += `\n---\nWhen you're done, say **"mark complete"** to track your progress!`;
        } else {
          response += `No specific task scheduled for today. Keep reviewing previous topics!`;
        }
        
        workflow.suggestions.forEach(s => {
          response += `\n${s}`;
        });
        
        return { text: response, ethicsFlag: false };
      }
      
      case 'complete': {
        const currentDay = plan.progress.currentDay;
        const updatedPlan = await personalizedTutor.markDayComplete(planId, currentDay);
        
        if (!updatedPlan) {
          return { text: "Couldn't mark the day as complete.", ethicsFlag: false };
        }
        
        let response = `# 🎉 Congratulations!\n\n`;
        response += `You've completed **Day ${currentDay}**!\n\n`;
        response += `## 📊 Your Progress\n`;
        response += `- **Completed:** ${updatedPlan.progress.completedDays}/${updatedPlan.schedule.totalDays} days\n`;
        response += `- **Progress:** ${updatedPlan.progress.percentComplete}%\n`;
        response += `- **Streak:** ${updatedPlan.progress.streak} days 🔥\n\n`;
        
        if (updatedPlan.progress.percentComplete === 100) {
          response += `## 🏆 AMAZING! You've completed the entire course!\n`;
          response += `You've successfully learned ${updatedPlan.subject}. Great job!`;
        } else {
          response += `Keep it up! Say **"show today's task"** to continue learning.`;
        }
        
        return { text: response, ethicsFlag: false };
      }
      
      case 'missed': {
        const currentDay = plan.progress.currentDay;
        const updatedPlan = await personalizedTutor.markDayMissed(planId, currentDay);
        
        if (!updatedPlan) {
          return { text: "Couldn't process the missed day.", ethicsFlag: false };
        }
        
        let response = `# 📅 No Worries!\n\n`;
        response += `It's okay to miss a day. What matters is getting back on track!\n\n`;
        
        if (updatedPlan.catchUpPlan) {
          response += `## 🔄 Your Catch-Up Plan\n\n`;
          response += `${updatedPlan.catchUpPlan.catchUpStrategy}\n\n`;
          response += `**Missed Topics:**\n`;
          updatedPlan.catchUpPlan.missedTasks.forEach(task => {
            response += `- Day ${task.day}: ${task.topicName}\n`;
          });
          response += `\n`;
        }
        
        response += `💡 **Tip:** Try to study a bit extra over the next few days to catch up.\n\n`;
        response += `Say **"show today's task"** to continue with today's lesson!`;
        
        return { text: response, ethicsFlag: false };
      }
      
      case 'showPlan': {
        return {
          text: personalizedTutor.formatPlanAsMessage(plan),
          ethicsFlag: false
        };
      }
      
      case 'catchUp': {
        if (!plan.catchUpPlan || plan.catchUpPlan.missedTasks.length === 0) {
          return {
            text: "Great news! You don't have any missed days to catch up on. Keep up the good work! 🎉",
            ethicsFlag: false
          };
        }
        
        let response = `# 🔄 Catch-Up Plan for ${plan.subject}\n\n`;
        response += `You have **${plan.catchUpPlan.missedTasks.length}** missed day(s).\n\n`;
        response += `## Strategy\n${plan.catchUpPlan.catchUpStrategy}\n\n`;
        response += `## Missed Topics to Review\n`;
        plan.catchUpPlan.missedTasks.forEach(task => {
          response += `- **Day ${task.day}:** ${task.topicName}\n`;
          response += `  - Subtopics: ${task.subtopics.join(', ')}\n`;
        });
        
        return { text: response, ethicsFlag: false };
      }
      
      default:
        return {
          text: "I didn't understand that command. Try:\n- 'show today's task'\n- 'mark complete'\n- 'I missed a day'\n- 'show my plan'",
          ethicsFlag: false
        };
    }
  }

  public initialize(apiKey: string) {
    geminiClient.initialize(apiKey);
  }
}

export const chatController = new ChatController();