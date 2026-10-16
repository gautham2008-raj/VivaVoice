import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Review } from '../types/index.ts';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  User,
  ArrowUpRight,
  TrendingDown,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface TeacherDashboardProps {
  onOpenReview: (reviewId: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onOpenReview }) => {
  const { token, user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [decisionFilter, setDecisionFilter] = useState('all');

  const fetchReviews = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch('/api/reviews', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [token]);

  // Statistics calculation
  const totalSubmissions = reviews.length;
  const completedAssessments = reviews.filter((r) => r.understandingScore > 0).length;
  const awaitingReview = reviews.filter((r) => r.teacherDecision === 'Pending Review').length;
  const needsAcademicSupport = reviews.filter((r) => r.understandingScore < 65).length;
  const flaggedForReview = reviews.filter((r) => r.reviewStatus === 'Flagged for Teacher Review').length;

  // Filter options
  const uniqueCourses = Array.from(new Set(reviews.map((r) => r.course))).filter(Boolean);

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.assignmentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.studentEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse = courseFilter === 'all' || r.course === courseFilter;
    const matchesStatus = statusFilter === 'all' || r.reviewStatus === statusFilter;
    const matchesDecision = decisionFilter === 'all' || r.teacherDecision === decisionFilter;

    return matchesSearch && matchesCourse && matchesStatus && matchesDecision;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Faculty Academic Integrity Suite
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 font-mono flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 inline" />
              <span>Faculty Authorized</span>
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Review assignment submissions, inspect student text viva answers, examine flagged inconsistencies, and record formal faculty decisions.
          </p>
        </div>

        <div className="text-xs text-slate-400 bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-800 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Instructor: </span>
          <span className="font-semibold text-white">{user?.name || 'Prof. Eleanor Vance'}</span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
            Total Submissions
          </span>
          <p className="text-2xl font-bold text-white mt-1">{totalSubmissions}</p>
          <span className="text-[10px] text-slate-500">Across all active courses</span>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
            Completed Vivas
          </span>
          <p className="text-2xl font-bold text-cyan-300 mt-1">{completedAssessments}</p>
          <span className="text-[10px] text-slate-500">Evaluated by Gemini AI</span>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
            Awaiting Review
          </span>
          <p className="text-2xl font-bold text-purple-300 mt-1">{awaitingReview}</p>
          <span className="text-[10px] text-slate-500">Pending faculty decision</span>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-amber-900/30">
          <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-medium">
            Support Needed
          </span>
          <p className="text-2xl font-bold text-amber-300 mt-1">{needsAcademicSupport}</p>
          <span className="text-[10px] text-amber-500/80">Score below 65%</span>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-rose-900/40">
          <span className="text-[10px] text-rose-400 uppercase tracking-wider block font-medium">
            Flagged For Review
          </span>
          <p className="text-2xl font-bold text-rose-400 mt-1">{flaggedForReview}</p>
          <span className="text-[10px] text-rose-400/80">Requires evidence review</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-8 p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student, email, or title..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Course filter */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Subjects / Courses</option>
            {uniqueCourses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Review Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All AI Review Statuses</option>
            <option value="No Significant Concern Detected">No Significant Concern</option>
            <option value="Additional Review Recommended">Additional Review Recommended</option>
            <option value="Flagged for Teacher Review">Flagged for Teacher Review</option>
          </select>

          {/* Decision filter */}
          <select
            value={decisionFilter}
            onChange={(e) => setDecisionFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Faculty Decisions</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Verified Genuine Understanding">Verified Genuine</option>
            <option value="Partial Understanding - Retake Recommended">Retake Recommended</option>
            <option value="Academic Integrity Inquiry Required">Inquiry Required</option>
          </select>
        </div>
      </div>

      {/* Table of Submissions */}
      <div className="mt-6 glass-panel rounded-2xl overflow-hidden border border-slate-800">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Loading submission repository...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">No submissions matching criteria</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing or adjusting your search filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold font-mono">
                <tr>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Assignment & Course</th>
                  <th className="px-4 py-3.5 text-center">Score</th>
                  <th className="px-4 py-3.5">AI Review Status</th>
                  <th className="px-4 py-3.5">Faculty Decision</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredReviews.map((rev) => {
                  const score = rev.understandingScore;
                  const isFlagged = rev.reviewStatus === 'Flagged for Teacher Review';
                  const isRecommended = rev.reviewStatus === 'Additional Review Recommended';

                  return (
                    <tr
                      key={rev.id}
                      className="hover:bg-slate-900/60 transition group cursor-pointer"
                      onClick={() => onOpenReview(rev.id)}
                    >
                      {/* Student */}
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {rev.studentName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-white text-xs group-hover:text-cyan-300 transition">
                              {rev.studentName}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">{rev.studentEmail}</p>
                          </div>
                        </div>
                      </td>

                      {/* Title & Course */}
                      <td className="px-5 py-4 max-w-xs">
                        <p className="font-medium text-slate-200 truncate group-hover:text-white transition">
                          {rev.assignmentTitle}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                          {rev.course}
                        </p>
                      </td>

                      {/* Understanding Score */}
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
                            score >= 80
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                              : score >= 65
                              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800'
                              : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {score}%
                        </span>
                      </td>

                      {/* AI Review Status (Restrained, Evidence-based) */}
                      <td className="px-4 py-4">
                        {isFlagged ? (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-rose-950/60 text-rose-300 border border-rose-500/40">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                            <span>Flagged for Review</span>
                          </span>
                        ) : isRecommended ? (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-950/60 text-amber-300 border border-amber-500/40">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Additional Review</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>No Concern Detected</span>
                          </span>
                        )}
                      </td>

                      {/* Faculty Decision */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-block text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                            rev.teacherDecision === 'Verified Genuine Understanding'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : rev.teacherDecision === 'Academic Integrity Inquiry Required'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800 font-semibold'
                              : rev.teacherDecision === 'Partial Understanding - Retake Recommended'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-slate-900 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {rev.teacherDecision}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenReview(rev.id);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 text-xs font-medium transition inline-flex items-center space-x-1"
                        >
                          <span>Review</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
