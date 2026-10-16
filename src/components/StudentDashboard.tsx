import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Assignment } from '../types/index.ts';
import {
  Upload,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  FileText,
  AlertTriangle,
  Award,
  Layers,
  FileSearch,
} from 'lucide-react';

interface StudentDashboardProps {
  onStartAssessment: (assignmentId: string) => void;
  onViewResults: (assignmentId: string) => void;
  onNewUpload: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onStartAssessment,
  onViewResults,
  onNewUpload,
}) => {
  const { user, token } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const fetchAssignments = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch('/api/assignments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAssignments(data);
      }
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [token]);

  const handleRunAnalysis = async (assignmentId: string) => {
    if (!token) return;
    setAnalyzingId(assignmentId);
    try {
      const res = await fetch(`/api/assignments/${assignmentId}/analyze`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        await fetchAssignments();
        onStartAssessment(assignmentId);
      }
    } catch (err) {
      console.error('Error starting analysis:', err);
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Student Assessment Portal
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/40 font-mono">
              {user?.name}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Upload your assignments, complete personalized comprehension vivas, and track your understanding.
          </p>
        </div>

        <button
          onClick={onNewUpload}
          className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-medium text-sm shadow-lg shadow-purple-900/30 transition flex items-center space-x-2"
        >
          <Upload className="w-4 h-4" />
          <span>Upload New Assignment</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-8">
        <div className="glass-panel rounded-2xl p-5 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Total Submissions
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-800 flex items-center justify-center text-purple-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mt-2">{assignments.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Academic papers on file</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Verified Assessments
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mt-2">
            {assignments.filter((a) => a.analysisStatus === 'ready').length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Ready or evaluated vivas</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-indigo-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Verification Mode
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-800 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-bold text-white mt-2">Personalized Viva</p>
          <p className="text-[11px] text-cyan-400/90 mt-1">Directly grounded in your text</p>
        </div>
      </div>

      {/* Assignments List */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <span>Your Submitted Assignments</span>
          </h2>
          <span className="text-xs text-slate-400">
            {assignments.length} {assignments.length === 1 ? 'assignment' : 'assignments'}
          </span>
        </div>

        {loading ? (
          <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Loading your submissions...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center border-dashed border border-slate-700/60">
            <div className="w-14 h-14 rounded-2xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center mx-auto mb-4 text-purple-400">
              <Upload className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">No assignments submitted yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-6">
              Upload your research paper, lab report, or essay in PDF, DOCX, or TXT format to generate your personalized AI viva.
            </p>
            <button
              onClick={onNewUpload}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-medium text-xs shadow-lg hover:opacity-95 transition"
            >
              Upload Your First Assignment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {assignments.map((assignment) => {
              const isReady = assignment.analysisStatus === 'ready';
              const isAnalyzing = analyzingId === assignment.id || assignment.analysisStatus === 'analyzing' || assignment.analysisStatus === 'generating';

              return (
                <div
                  key={assignment.id}
                  className="glass-panel rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                          {assignment.course}
                        </span>
                        <span className="text-xs text-slate-500">
                          Submitted {new Date(assignment.submissionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          ({assignment.fileName})
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white tracking-tight">
                        {assignment.title}
                      </h3>

                      {assignment.analysis?.topic && (
                        <p className="text-xs text-slate-400 flex items-center space-x-1.5">
                          <span className="text-purple-400 font-medium">Topic:</span>
                          <span>{assignment.analysis.topic}</span>
                        </p>
                      )}

                      {/* Key Concepts Preview */}
                      {assignment.analysis?.keyConcepts && assignment.analysis.keyConcepts.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {assignment.analysis.keyConcepts.slice(0, 4).map((concept, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700/80 text-slate-300"
                            >
                              {concept}
                            </span>
                          ))}
                          {assignment.analysis.keyConcepts.length > 4 && (
                            <span className="text-[10px] px-1.5 py-0.5 text-slate-400">
                              +{assignment.analysis.keyConcepts.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions and Status */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0">
                      {/* Status indicator */}
                      <div>
                        {isAnalyzing ? (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 animate-pulse">
                            <Sparkles className="w-3.5 h-3.5 animate-spin" />
                            <span>AI Analyzing Paper...</span>
                          </span>
                        ) : isReady ? (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Viva Ready</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Uploaded</span>
                          </span>
                        )}
                      </div>

                      {/* Primary Action Button */}
                      <div className="flex items-center space-x-2">
                        {isReady ? (
                          <>
                            <button
                              onClick={() => onStartAssessment(assignment.id)}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-medium text-xs shadow-md transition flex items-center space-x-1.5"
                            >
                              <span>Take Viva</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onViewResults(assignment.id)}
                              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white font-medium text-xs border border-slate-700 transition"
                            >
                              Results
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleRunAnalysis(assignment.id)}
                            disabled={isAnalyzing}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white font-medium text-xs shadow-md transition flex items-center space-x-1.5 disabled:opacity-50"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{isAnalyzing ? 'Analyzing...' : 'Generate Viva'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
