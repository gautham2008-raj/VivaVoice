import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Assessment, AssessmentQuestion } from '../types/index.ts';
import {
  MessageSquareText,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  BookOpen,
  Send,
  FileCheck2,
  CornerDownRight,
} from 'lucide-react';

interface AssessmentInterfaceProps {
  assignmentId: string;
  onFinish: (assignmentId: string) => void;
  onExit: () => void;
}

export const AssessmentInterface: React.FC<AssessmentInterfaceProps> = ({
  assignmentId,
  onFinish,
  onExit,
}) => {
  const { token } = useAuth();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Current answer input state
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isEvaluatingFullViva, setIsEvaluatingFullViva] = useState(false);

  // Follow-up answer state
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState(false);

  const fetchAssessment = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/assessments/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Could not load assessment.');
      }
      const data: Assessment = await res.json();
      setAssessment(data);

      // Pre-fill answer if already submitted
      const q = data.questions[currentIndex];
      if (q) {
        setCurrentAnswer(q.studentAnswer || '');
        setFollowUpAnswer(q.followUpAnswer || '');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load assessment questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessment();
  }, [assignmentId, token]);

  // Sync answer state when switching question index
  useEffect(() => {
    if (assessment && assessment.questions[currentIndex]) {
      const q = assessment.questions[currentIndex];
      setCurrentAnswer(q.studentAnswer || '');
      setFollowUpAnswer(q.followUpAnswer || '');
    }
  }, [currentIndex, assessment]);

  const currentQuestion: AssessmentQuestion | undefined = assessment?.questions[currentIndex];
  const totalQuestions = assessment?.questions.length || 0;
  const answeredCount = assessment?.questions.filter((q) => Boolean(q.studentAnswer)).length || 0;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const handleSaveAnswer = async () => {
    if (!token || !assessment || !currentQuestion) return;
    if (!currentAnswer.trim()) {
      alert('Please type your answer before saving.');
      return;
    }

    try {
      setIsSubmittingAnswer(true);
      const res = await fetch(`/api/assessments/${assessment.id}/submit-answer`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answer: currentAnswer.trim(),
          isFollowUp: false,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save answer.');
      }

      const resData = await res.json();

      // Update local state
      setAssessment((prev) => {
        if (!prev) return prev;
        const updatedQuestions = [...prev.questions];
        const q = { ...updatedQuestions[currentIndex] };
        q.studentAnswer = currentAnswer.trim();
        if (resData.question?.followUpQuestion) {
          q.followUpQuestion = resData.question.followUpQuestion;
        }
        updatedQuestions[currentIndex] = q;
        return { ...prev, questions: updatedQuestions };
      });
    } catch (err: any) {
      alert(err.message || 'Error saving answer.');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleSaveFollowUp = async () => {
    if (!token || !assessment || !currentQuestion) return;
    if (!followUpAnswer.trim()) return;

    try {
      setIsSubmittingFollowUp(true);
      const res = await fetch(`/api/assessments/${assessment.id}/submit-answer`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answer: followUpAnswer.trim(),
          isFollowUp: true,
        }),
      });

      if (!res.ok) throw new Error('Failed to save follow-up answer.');

      setAssessment((prev) => {
        if (!prev) return prev;
        const updatedQuestions = [...prev.questions];
        updatedQuestions[currentIndex] = {
          ...updatedQuestions[currentIndex],
          followUpAnswer: followUpAnswer.trim(),
        };
        return { ...prev, questions: updatedQuestions };
      });
    } catch (err: any) {
      alert(err.message || 'Error saving follow-up.');
    } finally {
      setIsSubmittingFollowUp(false);
    }
  };

  const handleFinishAssessment = async () => {
    if (!token || !assessment) return;

    // Check if any answers are missing
    const unAnswered = assessment.questions.some((q) => !q.studentAnswer?.trim());
    if (unAnswered && !confirm('Some questions are still unanswered. Are you sure you want to finish and submit for evaluation?')) {
      return;
    }

    try {
      setIsEvaluatingFullViva(true);
      const res = await fetch(`/api/assessments/${assessment.id}/evaluate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Evaluation failed.');
      }

      onFinish(assignmentId);
    } catch (err: any) {
      alert(err.message || 'Error completing evaluation.');
      setIsEvaluatingFullViva(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-bold text-white">Initializing AI Viva Session...</h2>
        <p className="text-xs text-slate-400 mt-1">Retrieving question set and contextual references</p>
      </div>
    );
  }

  if (error || !assessment || !currentQuestion) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center glass-panel rounded-2xl">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white">Viva Session Unavailable</h2>
        <p className="text-xs text-slate-400 mt-2 mb-6">
          {error || 'No questions found for this assignment.'}
        </p>
        <button
          onClick={onExit}
          className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-xs hover:bg-slate-700"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const categoryLabels: Record<string, { label: string; color: string }> = {
    conceptual: { label: 'Conceptual Core', color: 'bg-purple-950/80 text-purple-300 border-purple-700/60' },
    statement_specific: { label: 'Statement Defense', color: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60' },
    methodology: { label: 'Methodology & Procedure', color: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60' },
    application: { label: 'Practical Application', color: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60' },
    limitations: { label: 'Limitations & Validity', color: 'bg-amber-950/80 text-amber-300 border-amber-700/60' },
    reasoning: { label: 'Reasoning & Justification', color: 'bg-blue-950/80 text-blue-300 border-blue-700/60' },
  };

  const catInfo = categoryLabels[currentQuestion.category] || categoryLabels.conceptual;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      {/* Evaluating Overlay */}
      {isEvaluatingFullViva && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="glass-panel-glow max-w-md w-full p-8 rounded-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-[1px] mx-auto mb-4 animate-spin">
              <div className="w-full h-full bg-[#080d1e] rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white">Synthesizing Understanding Report</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Gemini 3.8 is evaluating your responses across 5 academic dimensions, comparing them against your submitted paper, and calculating conceptual mastery.
            </p>
            <div className="mt-6 flex justify-center space-x-1.5">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        </div>
      )}

      {/* Top Header & Progress */}
      <div className="glass-panel rounded-2xl p-5 mb-6 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                AI Viva Voce
              </span>
              <span className="text-xs text-slate-400 font-mono">Text-Based Oral Defense</span>
            </div>
            <h1 className="text-lg font-bold text-white mt-1">
              {assessment.assignmentTitle}
            </h1>
          </div>

          <button
            onClick={onExit}
            className="self-start sm:self-auto text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800/60 transition"
          >
            Pause & Return
          </button>
        </div>

        {/* Progress Bar & Question Tabs */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-mono">
              Question <span className="text-cyan-300 font-bold">{currentIndex + 1}</span> of {totalQuestions}
            </span>
            <span className="font-mono">
              {answeredCount}/{totalQuestions} Answered ({progressPercent}%)
            </span>
          </div>

          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Quick jump question numbers */}
          <div className="flex items-center space-x-2 mt-4 overflow-x-auto pb-1">
            {assessment.questions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const hasAnswer = Boolean(q.studentAnswer?.trim());

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-mono font-medium flex items-center justify-center transition shrink-0 ${
                    isCurrent
                      ? 'bg-gradient-to-tr from-purple-600 to-cyan-500 text-white shadow-md'
                      : hasAnswer
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="glass-panel-glow rounded-2xl p-6 sm:p-8 relative">
        {/* Category & Metadata badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <span className={`text-xs px-2.5 py-1 rounded-md font-medium border ${catInfo.color}`}>
            {catInfo.label}
          </span>
          <span className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Untimed · Think & Type Carefully</span>
          </span>
        </div>

        {/* Paper Excerpt Reference if available */}
        {currentQuestion.contextExcerpt && (
          <div className="mb-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 flex items-start space-x-2">
            <BookOpen className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Paper Context Reference
              </span>
              <p className="italic text-slate-300 text-xs mt-0.5 font-serif">
                "{currentQuestion.contextExcerpt}"
              </p>
            </div>
          </div>
        )}

        {/* Question Text */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
            {currentQuestion.questionText}
          </h2>
        </div>

        {/* Answer Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium text-slate-300 flex items-center space-x-1">
              <MessageSquareText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Your Explanation</span>
            </span>
            <span className="font-mono text-[11px]">
              {currentAnswer.trim().split(/\s+/).filter(Boolean).length} words ·{' '}
              {currentAnswer.length} characters
            </span>
          </div>

          <textarea
            rows={7}
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your explanation in your own words. Walk through your logic, equations, methods, and reasoning. You do not need to memorize exact quotes; explain the principles clearly..."
            className="w-full p-4 rounded-xl bg-slate-950/90 border border-slate-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-slate-100 placeholder-slate-500 leading-relaxed transition resize-y focus:outline-none"
          />
        </div>

        {/* Save / Submit Answer Row */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800/80">
          <div className="text-xs text-slate-400">
            {currentQuestion.studentAnswer ? (
              <span className="text-emerald-400 flex items-center space-x-1 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Answer Saved for this question</span>
              </span>
            ) : (
              <span>Not yet saved</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSaveAnswer}
            disabled={isSubmittingAnswer || !currentAnswer.trim()}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-md transition flex items-center space-x-1.5 disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmittingAnswer ? 'Saving...' : 'Save Answer'}</span>
          </button>
        </div>

        {/* AI Dynamic Follow-up Prompt Box (if triggered) */}
        {currentQuestion.followUpQuestion && (
          <div className="mt-6 p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs space-y-3 animate-in fade-in">
            <div className="flex items-center space-x-2 text-cyan-300 font-semibold">
              <CornerDownRight className="w-4 h-4 text-cyan-400" />
              <span>AI Viva Follow-up Clarification</span>
            </div>
            <p className="text-sm text-white font-medium italic">
              "{currentQuestion.followUpQuestion}"
            </p>

            <textarea
              rows={3}
              value={followUpAnswer}
              onChange={(e) => setFollowUpAnswer(e.target.value)}
              placeholder="Provide a brief clarification or concrete example..."
              className="w-full p-3 rounded-lg bg-slate-950/80 border border-cyan-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveFollowUp}
                disabled={isSubmittingFollowUp || !followUpAnswer.trim()}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition disabled:opacity-50"
              >
                {isSubmittingFollowUp ? 'Saving Clarification...' : 'Submit Clarification'}
              </button>
            </div>
          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-800/60 disabled:opacity-30 disabled:pointer-events-none transition flex items-center space-x-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Question</span>
          </button>

          {currentIndex < totalQuestions - 1 ? (
            <button
              type="button"
              onClick={() => {
                // If text changed, trigger quick save
                if (currentAnswer && currentAnswer !== currentQuestion.studentAnswer) {
                  handleSaveAnswer();
                }
                setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1));
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition flex items-center space-x-1.5"
            >
              <span>Next Question</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishAssessment}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition flex items-center space-x-2"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Complete Viva & Generate Report</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
