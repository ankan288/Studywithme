// Syllabus Controller - Handles all syllabus-related API endpoints
import { Request, Response } from 'express';
import { parseSyllabus, enrichTopicDetails, SyllabusInput } from '../syllabus/syllabusParser';
import { generateLearningPath, adaptLearningPath, getNextRecommendedModule } from '../syllabus/learningPathGenerator';
import { 
  generateTopicQuestions, 
  generateMockExam, 
  generateQuickRevision,
  generateAdaptiveAssessment 
} from '../syllabus/questionGenerator';
import { syllabusStore } from '../syllabus/syllabusStore';

export class SyllabusController {
  // Create syllabus from subject name or syllabus text
  async createSyllabus(req: Request, res: Response) {
    try {
      const { type, content, additionalContext, targetLevel, examType } = req.body;

      if (!content) {
        return res.status(400).json({ 
          error: 'Content is required. Provide either a subject name or syllabus text.' 
        });
      }

      const input: SyllabusInput = {
        type: type || 'subject_name',
        content,
        additionalContext,
        targetLevel,
        examType
      };

      console.log(`📚 Creating syllabus for: ${content.substring(0, 50)}...`);
      
      const parsedSyllabus = await parseSyllabus(input);
      const syllabusId = syllabusStore.saveSyllabus(parsedSyllabus);

      res.json({
        success: true,
        syllabusId,
        syllabus: parsedSyllabus,
        message: `Successfully created syllabus for "${parsedSyllabus.subjectName}" with ${parsedSyllabus.totalTopics} topics`
      });
    } catch (error: any) {
      console.error('Error creating syllabus:', error);
      res.status(500).json({ error: error.message || 'Failed to create syllabus' });
    }
  }

  // Get syllabus by ID
  async getSyllabus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const syllabus = syllabusStore.getSyllabus(id);
      
      if (!syllabus) {
        return res.status(404).json({ error: 'Syllabus not found' });
      }
      
