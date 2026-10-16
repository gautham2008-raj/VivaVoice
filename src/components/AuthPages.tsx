import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  GraduationCap,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';

interface AuthPagesProps {
  initialMode?: 'login' | 'register';
  onSuccess: (role: 'student' | 'teacher') => void;
  onCancel?: () => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({
  initialMode = 'login',
  onSuccess,
}) => {
  const { login, register, error, clearError, quickSwitch } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [facultyPasscode, setFacultyPasscode] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);

    if (!email || !password) {
      setValidationError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      // Determine destination
      if (email.includes('teacher') || email.includes('faculty')) {
        onSuccess('teacher');
      } else {
        onSuccess('student');
      }
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);

    if (!name.trim()) {
      setValidationError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setValidationError('Please enter a valid academic or personal email address.');
      return;
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const ok = await register(name, email, password, role, facultyPasscode);
    setLoading(false);
    if (ok) {
      onSuccess(role);
    }
  };

  const handleDemoSignIn = async (userRole: 'teacher' | 'student', studentEmail?: string) => {
    setLoading(true);
    await quickSwitch(userRole, studentEmail);
    setLoading(false);
    onSuccess(userRole);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Futuristic Card with glowing border */}
        <div className="glass-panel-glow rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle top neon accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-indigo-500" />

          {/* Logo badge */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-[1px] shadow-lg shadow-purple-600/30">
              <div className="w-full h-full bg-[#080d1e] rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-cyan-400" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {mode === 'login'
                ? 'Sign in to continue your academic verification journey.'
                : 'Join VivaVoce AI for authentic assignment comprehension assessment.'}
            </p>
          </div>

          {/* Error Banner */}
          {(error || validationError) && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error || validationError}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Academic Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@institution.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white placeholder-slate-500 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white placeholder-slate-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <span>Remember me on this device</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-medium text-sm shadow-lg shadow-purple-900/40 hover:shadow-cyan-900/40 transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-400">
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      clearError();
                      setValidationError(null);
                      setMode('register');
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-medium underline underline-offset-2 transition"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jordan Miller"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white placeholder-slate-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@institution.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white placeholder-slate-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white placeholder-slate-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Confirm
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white placeholder-slate-500 transition"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center space-x-1.5 transition ${
                      role === 'student'
                        ? 'bg-purple-950/80 border-purple-500 text-purple-300 shadow-md shadow-purple-900/20'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center space-x-1.5 transition ${
                      role === 'teacher'
                        ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-900/20'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Faculty / Teacher</span>
                  </button>
                </div>
              </div>

              {/* Teacher Security Passcode Requirement */}
              {role === 'teacher' && (
                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs">
                  <label className="block text-cyan-300 font-medium mb-1 flex items-center space-x-1">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Faculty Authorization Passcode</span>
                  </label>
                  <input
                    type="password"
                    value={facultyPasscode}
                    onChange={(e) => setFacultyPasscode(e.target.value)}
                    placeholder="Enter code: FACULTY2026"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900/90 border border-cyan-500/40 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-cyan-400/80 mt-1">
                    To prevent unauthorized access, faculty privileges require an institutional authorization key (Use: <code className="bg-slate-800 px-1 py-0.5 rounded text-cyan-200">FACULTY2026</code>).
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-medium text-sm shadow-lg shadow-purple-900/40 hover:shadow-cyan-900/40 transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      clearError();
                      setValidationError(null);
                      setMode('login');
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-medium underline underline-offset-2 transition"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* Quick Demo Credentials Box */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Instant Demo Access</span>
              </span>
              <span className="text-[10px] text-slate-400">1-click test</span>
            </div>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => handleDemoSignIn('teacher')}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-cyan-500/20 hover:border-cyan-400/40 transition text-left flex items-center justify-between group"
              >
                <div>
                  <p className="text-xs font-medium text-cyan-300 group-hover:text-cyan-200">
                    Prof. Eleanor Vance
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    teacher@institution.edu · Faculty Evaluator
                  </p>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Teacher
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSignIn('student', 'alex.chen@student.edu')}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-purple-500/20 hover:border-purple-400/40 transition text-left flex items-center justify-between group"
              >
                <div>
                  <p className="text-xs font-medium text-purple-300 group-hover:text-purple-200">
                    Alex Chen
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    alex.chen@student.edu · High Understanding
                  </p>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800">
                  Student
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSignIn('student', 'maya.patel@student.edu')}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-amber-500/20 hover:border-amber-400/40 transition text-left flex items-center justify-between group"
              >
                <div>
                  <p className="text-xs font-medium text-amber-300 group-hover:text-amber-200">
                    Maya Patel
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    maya.patel@student.edu · Flagged Case Review
                  </p>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                  Student
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel-glow max-w-sm w-full p-6 rounded-2xl relative">
            <h3 className="text-lg font-bold text-white mb-2">Reset Password</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your academic email to receive an official password reset link.
            </p>
            {forgotPasswordSent ? (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Password reset link sent to {forgotEmail}! Check your inbox.</span>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@institution.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (forgotEmail) setForgotPasswordSent(true);
                  }}
                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-medium"
                >
                  Send Reset Link
                </button>
              </div>
            )}
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotPasswordSent(false);
              }}
              className="mt-4 w-full py-2 text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
