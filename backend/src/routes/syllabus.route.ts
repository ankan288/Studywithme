// Syllabus Routes - API endpoints for syllabus-driven learning
import { Router } from 'express';
import { syllabusController } from '../controllers/syllabus.controller';

const router = Router();

// ==================== SYLLABUS MANAGEMENT ====================

// POST /api/syllabus - Create syllabus from subject name or syllabus text
// Body: { type: 'subject_name' | 'syllabus_text', content: string, targetLevel?, examType? }
router.post('/', (req, res) => syllabusController.createSyllabus(req, res));

// GET /api/syllabus - Get all syllabi
router.get('/', (req, res) => syllabusController.getAllSyllabi(req, res));

// GET /api/syllabus/:id - Get syllabus by ID
router.get('/:id', (req, res) => syllabusController.getSyllabus(req, res));

// GET /api/syllabus/:syllabusId/topic/:topicId - Get enriched topic details
router.get('/:syllabusId/topic/:topicId', (req, res) => syllabusController.getTopicDetails(req, res));

// ==================== LEARNING PATH ====================

// POST /api/syllabus/learning-path - Create personalized learning path
// Body: { syllabusId, userId, preferences?: { pace, depth, focusTopics } }
router.post('/learning-path', (req, res) => syllabusController.createLearningPath(req, res));

// GET /api/syllabus/learning-path/:pathId - Get learning path
router.get('/learning-path/:pathId', (req, res) => syllabusController.getLearningPath(req, res));

// GET /api/syllabus/user/:userId/paths - Get all learning paths for user
router.get('/user/:userId/paths', (req, res) => syllabusController.getUserLearningPaths(req, res));

// POST /api/syllabus/learning-path/:pathId/complete - Mark module as complete
// Body: { moduleId, score, timeSpent, incorrectAreas }
router.post('/learning-path/:pathId/complete', (req, res) => syllabusController.completeModule(req, res));

// ==================== QUESTIONS & ASSESSMENTS ====================

// POST /api/syllabus/questions - Generate questions for a topic
// Body: { syllabusId, topicId, count?, types?, difficulty?, includeExamStyle? }
router.post('/questions', (req, res) => syllabusController.generateQuestions(req, res));

// POST /api/syllabus/exam - Generate mock exam
// Body: { syllabusId, duration?, totalMarks?, pattern?, focusTopics? }
router.post('/exam', (req, res) => syllabusController.generateExam(req, res));

// POST /api/syllabus/revision - Generate quick revision quiz
// Body: { syllabusId, topicIds? }
router.post('/revision', (req, res) => syllabusController.generateRevision(req, res));

// POST /api/syllabus/adaptive-test - Generate adaptive assessment based on performance
// Body: { syllabusId, userId }
router.post('/adaptive-test', (req, res) => syllabusController.generateAdaptiveTest(req, res));

// POST /api/syllabus/submit - Submit assessment answers
// Body: { questionSetId, userId, answers: { questionId: answer } }
router.post('/submit', (req, res) => syllabusController.submitAssessment(req, res));

// ==================== PROGRESS ====================

// GET /api/syllabus/progress/:userId/:syllabusId - Get user progress
router.get('/progress/:userId/:syllabusId', (req, res) => syllabusController.getUserProgress(req, res));

export default router;
