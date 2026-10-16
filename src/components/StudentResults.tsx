import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Assessment, DimensionScores, UnderstandingReport } from '../types/index.ts';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowLeft,
  Printer,
  Sparkles,
  TrendingUp,
  BrainCircuit,
  Compass,
  FileText,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface StudentResultsProps {
  assignmentId: string;
  onBack: () => void;
}

export const StudentResults: React.FC<StudentResultsProps> = ({ assignmentId, onBack }) => {
  const { token } = useAuth();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      if (!token) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/assessments/${assignmentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAssessment(data);
        }
      } catch (err) {
        console.error('Failed to load results:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [assignmentId, token]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-400">Loading understanding report...</p>
      </div>
    );
  }

  if (!assessment || !assessment.overallScores) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center glass-panel rounded-2xl">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white">Results Pending</h2>
        <p className="text-xs text-slate-400 mt-2 mb-6">
          This assessment has not yet been finalized or evaluated.
        </p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-xs hover:bg-slate-700"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const scores: DimensionScores = assessment.overallScores;
  const report: UnderstandingReport | undefined = assessment.understandingReport;

  // Grade badge styling
  const getScoreColor = (val: number) => {
    if (val >= 85) return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';
    if (val >= 70) return 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40';
    if (val >= 55) return 'text-amber-400 border-amber-500/40 bg-amber-950/40';
    return 'text-rose-400 border-rose-500/40 bg-rose-950/40';
  };

  const getTier = (val: number) => {
    if (val >= 85) return 'Advanced Mastery';
    if (val >= 70) return 'Proficient Comprehension';
    if (val >= 55) return 'Developing Understanding';
    return 'Foundational Revision Required';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 print:p-0">
      {/* Top Banner & Print Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4 print:hidden">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
              Comprehension Verification Report
            </span>
            <span className="text-xs text-amber-400/90 font-medium flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 inline" />
              <span>Preliminary AI Assessment (Pending final faculty sign-off)</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {assessment.assignmentTitle}
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white flex items-center space-x-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white flex items-center space-x-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>

      {/* Main Score Hero Card */}
      <div className="mt-8 glass-panel-glow rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Circular/Gauge visual */}
          <div className="flex items-center space-x-6">
            <div className={`relative w-28 h-28 rounded-2xl flex flex-col items-center justify-center border-2 ${getScoreColor(scores.totalScore)} shadow-xl shadow-purple-950/40`}>
              <span className="text-4xl font-extrabold text-white font-mono">
                {scores.totalScore}%
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold mt-0.5 text-slate-400">
                Overall
              </span>
            </div>

            <div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${getScoreColor(scores.totalScore)}`}>
                {getTier(scores.totalScore)}
              </span>
              <h2 className="text-xl font-bold text-white mt-2">
                Demonstrated Assignment Understanding
              </h2>
              <p className="text-xs text-slate-400 max-w-md mt-1">
                Calculated by evaluating your text explanations against the claims, methods, and principles presented in your submitted paper.
              </p>
            </div>
          </div>

          {/* Student Info */}
          <div className="w-full md:w-auto p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1.5 font-mono">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Student:</span>
              <span className="text-slate-200 font-semibold">{assessment.studentName}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Completed:</span>
              <span className="text-slate-200">
                {assessment.completedAt ? new Date(assessment.completedAt).toLocaleDateString() : 'Just now'}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Assessment ID:</span>
              <span className="text-cyan-400">{assessment.id.slice(0, 14)}...</span>
            </div>
          </div>
        </div>

        {/* 5-Dimension Score Progress Bars */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Comprehension Dimension Breakdown
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Dimension 1: Conceptual */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Conceptual</span>
                <span className="font-mono font-bold text-cyan-300">{scores.conceptualUnderstanding}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${scores.conceptualUnderstanding}%` }} />
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">Core principles & theoretical grasp</p>
            </div>

            {/* Dimension 2: Accuracy */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Accuracy</span>
                <span className="font-mono font-bold text-purple-300">{scores.accuracy}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-purple-400 rounded-full" style={{ width: `${scores.accuracy}%` }} />
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">Factual correctness of explanations</p>
            </div>

            {/* Dimension 3: Reasoning */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Reasoning</span>
                <span className="font-mono font-bold text-indigo-300">{scores.reasoning}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${scores.reasoning}%` }} />
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">Logical justification of claims</p>
            </div>

            {/* Dimension 4: Application */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Application</span>
                <span className="font-mono font-bold text-emerald-300">{scores.application}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${scores.application}%` }} />
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">Edge-cases & practical scenarios</p>
            </div>

            {/* Dimension 5: Consistency */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-300 font-medium">Consistency</span>
                <span className="font-mono font-bold text-teal-300">{scores.consistency}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-teal-400 rounded-full" style={{ width: `${scores.consistency}%` }} />
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">Alignment with submitted work</p>
            </div>
          </div>
        </div>
      </div>

      {/* Concept Breakdown & Revision Insights */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Concepts Demonstrated */}
          <div className="glass-panel rounded-2xl p-6 border border-emerald-500/20">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center space-x-2 mb-3">
              <CheckCircle2 className="w-4 h-4" />
              <span>Concepts Demonstrated Successfully</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {report.demonstratedConcepts.map((item, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-xs font-medium"
                >
                  ✓ {item}
                </span>
              ))}
            </div>

            <h4 className="text-xs font-semibold text-slate-400 mt-5 mb-2">Key Strengths</h4>
            <ul className="text-xs text-slate-300 space-y-1.5">
              {report.strengths.map((str, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-emerald-400">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Concepts for Revision */}
          <div className="glass-panel rounded-2xl p-6 border border-amber-500/20">
            <h3 className="text-sm font-bold text-amber-400 flex items-center space-x-2 mb-3">
              <Compass className="w-4 h-4" />
              <span>Recommended Topics for Revision</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {report.conceptsNeedingRevision.map((item, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-500/30 text-xs font-medium"
                >
                  ✎ {item}
                </span>
              ))}
            </div>

            <h4 className="text-xs font-semibold text-slate-400 mt-5 mb-2">Areas for Clarification</h4>
            <ul className="text-xs text-slate-300 space-y-1.5">
              {report.knowledgeGaps.map((gap, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-amber-400">•</span>
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Question-by-Question Student-Safe Feedback */}
      <div className="mt-10">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <span>Question-by-Question Review</span>
        </h3>

        <div className="space-y-4">
          {assessment.questions.map((q, idx) => {
            const ev = q.evaluation;
            const score = ev?.normalizedScore ?? 75;

            return (
              <div
                key={q.id}
                className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-slate-400">
                    Question {idx + 1} of {assessment.questions.length}
                  </span>
                  {ev && (
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border ${getScoreColor(score)}`}>
                      Score: {score}%
                    </span>
                  )}
                </div>

                <h4 className="text-base font-bold text-white">{q.questionText}</h4>

                {/* Student's answer */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider mb-1">
                    Your Submitted Response
                  </span>
                  <p className="leading-relaxed font-sans">{q.studentAnswer || '(No answer recorded)'}</p>
                </div>

                {/* Follow-up answer if exists */}
                {q.followUpQuestion && q.followUpAnswer && (
                  <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200">
                    <span className="text-[10px] text-cyan-400 font-semibold block uppercase mb-0.5">
                      Clarification Provided
                    </span>
                    <p className="italic">{q.followUpAnswer}</p>
                  </div>
                )}

                {/* Constructive feedback */}
                {ev?.rationale && (
                  <div className="pt-2 text-xs text-slate-300 flex items-start space-x-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-200">Evaluator Rationale: </span>
                      <span>{ev.rationale}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Limitations Notice */}
      <div className="mt-10 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
        <p className="font-semibold text-slate-300 mb-1 flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Academic Fair Assessment Policy</span>
        </p>
        <p className="leading-relaxed">
          This AI assessment serves as an instructional diagnostic tool to help educators evaluate authentic student understanding. Final grades and academic integrity determinations are always reviewed and confirmed by your faculty instructor.
        </p>
      </div>
    </div>
  );
};
