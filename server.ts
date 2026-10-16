import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  authenticateUser,
  registerUser,
  getUserByToken,
  logoutUser,
  getAssignments,
  getAssignmentById,
  saveAssignment,
  getAssessmentById,
  getAssessmentByAssignmentId,
  saveAssessment,
  getReviews,
  getReviewById,
  getReviewByAssignmentId,
  saveReview,
} from './server/db.ts';
import {
  analyzeAssignmentWithGemini,
  generateVivaQuestionsWithGemini,
  generateFollowUpQuestion,
  evaluateAssessmentWithGemini,
  isGeminiConfigured,
} from './server/geminiService.ts';
import { User, Assignment, Assessment, Review } from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '30mb' }));

// Auth middleware
interface AuthRequest extends Request {
  user?: User;
}

function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }

  const token = authHeader.substring(7);
  const user = getUserByToken(token);
  if (!user) {
    res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
    return;
  }

  req.user = user;
  next();
}

function requireTeacher(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'teacher') {
    res.status(403).json({ error: 'Teacher authorization required to access this resource.' });
    return;
  }
  next();
}

// ================= API Routes =================

// Health / Status
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: isGeminiConfigured(),
    model: 'gemini-3.8-flash',
    system: 'VivaVoce AI Verification System',
  });
});

// Auth
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, password, role, facultyPasscode } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const result = registerUser(name, email, password, role || 'student', facultyPasscode);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed.' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const result = authenticateUser(email, password);
    if (!result) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Login failed due to an internal error.' });
  }
});

app.get('/api/auth/me', requireAuth, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

app.post('/api/auth/logout', requireAuth, (req: AuthRequest, res: Response) => {
  const token = req.headers.authorization?.substring(7);
  if (token) {
    logoutUser(token);
  }
  res.json({ success: true });
});

// Assignments
app.get('/api/assignments', requireAuth, (req: AuthRequest, res: Response) => {
  const isTeacher = req.user?.role === 'teacher';
  const list = getAssignments(req.user?.id, isTeacher);
  res.json(list);
});

app.get('/api/assignments/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const assignment = getAssignmentById(req.params.id);
  if (!assignment) {
    res.status(404).json({ error: 'Assignment not found.' });
    return;
  }

  // Authorization check: student can only view their own assignment
  if (req.user?.role !== 'teacher' && assignment.studentId !== req.user?.id) {
    res.status(403).json({ error: 'Unauthorized to view this assignment.' });
    return;
  }

  res.json(assignment);
});

