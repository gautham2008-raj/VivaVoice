import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { AuthPages } from './components/AuthPages.tsx';
import { StudentDashboard } from './components/StudentDashboard.tsx';
import { AssignmentUpload } from './components/AssignmentUpload.tsx';
import { AssessmentInterface } from './components/AssessmentInterface.tsx';
import { StudentResults } from './components/StudentResults.tsx';
import { TeacherDashboard } from './components/TeacherDashboard.tsx';
import { TeacherReviewModal } from './components/TeacherReviewModal.tsx';
import { ShieldCheck, AlertCircle, Sparkles, GraduationCap } from 'lucide-react';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  const [teacherAccessDenied, setTeacherAccessDenied] = useState(false);

  const handleNavigate = (tab: string) => {
    setTeacherAccessDenied(false);

    // Guard Teacher Route
    if (tab === 'teacher') {
      if (!user) {
        setCurrentTab('login');
        return;
      }
      if (user.role !== 'teacher') {
        setTeacherAccessDenied(true);
        return;
      }
    }

    // Guard Student Routes
    if (['student', 'upload', 'assessment', 'results'].includes(tab)) {
      if (!user) {
        setCurrentTab('login');
        return;
      }
    }

    setCurrentTab(tab);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#060913] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-[1px] animate-spin mx-auto mb-4">
            <div className="w-full h-full bg-[#080d1e] rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <p className="text-xs text-slate-400 font-mono">Initializing VivaVoce AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 cyber-grid flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
      <div>
        <Navbar currentTab={currentTab} setCurrentTab={handleNavigate} />

        {/* Teacher Access Restricted Modal */}
        {teacherAccessDenied && (
          <div className="max-w-xl mx-auto mt-8 px-4 animate-in fade-in">
            <div className="glass-panel-glow rounded-2xl p-6 border border-cyan-500/40 text-center">
              <ShieldCheck className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white">Faculty Authorization Required</h3>
              <p className="text-xs text-slate-300 mt-1 mb-4 leading-relaxed">
                You are currently signed in as a Student (<span className="text-cyan-300">{user?.name}</span>). Access to the Faculty Review Dossier and Academic Integrity Board requires teacher privileges.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setTeacherAccessDenied(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:text-white"
                >
                  Stay on Student Portal
                </button>
                <button
                  onClick={async () => {
                    // Quick switch to faculty
                    setTeacherAccessDenied(false);
                    setCurrentTab('teacher');
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-xs font-medium text-white shadow-md"
                >
                  Switch via Top Menu to Prof. Vance
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Main Views */}
        <main>
          {currentTab === 'landing' && <LandingPage onNavigate={handleNavigate} />}

          {currentTab === 'login' && (
            <AuthPages
              initialMode="login"
              onSuccess={(role) => {
                if (role === 'teacher') {
                  setCurrentTab('teacher');
                } else {
                  setCurrentTab('student');
                }
              }}
            />
          )}

          {currentTab === 'register' && (
            <AuthPages
              initialMode="register"
              onSuccess={(role) => {
                if (role === 'teacher') {
                  setCurrentTab('teacher');
                } else {
                  setCurrentTab('student');
                }
              }}
            />
          )}

          {currentTab === 'student' && (
            <StudentDashboard
              onStartAssessment={(id) => {
                setActiveAssignmentId(id);
                setCurrentTab('assessment');
              }}
              onViewResults={(id) => {
                setActiveAssignmentId(id);
                setCurrentTab('results');
              }}
              onNewUpload={() => setCurrentTab('upload')}
            />
          )}

          {currentTab === 'upload' && (
            <AssignmentUpload
              onSuccess={(newId) => {
                setActiveAssignmentId(newId);
                setCurrentTab('assessment');
              }}
              onCancel={() => setCurrentTab('student')}
            />
          )}

          {currentTab === 'assessment' && activeAssignmentId && (
            <AssessmentInterface
              assignmentId={activeAssignmentId}
              onFinish={(id) => {
                setActiveAssignmentId(id);
                setCurrentTab('results');
              }}
              onExit={() => setCurrentTab('student')}
            />
          )}

          {currentTab === 'results' && activeAssignmentId && (
            <StudentResults
              assignmentId={activeAssignmentId}
              onBack={() => setCurrentTab('student')}
            />
          )}

          {currentTab === 'teacher' && (
            <TeacherDashboard
              onOpenReview={(revId) => setActiveReviewId(revId)}
            />
          )}

          {/* Teacher Review Dossier Modal */}
          {activeReviewId && (
            <TeacherReviewModal
              reviewId={activeReviewId}
              onClose={() => setActiveReviewId(null)}
              onRefresh={() => {}}
            />
          )}
        </main>
      </div>

      {/* Futuristic Academic Integrity Footer */}
      <footer className="mt-20 border-t border-slate-900 bg-[#04060d]/90 py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-500 p-[1px]">
              <div className="w-full h-full bg-[#080d1e] rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-slate-300">VivaVoce AI Verification System</p>
              <p className="text-[10px]">Evidence-based student comprehension assessment & academic integrity defense</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[11px]">
            <span className="flex items-center space-x-1.5 text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Powered by Gemini 3.8 Flash</span>
            </span>
            <span className="text-slate-600">|</span>
            <span>Zero-Voice Interface Discipline</span>
            <span className="text-slate-600">|</span>
            <span>Faculty-in-the-Loop Governance</span>
          </div>

          <p className="text-[10px] text-slate-600">
            © 2026 VivaVoce AI. Designed for higher education academic integrity.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
