const { Router } = require('express');

const { authenticate, requireAdmin } = require('../middleware/authMiddleware.js');
const { 
  createExam, 
  getExamsAdmin, 
  getExamSubmissionsAdmin,
  getAvailableExams,
  getExamById,
  submitExam,
  getStudentResults
} = require('../controllers/examController.js');

const router = Router();

// Apply authentication middleware to all routes here
router.use(authenticate);

// Admin routes
router.post('/admin', requireAdmin, createExam);
router.get('/admin', requireAdmin, getExamsAdmin);
router.get('/admin/submissions', requireAdmin, getExamSubmissionsAdmin);

// Student routes
router.get('/student', getAvailableExams);
router.get('/student/:id', getExamById);
router.post('/student/submit', submitExam);
router.get('/student/results/me', getStudentResults);

module.exports = router;