app.post('/api/assignments', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { title, course, instructions, fileName, fileSize, fileType, extractedText } = req.body;

    if (!title || !course) {
      res.status(400).json({ error: 'Assignment title and course are required.' });
      return;
    }

    if (!extractedText || extractedText.trim().length < 50) {
      res.status(400).json({
        error: 'Assignment content appears empty or too short. Please provide at least 50 characters of readable text.',
      });
      return;
    }

    const newAssignment: Assignment = {
      id: `asgn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      studentId: req.user!.id,
      studentName: req.user!.name,
      studentEmail: req.user!.email,
      title: title.trim(),
      course: course.trim(),
      instructions: instructions?.trim(),
      fileName: fileName || 'assignment_submission.txt',
      fileSize: fileSize || extractedText.length,
      fileType: fileType || 'text/plain',
      extractedText: extractedText.trim(),
      submissionDate: new Date().toISOString(),
      analysisStatus: 'uploaded',
    };

    saveAssignment(newAssignment);
    res.status(201).json(newAssignment);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create assignment submission.' });
  }
});

// AI Assignment Analysis & Viva Question Generation
app.post('/api/assignments/:id/analyze', requireAuth, async (req: AuthRequest, res: Response) => {
  const assignment = getAssignmentById(req.params.id);
  if (!assignment) {
    res.status(404).json({ error: 'Assignment not found.' });
    return;
  }

  if (req.user?.role !== 'teacher' && assignment.studentId !== req.user?.id) {
    res.status(403).json({ error: 'Unauthorized to trigger analysis.' });
    return;
  }

  try {
    // Stage 1: Analyzing concepts
    assignment.analysisStatus = 'analyzing';
    saveAssignment(assignment);

    const analysis = await analyzeAssignmentWithGemini(
      assignment.title,
      assignment.course,
      assignment.extractedText
    );
    assignment.analysis = analysis;

    // Stage 2: Generating personalized questions
    assignment.analysisStatus = 'generating';
    saveAssignment(assignment);

    const questions = await generateVivaQuestionsWithGemini(
      assignment.title,
      assignment.course,
      assignment.extractedText,
      analysis
    );

    // Create or update associated assessment
    let assessment = getAssessmentByAssignmentId(assignment.id);
    if (!assessment) {
      assessment = {
        id: `asmt_${assignment.id.replace('asgn_', '')}`,
        assignmentId: assignment.id,
        studentId: assignment.studentId,
        studentName: assignment.studentName,
        assignmentTitle: assignment.title,
        status: 'not_started',
        questions,
      };
    } else {
      assessment.questions = questions;
      assessment.status = 'not_started';
    }

    saveAssessment(assessment);

    assignment.analysisStatus = 'ready';
    saveAssignment(assignment);

    res.json({ assignment, assessmentId: assessment.id });
  } catch (err: any) {
    console.error('Analysis error:', err);
    assignment.analysisStatus = 'error';
    assignment.errorMessage = err.message || 'Failed to complete AI analysis.';
    saveAssignment(assignment);
    res.status(500).json({ error: assignment.errorMessage });
  }
});

// Assessments
app.get('/api/assessments/:id', requireAuth, (req: AuthRequest, res: Response) => {
  let assessment = getAssessmentById(req.params.id);
  if (!assessment) {
    // Try lookup by assignmentId
    assessment = getAssessmentByAssignmentId(req.params.id);
  }

  if (!assessment) {
    res.status(404).json({ error: 'Assessment not found.' });
    return;
  }

  if (req.user?.role !== 'teacher' && assessment.studentId !== req.user?.id) {
    res.status(403).json({ error: 'Unauthorized to view this assessment.' });
    return;
  }

  // Student protection: do not reveal evaluationGuide rubrics before student completes the viva
  if (req.user?.role === 'student' && assessment.status !== 'completed' && assessment.status !== 'evaluated') {
    const studentSafeAssessment = {
      ...assessment,
      questions: assessment.questions.map((q) => {
        const { evaluationGuide: _, evaluation: __, ...safeQuestion } = q;
        return safeQuestion;
      }),
    };
    res.json(studentSafeAssessment);
    return;
  }

  res.json(assessment);
});

// Submit answer for a question
app.post('/api/assessments/:id/submit-answer', requireAuth, async (req: AuthRequest, res: Response) => {
  const assessment = getAssessmentById(req.params.id);
  if (!assessment) {
    res.status(404).json({ error: 'Assessment not found.' });
    return;
  }

  if (req.user?.role !== 'teacher' && assessment.studentId !== req.user?.id) {
    res.status(403).json({ error: 'Unauthorized to submit answers to this assessment.' });
    return;
  }

  const { questionId, answer, isFollowUp } = req.body;
  if (!questionId || typeof answer !== 'string') {
    res.status(400).json({ error: 'questionId and answer string are required.' });
    return;
  }

  const q = assessment.questions.find((x) => x.id === questionId);
  if (!q) {
    res.status(404).json({ error: 'Question not found in this assessment.' });
    return;
  }

  if (isFollowUp) {
    q.followUpAnswer = answer.trim();
  } else {
    q.studentAnswer = answer.trim();
    q.answeredAt = new Date().toISOString();

    // Check if we should generate a dynamic follow-up question
    if (answer.trim().length > 10 && !q.followUpQuestion) {
      try {
        const followUp = await generateFollowUpQuestion(q.questionText, answer, q.evaluationGuide);
        if (followUp) {
          q.followUpQuestion = followUp;
        }
      } catch (err) {
        // Non-blocking
      }
    }
  }

  assessment.status = 'in_progress';
  if (!assessment.startedAt) {
    assessment.startedAt = new Date().toISOString();
  }

  saveAssessment(assessment);
  res.json({
    success: true,
    question: {
      id: q.id,
      answered: Boolean(q.studentAnswer),
      followUpQuestion: q.followUpQuestion,
      hasFollowUpAnswer: Boolean(q.followUpAnswer),
    },
  });
});

// Evaluate completed assessment
app.post('/api/assessments/:id/evaluate', requireAuth, async (req: AuthRequest, res: Response) => {
  const assessment = getAssessmentById(req.params.id);
  if (!assessment) {
    res.status(404).json({ error: 'Assessment not found.' });
    return;
  }

  if (req.user?.role !== 'teacher' && assessment.studentId !== req.user?.id) {
    res.status(403).json({ error: 'Unauthorized to evaluate this assessment.' });
    return;
  }

  const assignment = getAssignmentById(assessment.assignmentId);
  if (!assignment) {
    res.status(404).json({ error: 'Associated assignment not found.' });
    return;
  }

  try {
    const { evaluatedQuestions, overallScores, understandingReport, reviewStatus, inconsistencies } =
      await evaluateAssessmentWithGemini(
        assignment.title,
        assignment.extractedText,
        assessment.questions
      );

    assessment.questions = evaluatedQuestions;
    assessment.overallScores = overallScores;
    assessment.understandingReport = understandingReport;
    assessment.status = 'evaluated';
    assessment.completedAt = new Date().toISOString();

    saveAssessment(assessment);

    // Create or update Teacher Review record
    let review = getReviewByAssignmentId(assignment.id);
    if (!review) {
      review = {
        id: `rev_${assignment.id.replace('asgn_', '')}`,
        assignmentId: assignment.id,
        assessmentId: assessment.id,
        studentId: assignment.studentId,
        studentName: assignment.studentName,
        studentEmail: assignment.studentEmail,
        assignmentTitle: assignment.title,
        course: assignment.course,
        submissionDate: assignment.submissionDate,
        understandingScore: overallScores.totalScore,
        reviewStatus,
        inconsistencies,
        teacherDecision: 'Pending Review',
      };
    } else {
      review.understandingScore = overallScores.totalScore;
      review.reviewStatus = reviewStatus;
      review.inconsistencies = inconsistencies;
    }

    saveReview(review);

    res.json({
      success: true,
      assessment,
      reviewId: review.id,
    });
  } catch (err: any) {
    console.error('Assessment evaluation error:', err);
    res.status(500).json({ error: err.message || 'Failed to evaluate assessment.' });
  }
});

// Teacher Reviews
app.get('/api/reviews', requireAuth, requireTeacher, (_req: AuthRequest, res: Response) => {
  const reviews = getReviews();
  res.json(reviews);
});

app.get('/api/reviews/:id', requireAuth, requireTeacher, (req: AuthRequest, res: Response) => {
  const review = getReviewById(req.params.id);
  if (!review) {
    res.status(404).json({ error: 'Review not found.' });
    return;
  }

  const assignment = getAssignmentById(review.assignmentId);
  const assessment = getAssessmentById(review.assessmentId);

  res.json({
    review,
    assignment,
    assessment,
  });
});

app.patch('/api/reviews/:id', requireAuth, requireTeacher, (req: AuthRequest, res: Response) => {
  const review = getReviewById(req.params.id);
  if (!review) {
    res.status(404).json({ error: 'Review not found.' });
    return;
  }

  const {
    teacherNotes,
    teacherDecision,
    dismissFlag,
    dismissReason,
    requestRetake,
    escalateToBoard,
  } = req.body;

  if (teacherNotes !== undefined) {
    review.teacherNotes = teacherNotes;
  }

  if (teacherDecision) {
    review.teacherDecision = teacherDecision;
    review.teacherDecisionDate = new Date().toISOString();
    review.teacherName = req.user?.name || 'Authorized Instructor';
  }

  if (dismissFlag) {
    review.flagDismissed = true;
    review.flagDismissedReason = dismissReason || 'Dismissed upon faculty review';
    review.reviewStatus = 'No Significant Concern Detected';
  }

  if (requestRetake) {
    review.retakeRequested = true;
    // Reset assessment status so student can retake
    const assessment = getAssessmentById(review.assessmentId);
    if (assessment) {
      assessment.status = 'not_started';
      assessment.questions = assessment.questions.map((q) => ({
        ...q,
        studentAnswer: undefined,
        answeredAt: undefined,
        followUpQuestion: undefined,
        followUpAnswer: undefined,
        evaluation: undefined,
      }));
      saveAssessment(assessment);
    }
  }

  if (escalateToBoard) {
    review.escalatedToBoard = true;
  }

  saveReview(review);
  res.json({ success: true, review });
});

// Serve frontend with Vite in dev, or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VivaVoce AI server active on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
