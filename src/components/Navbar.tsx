import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  ShieldCheck,
  User as UserIcon,
  LogOut,
  GraduationCap,
  Sparkles,
  ChevronDown,
  Layers,
  FileCheck2,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, logout, quickSwitch } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<{ hasKey: boolean; model: string }>({
    hasKey: true,
    model: 'gemini-3.8-flash',
  });

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setGeminiStatus({
          hasKey: data.hasGeminiKey,
          model: data.model || 'gemini-3.8-flash',
        });
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-500/15 bg-[#060913]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('landing')}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-purple-900/30">
            <div className="w-full h-full bg-[#080c1c] rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-purple-300">
                VivaVoce
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded font-mono font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">
              Academic Understanding Verification
            </p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="hidden md:flex items-center space-x-1">
          <button
            onClick={() => setCurrentTab('landing')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentTab === 'landing'
                ? 'bg-slate-800/80 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Overview
          </button>

          {user && (
            <>
              <button
                onClick={() => setCurrentTab('student')}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors ${
                  currentTab === 'student' || currentTab === 'assessment' || currentTab === 'results' || currentTab === 'upload'
                    ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-purple-400" />
                <span>Student Portal</span>
              </button>

              <button
                onClick={() => setCurrentTab('teacher')}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors ${
                  currentTab === 'teacher'
                    ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <FileCheck2 className="w-4 h-4 text-cyan-400" />
                <span>Faculty Review</span>
                {user.role !== 'teacher' && (
                  <span className="text-[10px] px-1 py-0.2 bg-slate-800 text-slate-400 rounded border border-slate-700">
                    Faculty Only
                  </span>
                )}
              </button>
            </>
          )}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center space-x-3">
          {/* AI Model Badge */}
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700/60 text-xs">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${geminiStatus.hasKey ? 'bg-cyan-400 opacity-75' : 'bg-amber-400 opacity-75'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${geminiStatus.hasKey ? 'bg-cyan-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="text-slate-300 font-mono text-[11px]">{geminiStatus.model}</span>
          </div>

          {/* Quick Demo Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-purple-500/25 hover:border-cyan-500/40 transition text-sm text-slate-200"
            >
              <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                {user ? user.name.charAt(0) : <UserIcon className="w-3.5 h-3.5" />}
              </div>
              <span className="hidden sm:inline font-medium text-xs max-w-[110px] truncate">
                {user ? user.name : 'Sign In'}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase ${
                user?.role === 'teacher' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60' : 'bg-purple-950 text-purple-300 border border-purple-800/60'
              }`}>
                {user ? user.role : 'Guest'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div
                className="absolute right-0 mt-2 w-72 rounded-xl bg-[#090d1f] border border-cyan-500/20 shadow-2xl shadow-purple-950/50 p-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setShowProfileMenu(false)}
              >
                {user ? (
                  <>
                    <div className="px-3 py-2 border-b border-slate-800 mb-1">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-400 font-mono truncate">{user.email}</p>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          user.role === 'teacher'
                            ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-500/40'
                            : 'bg-purple-900/60 text-purple-300 border border-purple-500/40'
                        }`}>
                          {user.role === 'teacher' ? 'Faculty Evaluator' : 'Student'}
                        </span>
                        {user.isApprovedTeacher && (
                          <span className="text-[10px] text-emerald-400 flex items-center space-x-0.5">
                            <ShieldCheck className="w-3 h-3 inline" />
                            <span>Verified</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Demo Switcher */}
                    <div className="px-2 py-1.5">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-1 flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>Quick Demo Switcher</span>
                      </p>
                      <button
                        onClick={() => quickSwitch('teacher')}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800/80 transition flex items-center justify-between text-slate-200"
                      >
                        <div>
                          <span className="font-medium text-cyan-300">Prof. Eleanor Vance</span>
                          <span className="block text-[10px] text-slate-400">Faculty Review Dashboard</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 bg-cyan-950 text-cyan-400 rounded border border-cyan-800">Teacher</span>
                      </button>

                      <button
                        onClick={() => quickSwitch('student', 'alex.chen@student.edu')}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800/80 transition flex items-center justify-between text-slate-200 mt-1"
                      >
                        <div>
                          <span className="font-medium text-purple-300">Alex Chen</span>
                          <span className="block text-[10px] text-slate-400">Student (Verified viva results)</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 bg-purple-950 text-purple-400 rounded border border-purple-800">Student</span>
                      </button>

                      <button
                        onClick={() => quickSwitch('student', 'maya.patel@student.edu')}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-800/80 transition flex items-center justify-between text-slate-200 mt-1"
                      >
                        <div>
                          <span className="font-medium text-amber-300">Maya Patel</span>
                          <span className="block text-[10px] text-slate-400">Student (Flagged inconsistency case)</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-950 text-amber-400 rounded border border-amber-800">Student</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-800 mt-1.5 pt-1">
                      <button
                        onClick={logout}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-rose-300 hover:bg-rose-950/40 rounded-lg transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-2 space-y-2">
                    <button
                      onClick={() => setCurrentTab('login')}
                      className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium text-xs text-center shadow-lg hover:opacity-95 transition"
                    >
                      Sign In / Register
                    </button>
                    <div className="border-t border-slate-800 pt-2">
                      <p className="text-[10px] text-slate-400 px-1 mb-1">Instant Demo Logins:</p>
                      <button
                        onClick={() => quickSwitch('teacher')}
                        className="w-full text-left px-2 py-1 rounded text-xs text-cyan-300 hover:bg-slate-800 flex justify-between"
                      >
                        <span>Faculty (Teacher)</span>
                        <span className="text-[10px] text-slate-400">Instant</span>
                      </button>
                      <button
                        onClick={() => quickSwitch('student', 'alex.chen@student.edu')}
                        className="w-full text-left px-2 py-1 rounded text-xs text-purple-300 hover:bg-slate-800 flex justify-between"
                      >
                        <span>Student (Alex)</span>
                        <span className="text-[10px] text-slate-400">Instant</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
