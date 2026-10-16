export type UserRole = 'student' | 'teacher';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isApprovedTeacher: boolean;
  createdAt: string;
}

export interface TechnicalTerm {
  term: string;
  definition: string;
  contextInPaper: string;
}

export interface AssignmentAnalysis {
  topic: string;
  mainArguments: string[];
  keyConcepts: string[];
  technicalTerms: TechnicalTerm[];
  methodsAndProcedures: string[];
  claimsNeedingExplanation: string[];
  possibleMisconceptions: string[];
  supportingEvidence: string[];
  vivaFocusAreas: string[];
}

export type QuestionCategory =
  | 'conceptual'
  | 'reasoning'
  | 'statement_specific'
  | 'application'
  | 'methodology'
  | 'limitations';

export interface QuestionEvaluationGuide {
  conceptTested: string;
  keyIdeasExpected: string[];
  assignmentEvidence: string;
  commonMisconceptions: string[];
  scoringRubric: string;
}

export type AnswerClassification =
  | 'correct_well_explained'
  | 'partially_correct'
  | 'incorrect'
  | 'lacks_detail'
  | 'misconception'
  | 'ambiguous';

export interface DetectedInconsistency {
  passageExcerpt: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
}

export interface AnswerEvaluation {
  conceptualUnderstanding: number; // 0-4
  accuracyOfExplanation: number; // 0-4
  reasoningJustification: number; // 0-4
  applicationAbility: number; // 0-4
  consistencyWithSubmission: number; // 0-4
  normalizedScore: number; // 0-100%
  classification: AnswerClassification;
  rationale: string;
  supportingEvidence: string;
  detectedInconsistency?: DetectedInconsistency;
}

export interface AssessmentQuestion {
  id: string;
  order: number;
  category: QuestionCategory;
  questionText: string;
  contextExcerpt?: string;
  evaluationGuide: QuestionEvaluationGuide;
  studentAnswer?: string;
  answeredAt?: string;
  followUpQuestion?: string;
  followUpAnswer?: string;
  evaluation?: AnswerEvaluation;
}

export interface DimensionScores {
  totalScore: number; // 0 - 100%
  conceptualUnderstanding: number; // 0 - 100%
  accuracy: number; // 0 - 100%
  reasoning: number; // 0 - 100%
  application: number; // 0 - 100%
  consistency: number; // 0 - 100%
}

export interface UnderstandingReport {
  summary: string;
  strengths: string[];
  knowledgeGaps: string[];
  demonstratedConcepts: string[];
  conceptsNeedingRevision: string[];
  areasNeedingClarification: string[];
  aiLimitationsNotice: string;
  suggestedRevisionTopics: string[];
}

export type ReviewStatus =
  | 'No Significant Concern Detected'
  | 'Additional Review Recommended'
  | 'Flagged for Teacher Review';

export type TeacherDecision =
  | 'Pending Review'
  | 'Verified Genuine Understanding'
  | 'Partial Understanding - Retake Recommended'
  | 'Inconsistency Cleared'
  | 'Academic Integrity Inquiry Required';

export interface InconsistencyRecord {
  id: string;
  questionAsked: string;
  studentAnswer: string;
  assignmentPassage: string;
  reasonInconsistent: string;
  confidence: 'Low' | 'Medium' | 'High';
  limitations: string;
  suggestedOralFollowUp: string;
}

export interface Assignment {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  title: string;
  course: string;
  instructions?: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  extractedText: string;
  submissionDate: string;
  analysisStatus: 'uploaded' | 'extracting' | 'analyzing' | 'generating' | 'ready' | 'error';
  errorMessage?: string;
  analysis?: AssignmentAnalysis;
}

export interface Assessment {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  assignmentTitle: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'evaluated';
  startedAt?: string;
  completedAt?: string;
  questions: AssessmentQuestion[];
  overallScores?: DimensionScores;
  understandingReport?: UnderstandingReport;
}

export interface Review {
  id: string;
  assignmentId: string;
  assessmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  assignmentTitle: string;
  course: string;
  submissionDate: string;
  understandingScore: number;
  reviewStatus: ReviewStatus;
  inconsistencies: InconsistencyRecord[];
  teacherNotes?: string;
  teacherDecision: TeacherDecision;
  teacherDecisionDate?: string;
  teacherName?: string;
  retakeRequested?: boolean;
  flagDismissed?: boolean;
  flagDismissedReason?: string;
  escalatedToBoard?: boolean;
}
