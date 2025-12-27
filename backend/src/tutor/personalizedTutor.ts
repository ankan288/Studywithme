// Personalized Tutor - Complete learning journey manager
import { geminiClient } from '../ai/geminiClient';
import { DepthLevel } from '../types/index';
import { analyticsService } from '../analytics/analyticsService';

// Types for the personalized learning system
export interface UserLevel {
  level: 'beginner' | 'intermediate' | 'advanced';
  priorKnowledge: string[];
  learningStyle: 'visual' | 'textual' | 'practical' | 'mixed';
  availableHoursPerDay: number;
  targetCompletionDays: number;
}

export interface DailyTask {
  id: string;
  day: number;
  date: string;
  topicName: string;
  subtopics: string[];
  estimatedMinutes: number;
  status: 'pending' | 'in_progress' | 'completed' | 'missed';
  content: {
    explanation: string;
    examples: string[];
    keyPoints: string[];
    practiceQuestions: string[];
  };
  completedAt?: Date;
}

export interface LearningPlan {
  id: string;
  userId: string;
  subject: string;
  userLevel: UserLevel;
  motivation: {
    whyLearn: string[];
    careerBenefits: string[];
    skillsGained: string[];
    realWorldApplications: string[];
  };
  syllabus: {
    totalTopics: number;
    topics: {
      name: string;
      description: string;
      subtopics: string[];
      difficulty: string;
      estimatedHours: number;
    }[];
  };
  schedule: {
    totalDays: number;
    hoursPerDay: number;
    startDate: string;
    expectedEndDate: string;
    dailyTasks: DailyTask[];
  };
  progress: {
    completedDays: number;
    missedDays: number;
    currentDay: number;
    percentComplete: number;
    streak: number;
  };
  catchUpPlan?: {
    missedTasks: DailyTask[];
    catchUpStrategy: string;
    adjustedSchedule: DailyTask[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage for learning plans (would be database in production)
const learningPlans: Map<string, LearningPlan> = new Map();

export class PersonalizedTutor {

  /**
   * Main entry point - Creates a complete personalized learning journey
   */
  async createLearningJourney(
    subject: string,
    userLevel: UserLevel,
    userId: string = 'default-user'
  ): Promise<LearningPlan> {
    
    // Step 1: Generate motivation and benefits
    const motivation = await this.generateMotivation(subject, userLevel);
    
    // Step 2: Generate complete syllabus based on level
    const syllabus = await this.generateSyllabus(subject, userLevel);
    
    // Step 3: Create daily schedule with tasks
    const schedule = await this.createSchedule(syllabus, userLevel);
    
    // Step 4: Build the complete learning plan
    const plan: LearningPlan = {
      id: `plan-${Date.now()}-${userId.slice(0, 8)}`,
      userId,
      subject,
      userLevel,
      motivation,
      syllabus,
      schedule,
      progress: {
        completedDays: 0,
        missedDays: 0,
        currentDay: 1,
        percentComplete: 0,
        streak: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Store the plan
    learningPlans.set(plan.id, plan);
    
    // Track learning plan creation
    await analyticsService.trackLearning({
      type: 'learning_start',
      userId,
      planId: plan.id,
      subject,
      progress: 0,
      streak: 0
    });
    
    return plan;
  }

  /**
   * Generate motivation - Why learn this subject and how it helps
   */
  async generateMotivation(subject: string, userLevel: UserLevel): Promise<LearningPlan['motivation']> {
    const prompt = `You are an educational counselor. A ${userLevel.level} level student wants to learn "${subject}".

Generate motivational content explaining:
1. Why should they learn this subject?
2. What career benefits does it offer?
3. What skills will they gain?
4. Real-world applications they can build/do after learning

Make it encouraging and specific to their ${userLevel.level} level.

Return ONLY a JSON object:
\`\`\`json
{
  "whyLearn": ["reason1", "reason2", "reason3", "reason4"],
  "careerBenefits": ["benefit1", "benefit2", "benefit3"],
  "skillsGained": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "realWorldApplications": ["application1", "application2", "application3"]
}
\`\`\``;

    try {
      const response = await geminiClient.generateContent(prompt);
      const text = response.response.text();
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error generating motivation:', error);
    }
    
    // Default fallback
    return {
      whyLearn: [`${subject} is a fundamental skill in today's world`, 'Opens many career opportunities', 'Develops problem-solving abilities'],
      careerBenefits: ['High demand in job market', 'Good salary potential', 'Work in cutting-edge fields'],
      skillsGained: ['Analytical thinking', 'Problem solving', 'Technical expertise'],
      realWorldApplications: ['Build real projects', 'Solve industry problems', 'Create innovative solutions']
    };
  }

  /**
   * Generate syllabus based on user's level
   */
  async generateSyllabus(subject: string, userLevel: UserLevel): Promise<LearningPlan['syllabus']> {
    const prompt = `You are an expert curriculum designer. Create a comprehensive syllabus for "${subject}" for a ${userLevel.level} level student.

Student Profile:
- Level: ${userLevel.level}
- Prior Knowledge: ${userLevel.priorKnowledge.join(', ') || 'None specified'}
- Learning Style: ${userLevel.learningStyle}
- Available Time: ${userLevel.availableHoursPerDay} hours per day
- Target Completion: ${userLevel.targetCompletionDays} days

Create a structured syllabus that:
1. Starts from appropriate foundation based on their level
2. Progresses logically from simple to complex
3. Includes practical examples and exercises
4. Is completable within their time frame

Return ONLY a JSON object:
\`\`\`json
{
  "totalTopics": <number>,
  "topics": [
    {
      "name": "Topic Name",
      "description": "Brief description",
      "subtopics": ["subtopic1", "subtopic2", "subtopic3"],
      "difficulty": "easy|medium|hard",
      "estimatedHours": <number>
    }
  ]
}
\`\`\``;

    try {
      const response = await geminiClient.generateContent(prompt);
      const text = response.response.text();
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error generating syllabus:', error);
    }
    
    // Default fallback
    return {
      totalTopics: 5,
      topics: [
        { name: 'Introduction', description: 'Getting started', subtopics: ['Overview', 'Setup'], difficulty: 'easy', estimatedHours: 2 },
        { name: 'Fundamentals', description: 'Core concepts', subtopics: ['Basics', 'Principles'], difficulty: 'easy', estimatedHours: 4 },
        { name: 'Intermediate Concepts', description: 'Building up', subtopics: ['Advanced basics'], difficulty: 'medium', estimatedHours: 6 },
        { name: 'Advanced Topics', description: 'Deep dive', subtopics: ['Complex topics'], difficulty: 'hard', estimatedHours: 8 },
        { name: 'Projects & Practice', description: 'Apply knowledge', subtopics: ['Project work'], difficulty: 'hard', estimatedHours: 6 }
      ]
    };
  }

  /**
   * Create daily schedule from syllabus
   */
  async createSchedule(syllabus: LearningPlan['syllabus'], userLevel: UserLevel): Promise<LearningPlan['schedule']> {
    const startDate = new Date();
    const dailyTasks: DailyTask[] = [];
    
    let currentDay = 1;
    const minutesPerDay = userLevel.availableHoursPerDay * 60;
    
    for (const topic of syllabus.topics) {
      const topicMinutes = topic.estimatedHours * 60;
      const daysForTopic = Math.ceil(topicMinutes / minutesPerDay);
      
      // Split topic across days
      const subtopicsPerDay = Math.ceil(topic.subtopics.length / daysForTopic);
      
      for (let d = 0; d < daysForTopic; d++) {
        const taskDate = new Date(startDate);
        taskDate.setDate(taskDate.getDate() + currentDay - 1);
        
        const daySubtopics = topic.subtopics.slice(d * subtopicsPerDay, (d + 1) * subtopicsPerDay);
        
        dailyTasks.push({
          id: `task-${currentDay}`,
          day: currentDay,
          date: taskDate.toISOString().split('T')[0],
          topicName: topic.name,
          subtopics: daySubtopics.length > 0 ? daySubtopics : [`${topic.name} - Part ${d + 1}`],
          estimatedMinutes: Math.min(minutesPerDay, topicMinutes - (d * minutesPerDay)),
          status: currentDay === 1 ? 'pending' : 'pending',
          content: {
            explanation: '',
            examples: [],
            keyPoints: [],
            practiceQuestions: []
          }
        });
        
        currentDay++;
      }
    }
    
    const expectedEndDate = new Date(startDate);
    expectedEndDate.setDate(expectedEndDate.getDate() + dailyTasks.length);
    
    return {
      totalDays: dailyTasks.length,
      hoursPerDay: userLevel.availableHoursPerDay,
      startDate: startDate.toISOString().split('T')[0],
      expectedEndDate: expectedEndDate.toISOString().split('T')[0],
      dailyTasks
    };
  }

  /**
   * Generate content for a specific day's task
   */
  async generateDayContent(planId: string, day: number): Promise<DailyTask | null> {
    const plan = learningPlans.get(planId);
    if (!plan) return null;
    
    const task = plan.schedule.dailyTasks.find(t => t.day === day);
    if (!task) return null;
    
    // If content already generated, return it
    if (task.content.explanation) return task;
    
    const prompt = `You are an expert tutor teaching "${plan.subject}" to a ${plan.userLevel.level} level student.

Today's lesson:
- Topic: ${task.topicName}
- Subtopics: ${task.subtopics.join(', ')}
- Time available: ${task.estimatedMinutes} minutes

Create engaging, easy-to-understand content that:
1. Explains concepts simply with analogies
2. Provides practical examples
3. Highlights key points to remember
4. Includes practice questions

Return ONLY a JSON object:
\`\`\`json
{
  "explanation": "Clear, detailed explanation with examples (use markdown formatting)",
  "examples": ["example1", "example2", "example3"],
  "keyPoints": ["key point 1", "key point 2", "key point 3", "key point 4"],
  "practiceQuestions": ["question1", "question2", "question3"]
}
\`\`\``;

    try {
      const response = await geminiClient.generateContent(prompt);
      const text = response.response.text();
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const content = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        task.content = content;
        task.status = 'in_progress';
        plan.updatedAt = new Date();
        return task;
      }
    } catch (error) {
      console.error('Error generating day content:', error);
    }
    
    return task;
  }

  /**
   * Mark a day as completed
   */
  async markDayComplete(planId: string, day: number): Promise<LearningPlan | null> {
    const plan = learningPlans.get(planId);
    if (!plan) return null;
    
    const task = plan.schedule.dailyTasks.find(t => t.day === day);
    if (!task) return null;
    
    task.status = 'completed';
    task.completedAt = new Date();
    
    // Update progress
    const completedTasks = plan.schedule.dailyTasks.filter(t => t.status === 'completed').length;
    plan.progress.completedDays = completedTasks;
    plan.progress.percentComplete = Math.round((completedTasks / plan.schedule.totalDays) * 100);
    plan.progress.currentDay = day + 1;
    plan.progress.streak++;
    
    plan.updatedAt = new Date();
    
    // Track day completion
    await analyticsService.trackLearning({
      type: 'day_complete',
      userId: plan.userId,
      planId: plan.id,
      subject: plan.subject,
      day,
      progress: plan.progress.percentComplete,
      streak: plan.progress.streak
    });
    
    return plan;
  }

  /**
   * Mark a day as missed and generate catch-up plan
   */
  async markDayMissed(planId: string, day: number): Promise<LearningPlan | null> {
    const plan = learningPlans.get(planId);
    if (!plan) return null;
    
    const task = plan.schedule.dailyTasks.find(t => t.day === day);
    if (!task) return null;
    
    task.status = 'missed';
    plan.progress.missedDays++;
    plan.progress.streak = 0;
    
    // Generate catch-up plan
    await this.generateCatchUpPlan(plan);
    
    plan.updatedAt = new Date();
    
    // Track missed day
    await analyticsService.trackLearning({
      type: 'day_missed',
      userId: plan.userId,
      planId: plan.id,
      subject: plan.subject,
      day,
      progress: plan.progress.percentComplete,
      streak: 0
    });
    
    return plan;
  }

  /**
   * Generate catch-up plan for missed days
   */
  async generateCatchUpPlan(plan: LearningPlan): Promise<void> {
    const missedTasks = plan.schedule.dailyTasks.filter(t => t.status === 'missed');
    
    if (missedTasks.length === 0) {
      plan.catchUpPlan = undefined;
      return;
    }
    
    const prompt = `A student learning "${plan.subject}" has missed ${missedTasks.length} day(s) of study.

Missed topics:
${missedTasks.map(t => `- Day ${t.day}: ${t.topicName} (${t.subtopics.join(', ')})`).join('\n')}

Student's available time: ${plan.userLevel.availableHoursPerDay} hours per day

Create a catch-up strategy that:
1. Prioritizes the most important missed content
2. Combines similar topics where possible
3. Spreads catch-up work across upcoming days without overwhelming
4. Ensures no gaps in understanding

Return ONLY a JSON object:
\`\`\`json
{
  "catchUpStrategy": "Detailed strategy explanation for catching up",
  "adjustedDays": [
    {
      "day": <number>,
      "originalTopic": "original planned topic",
      "catchUpTopic": "missed topic to add",
      "combinedMinutes": <number>,
      "priority": "high|medium|low"
    }
  ]
}
\`\`\``;

    try {
      const response = await geminiClient.generateContent(prompt);
      const text = response.response.text();
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const catchUpData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        plan.catchUpPlan = {
          missedTasks,
          catchUpStrategy: catchUpData.catchUpStrategy,
          adjustedSchedule: [] // Would contain adjusted tasks
        };
      }
    } catch (error) {
      console.error('Error generating catch-up plan:', error);
      plan.catchUpPlan = {
        missedTasks,
        catchUpStrategy: `You have ${missedTasks.length} missed day(s). Try to dedicate extra time over the next few days to cover the missed content. Focus on the key concepts first.`,
        adjustedSchedule: []
      };
    }
  }

  /**
   * Get learning plan by ID
   */
  getPlan(planId: string): LearningPlan | undefined {
    return learningPlans.get(planId);
  }

  /**
   * Get all plans for a user
   */
  getUserPlans(userId: string): LearningPlan[] {
    return Array.from(learningPlans.values()).filter(p => p.userId === userId);
  }

  /**
   * Get today's workflow for a plan
   */
  async getTodayWorkflow(planId: string): Promise<{
    greeting: string;
    todayTask: DailyTask | null;
    missedTasks: DailyTask[];
    suggestions: string[];
    motivationalMessage: string;
  } | null> {
    const plan = learningPlans.get(planId);
    if (!plan) return null;
    
    const today = new Date().toISOString().split('T')[0];
    const todayTask = plan.schedule.dailyTasks.find(t => t.date === today);
    const missedTasks = plan.schedule.dailyTasks.filter(t => t.status === 'missed');
    
    const hour = new Date().getHours();
    let greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    
    const suggestions: string[] = [];
    
    if (missedTasks.length > 0) {
      suggestions.push(`📌 You have ${missedTasks.length} missed day(s) to catch up on`);
      suggestions.push('💡 Consider spending 30 extra minutes today to cover missed content');
    }
    
    if (todayTask) {
      suggestions.push(`📚 Today's focus: ${todayTask.topicName}`);
      suggestions.push(`⏱️ Estimated time: ${todayTask.estimatedMinutes} minutes`);
    }
    
    if (plan.progress.streak > 0) {
      suggestions.push(`🔥 You're on a ${plan.progress.streak}-day streak! Keep it up!`);
    }
    
    const motivationalMessages = [
      "Every expert was once a beginner. Keep going!",
      "Small progress is still progress. You're doing great!",
      "Consistency beats intensity. Show up today!",
      "The more you learn, the more you earn. Let's study!",
      "Your future self will thank you for studying today."
    ];
    
    return {
      greeting: `${greeting}! Ready to continue learning ${plan.subject}?`,
      todayTask: todayTask || null,
      missedTasks,
      suggestions,
      motivationalMessage: motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]
    };
  }

  /**
   * Format a learning plan as a readable chat message
   */
  formatPlanAsMessage(plan: LearningPlan): string {
    const { motivation, syllabus, schedule, progress } = plan;
    
    let message = `# 🎓 Your Personalized Learning Path: ${plan.subject}\n\n`;
    
    // Why Learn Section
    message += `## 💡 Why Learn ${plan.subject}?\n`;
    motivation.whyLearn.forEach(reason => {
      message += `- ${reason}\n`;
    });
    message += '\n';
    
    // Career Benefits
    message += `## 🚀 Career Benefits\n`;
    motivation.careerBenefits.forEach(benefit => {
      message += `- ${benefit}\n`;
    });
    message += '\n';
    
    // Skills You'll Gain
    message += `## 🛠️ Skills You'll Gain\n`;
    motivation.skillsGained.forEach(skill => {
      message += `- ${skill}\n`;
    });
    message += '\n';
    
    // Real World Applications
    message += `## 🌍 Real-World Applications\n`;
    motivation.realWorldApplications.forEach(app => {
      message += `- ${app}\n`;
    });
    message += '\n';
    
    // Syllabus Overview
    message += `## 📚 Your Syllabus (${syllabus.totalTopics} Topics)\n`;
    syllabus.topics.forEach((topic, i) => {
      message += `\n### ${i + 1}. ${topic.name}\n`;
      message += `*${topic.description}*\n`;
      message += `- Difficulty: ${topic.difficulty} | Time: ~${topic.estimatedHours} hours\n`;
      message += `- Subtopics: ${topic.subtopics.slice(0, 3).join(', ')}${topic.subtopics.length > 3 ? '...' : ''}\n`;
    });
    message += '\n';
    
    // Study Plan
    message += `## 📅 Your Study Plan\n`;
    message += `- **Total Days:** ${schedule.totalDays} days\n`;
    message += `- **Daily Commitment:** ${schedule.hoursPerDay} hours/day\n`;
    message += `- **Start Date:** ${schedule.startDate}\n`;
    message += `- **Target Completion:** ${schedule.expectedEndDate}\n\n`;
    
    // Daily Workflow Preview (first 5 days)
    message += `### 📋 Daily Schedule Preview\n`;
    schedule.dailyTasks.slice(0, 5).forEach(task => {
      const statusIcon = task.status === 'completed' ? '✅' : task.status === 'missed' ? '❌' : '📝';
      message += `- **Day ${task.day}** (${task.date}): ${statusIcon} ${task.topicName}\n`;
      message += `  - Topics: ${task.subtopics.join(', ')}\n`;
      message += `  - Time: ~${task.estimatedMinutes} min\n`;
    });
    if (schedule.dailyTasks.length > 5) {
      message += `\n*...and ${schedule.dailyTasks.length - 5} more days*\n`;
    }
    message += '\n';
    
    // How to Use
    message += `## 🎯 How to Complete This Course\n`;
    message += `1. **Start each day** by saying "show today's task"\n`;
    message += `2. **Read the content** and take notes\n`;
    message += `3. **Practice** with the questions provided\n`;
    message += `4. **Mark complete** when done: "mark day complete"\n`;
    message += `5. **If you miss a day**, say "I missed a day" and I'll help you catch up!\n\n`;
    
    // Motivation
    message += `---\n💪 *Remember: Consistency is key. Even 30 minutes a day adds up to mastery!*\n`;
    
    return message;
  }
}

export const personalizedTutor = new PersonalizedTutor();
