import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Review, Assignment, Assessment, TeacherDecision } from '../types/index.ts';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  FileText,
  Printer,
  Sparkles,
  Search,
  BookOpen,
  MessageSquare,
  HelpCircle,
  Clock,
  RotateCcw,
  Flag,
  Share2,
  ChevronRight,
  Save,
} from 'lucide-react';

interface TeacherReviewModalProps {
  reviewId: string;
  onClose: () => void;
  onRefresh: () => void;
}

export const TeacherReviewModal: React.FC<TeacherReviewModalProps> = ({
  reviewId,
  onClose,
  onRefresh,
}) => {
  const { token, user } = useAuth();
  const [data, setData] = useState<{
    review: Review;
    assignment: Assignment;
    assessment: Assessment;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'qa' | 'paper' | 'report' | 'integrity'>('qa');

  // Form states
  const [teacherNotes, setTeacherNotes] = useState('');
  const [teacherDecision, setTeacherDecision] = useState<TeacherDecision>('Pending Review');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Dismiss dialog
  const [showDismissModal, setShowDismissModal] = useState(false);
  const [dismissReason, setDismissReason] = useState('');

  // Search in assignment paper text
  const [paperSearch, setPaperSearch] = useState('');

  useEffect(() => {
    async function fetchDetail() {
      if (!token) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/reviews/${reviewId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
          setTeacherNotes(json.review.teacherNotes || '');
          setTeacherDecision(json.review.teacherDecision || 'Pending Review');
        }
      } catch (err) {
        console.error('Failed to load review details:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [reviewId, token]);

  const handleSaveDecision = async () => {
    if (!token) return;
    try {
      setIsSaving(true);
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherNotes,
          teacherDecision,
        }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
        onRefresh();
      }
    } catch (err) {
      alert('Failed to save decision.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDismissFlag = async () => {
    if (!token || !dismissReason.trim()) {
      alert('Please state a reason for dismissing this flag.');
      return;
    }
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dismissFlag: true,
          dismissReason,
        }),
      });
      if (res.ok) {
        setShowDismissModal(false);
        onRefresh();
        onClose();
      }
    } catch (err) {
      alert('Failed to dismiss flag.');
    }
  };

  const handleRequestRetake = async () => {
    if (!token) return;
    if (!confirm('This will reset the assessment status and allow the student to complete a new viva. Proceed?')) {
      return;
    }
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestRetake: true,
          teacherDecision: 'Partial Understanding - Retake Recommended',
        }),
      });
      if (res.ok) {
        alert('Retake requested. The student can now restart their viva assessment.');
        onRefresh();
        onClose();
      }
    } catch (err) {
      alert('Failed to request retake.');
    }
  };

  const handleEscalate = async () => {
    if (!token) return;
    if (!confirm('Escalate this file to the Institutional Academic Integrity Committee? This generates an official audit package.')) {
      return;
    }
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          escalateToBoard: true,
          teacherDecision: 'Academic Integrity Inquiry Required',
        }),
      });
      if (res.ok) {
        alert('File escalated to Academic Integrity Committee. Status recorded.');
        onRefresh();
        onClose();
      }
    } catch (err) {
      alert('Failed to escalate.');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <div className="glass-panel p-8 rounded-2xl text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-300">Loading comprehensive review audit dossier...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { review, assignment, assessment } = data;
  const inconsistencies = review.inconsistencies || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:text-black">
      <div className="glass-panel-glow w-full max-w-6xl max-h-[94vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl relative border border-slate-700/80 print:max-h-none print:border-none print:shadow-none print:bg-white">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 shrink-0 print:border-b-2 print:border-black">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Academic Verification Audit: {review.studentName}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  {review.course}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Assignment: <span className="text-slate-200">{review.assignmentTitle}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 print:hidden">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-xs text-slate-300 flex items-center space-x-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export Dossier</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between shrink-0 overflow-x-auto print:hidden">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('qa')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'qa'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Q&A Audit Trail ({assessment.questions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('paper')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'paper'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Extracted Assignment Text</span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'report'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Understanding Report</span>
            </button>

            <button
              onClick={() => setActiveTab('integrity')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'integrity'
                  ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>
                Integrity & Inconsistencies ({inconsistencies.length})
              </span>
            </button>
          </div>

          <div className="text-xs font-mono font-bold text-cyan-300">
            Score: {review.understandingScore}%
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: Q&A AUDIT TRAIL */}
          {activeTab === 'qa' && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>
                  Comparing student's typed viva answers against the paper's original text and the rubric.
                </span>
                <span className="font-mono text-cyan-400">
                  {assessment.questions.filter((q) => q.evaluation).length}/{assessment.questions.length} Evaluated
                </span>
              </div>

              {assessment.questions.map((q, idx) => {
                const ev = q.evaluation;
                const score = ev?.normalizedScore ?? 75;

                return (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-mono text-cyan-400 font-semibold">
                        Q{idx + 1}: {q.category.toUpperCase()}
                      </span>
                      {ev && (
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono">
                            Rubric: {ev.conceptualUnderstanding}/4 Concept · {ev.accuracyOfExplanation}/4 Acc · {ev.reasoningJustification}/4 Reason
                          </span>
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
                              score >= 80
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : score >= 60
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {score}%
                          </span>
                        </div>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-white">{q.questionText}</h4>

                    {/* Student Answer */}
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                      <span className="text-[10px] text-purple-400 uppercase font-semibold block mb-1">
                        Student's Typed Answer
                      </span>
                      <p className="text-slate-100 font-sans leading-relaxed">
                        {q.studentAnswer || '(No response recorded)'}
                      </p>
                    </div>

                    {/* Follow-up answer if exists */}
                    {q.followUpQuestion && q.followUpAnswer && (
                      <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs">
                        <span className="text-[10px] text-cyan-400 uppercase font-semibold block mb-0.5">
                          Follow-up Clarification ({q.followUpQuestion})
                        </span>
                        <p className="text-cyan-100 italic">{q.followUpAnswer}</p>
                      </div>
                    )}

                    {/* AI Evaluation & Rubric Rationale */}
                    {ev && (
                      <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs space-y-1.5">
                        <div className="flex items-center space-x-2 text-slate-300">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="font-semibold text-white">AI Evaluation Rationale: </span>
                          <span className="text-slate-300">{ev.rationale}</span>
                        </div>

                        {ev.detectedInconsistency && (
                          <div className="mt-2 p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
                            <span className="font-bold flex items-center space-x-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                              <span>Inconsistency Flagged with Submitted Text:</span>
                            </span>
                            <p className="mt-1 text-[11px] text-rose-200">
                              {ev.detectedInconsistency.reason}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono mt-1 italic">
                              Passage cited: "{ev.detectedInconsistency.passageExcerpt}"
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: EXTRACTED ASSIGNMENT TEXT */}
          {activeTab === 'paper' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="relative w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={paperSearch}
                    onChange={(e) => setPaperSearch(e.target.value)}
                    placeholder="Search inside assignment text..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
                  />
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {assignment.extractedText.length} characters extracted
                </span>
              </div>

              {/* Extracted text container */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                {paperSearch
                  ? assignment.extractedText.split(new RegExp(`(${paperSearch})`, 'gi')).map((part, i) =>
                      part.toLowerCase() === paperSearch.toLowerCase() ? (
                        <mark key={i} className="bg-cyan-500/40 text-cyan-200 px-0.5 rounded">
                          {part}
                        </mark>
                      ) : (
                        part
                      )
                    )
                  : assignment.extractedText}
              </div>
            </div>
          )}

          {/* TAB 3: UNDERSTANDING REPORT */}
          {activeTab === 'report' && (
            <div className="space-y-6">
              {assessment.understandingReport ? (
                <>
                  <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
                      Comprehensive Synthesis
                    </h4>
                    <p className="text-sm text-slate-200 leading-relaxed font-sans">
                      {assessment.understandingReport.summary}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs">
                      <span className="font-bold text-emerald-300 block mb-2">
                        Demonstrated Conceptual Competencies:
                      </span>
                      <ul className="space-y-1 text-slate-300">
                        {assessment.understandingReport.demonstratedConcepts.map((c, i) => (
                          <li key={i}>✓ {c}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs">
                      <span className="font-bold text-amber-300 block mb-2">
                        Knowledge Gaps & Clarification Areas:
                      </span>
                      <ul className="space-y-1 text-slate-300">
                        {assessment.understandingReport.knowledgeGaps.map((g, i) => (
                          <li key={i}>• {g}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
                    <span className="font-semibold text-slate-300 block mb-1">
                      AI Limitations & Disclaimers:
                    </span>
                    <p>{assessment.understandingReport.aiLimitationsNotice}</p>
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-400">Report details will populate upon viva completion.</p>
              )}
            </div>
          )}

          {/* TAB 4: ACADEMIC INTEGRITY & INCONSISTENCIES */}
          {activeTab === 'integrity' && (
            <div className="space-y-6">
              {inconsistencies.length === 0 ? (
                <div className="p-8 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <h4 className="text-base font-bold text-white">No Significant Inconsistencies Detected</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto mt-1">
                    The student's oral explanations aligned coherently with the methods, equations, and conclusions documented in their submitted work.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200">
                    <p className="font-bold text-sm text-rose-300 flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>{inconsistencies.length} Reviewable Inconsistency Flagged</span>
                    </p>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      Remember: Inability to answer or contradictory statements may arise from nervousness, conceptual confusion, or language barriers. Review the evidence below and conduct an in-person follow-up interview before reaching any formal misconduct conclusion.
                    </p>
                  </div>

                  {inconsistencies.map((inc, i) => (
                    <div
                      key={inc.id || i}
                      className="p-5 rounded-2xl bg-slate-950 border border-rose-900/40 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-rose-400">
                          Inconsistency #{i + 1}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono">
                          AI Confidence: {inc.confidence}
                        </span>
                      </div>

                      {/* Question Asked */}
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                          Question Asked During Viva:
                        </span>
                        <p className="text-xs text-white font-medium mt-0.5">{inc.questionAsked}</p>
                      </div>

                      {/* Student's Answer */}
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                        <span className="text-[10px] uppercase font-semibold text-rose-400 block mb-0.5">
                          Student's Answer:
                        </span>
                        <p className="text-slate-200 italic">"{inc.studentAnswer}"</p>
                      </div>

                      {/* Relevant Assignment Passage */}
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                        <span className="text-[10px] uppercase font-semibold text-cyan-400 block mb-0.5">
                          Relevant Passage from Submitted Paper:
                        </span>
                        <p className="text-slate-300 italic font-serif">"{inc.assignmentPassage}"</p>
                      </div>

                      {/* Reason Inconsistent */}
                      <div className="text-xs text-slate-300">
                        <span className="font-semibold text-white">Why Inconsistent: </span>
                        <span>{inc.reasonInconsistent}</span>
                      </div>

                      {/* Suggested Oral Follow-up Questions for the Teacher! */}
                      {inc.suggestedOralFollowUp && (
                        <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200">
                          <span className="font-semibold text-purple-300 flex items-center space-x-1.5 mb-1">
                            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                            <span>Suggested Follow-Up Question for Office Hours:</span>
                          </span>
                          <p className="italic text-white">"{inc.suggestedOralFollowUp}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Teacher Actions & Decision Panel (Footer) */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/90 shrink-0 space-y-4 print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Decision selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Final Faculty Decision</span>
              </label>
              <select
                value={teacherDecision}
                onChange={(e) => setTeacherDecision(e.target.value as TeacherDecision)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="Pending Review">Pending Review</option>
                <option value="Verified Genuine Understanding">Verified Genuine Understanding</option>
                <option value="Partial Understanding - Retake Recommended">Partial Understanding - Retake Recommended</option>
                <option value="Inconsistency Cleared">Inconsistency Cleared (Resolved in Office Hours)</option>
                <option value="Academic Integrity Inquiry Required">Academic Integrity Inquiry Required</option>
              </select>
            </div>

            {/* Private Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Private Faculty Notes (Hidden from Student)
              </label>
              <input
                type="text"
                value={teacherNotes}
                onChange={(e) => setTeacherNotes(e.target.value)}
                placeholder="e.g. Conducted follow-up in office hours; student clarified Cas9 nickase definition."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Action Button Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center space-x-2">
              {review.reviewStatus === 'Flagged for Teacher Review' && (
                <button
                  type="button"
                  onClick={() => setShowDismissModal(true)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  Dismiss Flag with Reason
                </button>
              )}

              <button
                type="button"
                onClick={handleRequestRetake}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-purple-500/40 text-purple-300 hover:bg-purple-950/60 text-xs font-medium flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Request Retake / Re-Viva</span>
              </button>

              <button
                type="button"
                onClick={handleEscalate}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-rose-500/40 text-rose-300 hover:bg-rose-950/60 text-xs font-medium flex items-center space-x-1"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Escalate to Board</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {saveSuccess && (
                <span className="text-xs text-emerald-400 font-medium flex items-center space-x-1 animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Decision Saved!</span>
                </span>
              )}
              <button
                type="button"
                onClick={handleSaveDecision}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium text-xs shadow-md transition flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Record Decision & Notes'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dismiss Flag Modal */}
        {showDismissModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="glass-panel max-w-md w-full p-6 rounded-2xl relative">
              <h3 className="text-base font-bold text-white mb-2">Dismiss Review Flag</h3>
              <p className="text-xs text-slate-400 mb-4">
                Record your academic rationale for clearing this flagged inconsistency (e.g., student clarified in office hours, alternate interpretation valid, etc.).
              </p>
              <textarea
                rows={3}
                value={dismissReason}
                onChange={(e) => setDismissReason(e.target.value)}
                placeholder="State your reason for dismissing the concern..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setShowDismissModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDismissFlag}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium"
                >
                  Confirm Dismissal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
