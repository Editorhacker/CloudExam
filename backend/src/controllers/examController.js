const { Response } = require('express');
const { db } = require('../config/firebase');
const { AuthRequest } = require('../middleware/authMiddleware');

// ======================== ADMIN ENDPOINTS ========================

const createExam = async (req, res) => {
  try {
    const { title, description, durationMinutes, questions } = req.body;
    
    const examRef = db.collection('exams').doc();
    const newExam = {
      id: examRef.id,
      title,
      description,
      durationMinutes,
      questions, // Array of { questionText, options, correctOptionIndex, subject }
      createdAt: new Date().toISOString()
    };

    await examRef.set(newExam);
    return res.status(201).json({ message: 'Exam created successfully', exam: newExam });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getExamsAdmin = async (req,  res) => {
  try {
    const examsSnapshot = await db.collection('exams').get();
    const exams = examsSnapshot.docs.map(doc => doc.data());
    return res.status(200).json({ exams });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

 const getExamSubmissionsAdmin = async (req, res) => {
    try {
      const submissionsSnapshot = await db.collection('results').get();
      const submissions = submissionsSnapshot.docs.map(doc => doc.data());
      return res.status(200).json({ submissions });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  };

// ======================== STUDENT ENDPOINTS ========================

 const getAvailableExams = async (req, res) => {
  try {
    const examsSnapshot = await db.collection('exams').get();
    // For students, we might want to exclude the correct option index here
    const exams = examsSnapshot.docs.map(doc => {
      const data = doc.data();
      const questionsForStudent = data.questions ? data.questions.map((q) => ({
         questionText: q.questionText,
         options: q.options,
         subject: q.subject
      })) : [];
      return {
        ...data,
        questions: questionsForStudent
      };
    });
    return res.status(200).json({ exams });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

 const getExamById = async (req, res) => {
    try {
      const { id } = req.params;
      const examDoc = await db.collection('exams').doc(id).get();
      if (!examDoc.exists) return res.status(404).json({ message: 'Exam not found' });
      
      const data = examDoc.data();
      // Remove correct option index
      const questionsForStudent = data?.questions ? data.questions.map((q) => ({
         questionText: q.questionText,
         options: q.options,
         subject: q.subject
      })) : [];

      return res.status(200).json({ exam: { ...data, questions: questionsForStudent } });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  };

 const submitExam = async (req, res) => {
  try {
    const { examId, answers } = req.body;
    const studentId = req.user?.id;
    const studentName = req.user?.role; // we can fetch name from db, we will store it just

    if (!studentId) return res.status(401).json({ message: 'Unauthorized' });

    // Fetch the actual exam to grade it
    const examDoc = await db.collection('exams').doc(examId).get();
    if (!examDoc.exists) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const examData = examDoc.data();
    if (!examData) return res.status(404).json({ message: 'Exam data missing' });

    let score = 0;
    const totalMarks = examData.questions?.length || 0;

    const evaluation = examData.questions.map((q, index) => {
      const studentAnswer = answers[index];
      const isCorrect = studentAnswer === q.correctOptionIndex;
      if (isCorrect) score++;
      return {
        questionText: q.questionText,
        selectedOption: studentAnswer,
        correctOption: q.correctOptionIndex,
        isCorrect
      };
    });

    const resultRef = db.collection('results').doc();
    const resultDoc = {
      id: resultRef.id,
      studentId,
      examId,
      examTitle: examData.title,
      score,
      totalMarks,
      evaluation,
      submittedAt: new Date().toISOString()
    };

    await resultRef.set(resultDoc);
    return res.status(200).json({ message: 'Exam submitted successfully', result: resultDoc });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getStudentResults = async (req, res) => {
    try {
      const studentId = req.user?.id;
      const resultsSnapshot = await db.collection('results').where('studentId', '==', studentId).get();
      const results = resultsSnapshot.docs.map(doc => doc.data());
      return res.status(200).json({ results });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
  createExam,
  getExamsAdmin,
  getExamSubmissionsAdmin,
  getAvailableExams,
  getExamById,
  submitExam,
  getStudentResults
};