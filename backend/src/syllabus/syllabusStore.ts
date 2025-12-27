// Syllabus Store - In-memory storage for syllabi and learning paths
import { ParsedSyllabus } from './syllabusParser';
import { LearningPath } from './learningPathGenerator';
import { QuestionSet } from './questionGenerator';

interface UserProgress {
  userId: string;
  syllabusId: string;
  completedTopics: string[];
  topicScores: Record<string, number>;
  totalTimeSpent: number;
  lastAccessed: Date;
  strongTopics: string[];
  weakTopics: string[];
  recentMistakes: string[];
}

class SyllabusStore {
  private syllabi: Map<string, ParsedSyllabus> = new Map();
  private learningPaths: Map<string, LearningPath> = new Map();
  private questionSets: Map<string, QuestionSet> = new Map();
  private userProgress: Map<string, UserProgress> = new Map();

  // Syllabus operations
  saveSyllabus(syllabus: ParsedSyllabus): string {
    const id = `syllabus-${syllabus.subjectName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    this.syllabi.set(id, syllabus);
    return id;
  }

  getSyllabus(id: string): ParsedSyllabus | undefined {
    return this.syllabi.get(id);
  }

  getAllSyllabi(): ParsedSyllabus[] {
    return Array.from(this.syllabi.values());
  }

  getSyllabusBySubject(subjectName: string): ParsedSyllabus | undefined {
    return Array.from(this.syllabi.values()).find(
      s => s.subjectName.toLowerCase() === subjectName.toLowerCase()
    );
  }

  // Learning path operations
  saveLearningPath(path: LearningPath): void {
    this.learningPaths.set(path.id, path);
  }

  getLearningPath(id: string): LearningPath | undefined {
    return this.learningPaths.get(id);
  }

  getUserLearningPaths(userId: string): LearningPath[] {
    return Array.from(this.learningPaths.values()).filter(p => p.userId === userId);
  }

  updateLearningPath(path: LearningPath): void {
    this.learningPaths.set(path.id, path);
  }

  // Question set operations
  saveQuestionSet(questionSet: QuestionSet): void {
    this.questionSets.set(questionSet.id, questionSet);
  }

  getQuestionSet(id: string): QuestionSet | undefined {
    return this.questionSets.get(id);
  }

  getQuestionSetsBySyllabus(syllabusId: string): QuestionSet[] {
    return Array.from(this.questionSets.values()).filter(q => q.syllabusId === syllabusId);
  }

  // User progress operations
  getUserProgress(userId: string, syllabusId: string): UserProgress | undefined {
    return this.userProgress.get(`${userId}-${syllabusId}`);
  }

  updateUserProgress(progress: UserProgress): void {
    this.userProgress.set(`${progress.userId}-${progress.syllabusId}`, progress);
  }

  initializeUserProgress(userId: string, syllabusId: string): UserProgress {
    const progress: UserProgress = {
      userId,
      syllabusId,
      completedTopics: [],
      topicScores: {},
      totalTimeSpent: 0,
      lastAccessed: new Date(),
      strongTopics: [],
      weakTopics: [],
      recentMistakes: []
    };
    this.userProgress.set(`${userId}-${syllabusId}`, progress);
    return progress;
  }

  recordTopicCompletion(
    userId: string, 
    syllabusId: string, 
    topicId: string, 
    score: number,
    timeSpent: number,
    mistakes: string[]
  ): UserProgress {
    const key = `${userId}-${syllabusId}`;
    let progress = this.userProgress.get(key);
    
    if (!progress) {
      progress = this.initializeUserProgress(userId, syllabusId);
    }

    // Update progress
    if (!progress.completedTopics.includes(topicId)) {
      progress.completedTopics.push(topicId);
    }
    progress.topicScores[topicId] = score;
    progress.totalTimeSpent += timeSpent;
    progress.lastAccessed = new Date();
    
    // Update strong/weak topics
    if (score >= 80) {
      if (!progress.strongTopics.includes(topicId)) {
        progress.strongTopics.push(topicId);
      }
      progress.weakTopics = progress.weakTopics.filter(t => t !== topicId);
    } else if (score < 60) {
      if (!progress.weakTopics.includes(topicId)) {
        progress.weakTopics.push(topicId);
      }
      progress.strongTopics = progress.strongTopics.filter(t => t !== topicId);
    }
    
    // Track recent mistakes (keep last 10)
    progress.recentMistakes = [...mistakes, ...progress.recentMistakes].slice(0, 10);
    
    this.userProgress.set(key, progress);
    return progress;
  }

  getLeaderboard(syllabusId: string, limit: number = 10): { userId: string; score: number; progress: number }[] {
    const progressEntries = Array.from(this.userProgress.values())
      .filter(p => p.syllabusId === syllabusId)
      .map(p => ({
        userId: p.userId,
        score: Object.values(p.topicScores).reduce((a, b) => a + b, 0) / 
               Math.max(Object.keys(p.topicScores).length, 1),
        progress: p.completedTopics.length
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    return progressEntries;
  }
}

export const syllabusStore = new SyllabusStore();