      res.json({ syllabus });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get all syllabi
  async getAllSyllabi(req: Request, res: Response) {
    try {
      const syllabi = syllabusStore.getAllSyllabi();
      res.json({ syllabi, count: syllabi.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get enriched topic details
  async getTopicDetails(req: Request, res: Response) {
    try {
      const { syllabusId, topicId } = req.params;
      
      const syllabus = syllabusStore.getSyllabus(syllabusId);
      if (!syllabus) {
        return res.status(404).json({ error: 'Syllabus not found' });
      }

      const topic = syllabus.topics.find(t => t.id === topicId);
      if (!topic) {
        return res.status(404).json({ error: 'Topic not found' });
      }

      const enrichedTopic = await enrichTopicDetails(topic, syllabus.subjectName);
      res.json({ topic: enrichedTopic });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Generate learning path for user
  async createLearningPath(req: Request, res: Response) {
    try {
      const { syllabusId, userId, preferences } = req.body;

      if (!syllabusId || !userId) {
        return res.status(400).json({ error: 'syllabusId and userId are required' });
      }

      const syllabus = syllabusStore.getSyllabus(syllabusId);
      if (!syllabus) {
        return res.status(404).json({ error: 'Syllabus not found' });
      }

      console.log(`🛤️ Generating learning path for user ${userId}`);
      
      const learningPath = await generateLearningPath(syllabus, userId, preferences);
      syllabusStore.saveLearningPath(learningPath);
      syllabusStore.initializeUserProgress(userId, syllabusId);

      res.json({
        success: true,
        learningPath,
        message: `Created learning path with ${learningPath.totalModules} modules`
      });
    } catch (error: any) {
      console.error('Error creating learning path:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get user's learning path
  async getLearningPath(req: Request, res: Response) {
    try {
      const { pathId } = req.params;
      
      const path = syllabusStore.getLearningPath(pathId);
      if (!path) {
        return res.status(404).json({ error: 'Learning path not found' });
      }

      const nextModule = getNextRecommendedModule(path);
      
      res.json({ 
        learningPath: path,
        nextRecommendedModule: nextModule
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get all learning paths for a user
  async getUserLearningPaths(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const paths = syllabusStore.getUserLearningPaths(userId);
      res.json({ learningPaths: paths, count: paths.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Update learning path after module completion
  async completeModule(req: Request, res: Response) {
    try {
      const { pathId } = req.params;
      const { moduleId, score, timeSpent, incorrectAreas } = req.body;

      const path = syllabusStore.getLearningPath(pathId);
      if (!path) {
        return res.status(404).json({ error: 'Learning path not found' });
      }

      const updatedPath = await adaptLearningPath(path, {
        moduleId,
        score,
        timeSpent,
        incorrectAreas: incorrectAreas || []
      });

      syllabusStore.updateLearningPath(updatedPath);

      // Update user progress
      const module = path.modules.find(m => m.id === moduleId);
      if (module) {
        syllabusStore.recordTopicCompletion(
          path.userId,
          path.syllabusId,
          module.topicId,
          score,
          timeSpent,
          incorrectAreas || []
        );
      }

      res.json({
        success: true,
        learningPath: updatedPath,
        nextModule: getNextRecommendedModule(updatedPath),
        message: score >= 70 ? 'Great job! Moving to next module.' : 'Keep practicing to improve!'
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Generate questions for a topic
  async generateQuestions(req: Request, res: Response) {
    try {
      const { syllabusId, topicId, count, types, difficulty, includeExamStyle } = req.body;

      const syllabus = syllabusStore.getSyllabus(syllabusId);
      if (!syllabus) {
        return res.status(404).json({ error: 'Syllabus not found' });
      }

      const topic = syllabus.topics.find(t => t.id === topicId);
      if (!topic) {
        return res.status(404).json({ error: 'Topic not found' });
      }

      console.log(`❓ Generating ${count || 10} questions for topic: ${topic.name}`);

      const questions = await generateTopicQuestions(topic, syllabus.subjectName, {
        count,
        types,
        difficulty,
        includeExamStyle
      });

      res.json({
        success: true,
        topic: topic.name,
        questions,
        count: questions.length
      });
    } catch (error: any) {
      console.error('Error generating questions:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Generate mock exam
  async generateExam(req: Request, res: Response) {
    try {
      const { syllabusId, duration, totalMarks, pattern, focusTopics } = req.body;

      const syllabus = syllabusStore.getSyllabus(syllabusId);
      if (!syllabus) {
        return res.status(404).json({ error: 'Syllabus not found' });
      }

      console.log(`📝 Generating mock exam for: ${syllabus.subjectName}`);

      const exam = await generateMockExam(syllabus, {
        duration,
        totalMarks,
        pattern,
        focusTopics
      });

      syllabusStore.saveQuestionSet(exam);

      res.json({
        success: true,
        exam,
        message: `Generated exam with ${exam.totalQuestions} questions, ${exam.totalMarks} marks, ${exam.duration} minutes`
      });
    } catch (error: any) {
      console.error('Error generating exam:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Generate quick revision quiz
  async generateRevision(req: Request, res: Response) {
    try {
      const { syllabusId, topicIds } = req.body;

      const syllabus = syllabusStore.getSyllabus(syllabusId);
      if (!syllabus) {
        return res.status(404).json({ error: 'Syllabus not found' });
      }

      console.log(`🔄 Generating quick revision for: ${syllabus.subjectName}`);

      const revision = await generateQuickRevision(syllabus, topicIds);
      syllabusStore.saveQuestionSet(revision);

      res.json({
        success: true,
        revision,
        message: `Generated ${revision.totalQuestions} revision questions`
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Generate adaptive assessment based on user performance
  async generateAdaptiveTest(req: Request, res: Response) {
    try {
      const { syllabusId, userId } = req.body;

      const syllabus = syllabusStore.getSyllabus(syllabusId);
      if (!syllabus) {
        return res.status(404).json({ error: 'Syllabus not found' });
      }

      const progress = syllabusStore.getUserProgress(userId, syllabusId);
      if (!progress) {
        return res.status(404).json({ error: 'No learning progress found. Complete some modules first.' });
      }

      console.log(`🎯 Generating adaptive assessment for user ${userId}`);

      const assessment = await generateAdaptiveAssessment(syllabus, {
        strongTopics: progress.strongTopics,
        weakTopics: progress.weakTopics,
        averageScore: Object.values(progress.topicScores).reduce((a, b) => a + b, 0) / 
                      Math.max(Object.keys(progress.topicScores).length, 1),
        recentMistakes: progress.recentMistakes
      });

      syllabusStore.saveQuestionSet(assessment);

      res.json({
        success: true,
        assessment,
        focusAreas: progress.weakTopics,
        message: `Personalized assessment focusing on your weak areas`
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get user progress
  async getUserProgress(req: Request, res: Response) {
    try {
      const { userId, syllabusId } = req.params;
      
      const progress = syllabusStore.getUserProgress(userId, syllabusId);
      if (!progress) {
        return res.status(404).json({ error: 'No progress found' });
      }

      res.json({ progress });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Submit assessment answers and get results
  async submitAssessment(req: Request, res: Response) {
    try {
      const { questionSetId, userId, answers } = req.body;
      
      const questionSet = syllabusStore.getQuestionSet(questionSetId);
      if (!questionSet) {
        return res.status(404).json({ error: 'Question set not found' });
      }

      // Grade answers
      let totalScore = 0;
      let maxScore = 0;
      const results: any[] = [];
      const mistakes: string[] = [];

      for (const question of questionSet.questions) {
        const userAnswer = answers[question.id];
        const isCorrect = userAnswer?.toLowerCase().trim() === 
                         question.correctAnswer.toLowerCase().trim() ||
                         question.correctAnswer.toLowerCase().includes(userAnswer?.toLowerCase().trim());
        
        if (isCorrect) {
          totalScore += question.marks;
        } else {
          mistakes.push(question.topicName);
        }
        maxScore += question.marks;

        results.push({
          questionId: question.id,
          question: question.question,
          yourAnswer: userAnswer || 'Not answered',
          correctAnswer: question.correctAnswer,
          isCorrect,
          marks: isCorrect ? question.marks : 0,
          maxMarks: question.marks,
          explanation: question.explanation
        });
      }

      const percentage = Math.round((totalScore / maxScore) * 100);

      // Update user progress
      if (userId && questionSet.syllabusId) {
        syllabusStore.recordTopicCompletion(
          userId,
          questionSet.syllabusId,
          'assessment',
          percentage,
          0,
          [...new Set(mistakes)]
        );
      }

      res.json({
        success: true,
        score: totalScore,
        maxScore,
        percentage,
        grade: percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'Needs Improvement',
        results,
        weakAreas: [...new Set(mistakes)],
        feedback: percentage >= 80 
          ? 'Excellent work! You have a strong understanding of the material.'
          : percentage >= 60
          ? 'Good effort! Review the topics you missed and try again.'
          : 'Keep studying! Focus on the weak areas identified above.'
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const syllabusController = new SyllabusController();
