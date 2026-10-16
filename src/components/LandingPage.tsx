import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  ShieldCheck,
  BrainCircuit,
  FileSearch,
  MessageSquareText,
  ClipboardCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Award,
  Users,
  Compass,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden">
      {/* Background ambient orbs */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-purple-600/20 via-cyan-500/15 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-96 right-10 w-80 h-80 bg-indigo-600/10 blur-3xl pointer-events-none rounded-full" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Top badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs text-cyan-300 mb-8 shadow-lg shadow-cyan-950/40">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-medium tracking-wide">Next-Generation Academic Verification Engine</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.12]">
          Verify Understanding.{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">
            Build Academic Integrity.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
          An AI-powered platform that helps educators evaluate whether students understand their own assignments through personalized, evidence-based assessments.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => onNavigate(user ? (user.role === 'teacher' ? 'teacher' : 'student') : 'login')}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-xl shadow-purple-950/60 hover:shadow-cyan-950/60 transition transform hover:-translate-y-0.5 flex items-center space-x-2 cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('student')}
            className="px-7 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-purple-500/30 text-purple-200 font-semibold text-sm transition flex items-center space-x-2 cursor-pointer"
          >
            <GraduationCap className="w-4 h-4 text-purple-400" />
            <span>Student Portal</span>
          </button>

          <button
            onClick={() => onNavigate('teacher')}
            className="px-7 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-cyan-500/30 text-cyan-200 font-semibold text-sm transition flex items-center space-x-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Teacher Dashboard</span>
          </button>
        </div>

        {/* Trust Badges Bar */}
        <div className="mt-14 pt-8 border-t border-slate-800/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left max-w-4xl mx-auto">
          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
            <p className="text-xl font-bold text-cyan-300">100%</p>
            <p className="text-xs text-slate-400 mt-0.5">Text-Based Oral Vivas</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
            <p className="text-xl font-bold text-purple-300">Zero-Fluff</p>
            <p className="text-xs text-slate-400 mt-0.5">Evidence-Grounded Questions</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
            <p className="text-xl font-bold text-emerald-300">Human-in-Loop</p>
            <p className="text-xs text-slate-400 mt-0.5">Final Faculty Decision</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
            <p className="text-xl font-bold text-indigo-300">Gemini 3.8</p>
            <p className="text-xs text-slate-400 mt-0.5">Multimodal Reasoning</p>
          </div>
        </div>
      </section>

      {/* 3 Main Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">
            Core Architecture
          </h2>
          <p className="mt-2 text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Comprehensive Verification Pipeline
          </p>
          <p className="mt-3 text-sm text-slate-400 max-w-2xl mx-auto">
            Instead of inaccurate generic AI detectors that penalize legitimate students, VivaVoce AI evaluates actual conceptual comprehension through personalized probing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass-panel-glow rounded-2xl p-7 relative group hover:border-purple-400/50 transition">
            <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition">
              <FileSearch className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              1. AI Assignment Analysis
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Extracts key concepts, main arguments, mathematical procedures, technical terminology, and critical claims from uploaded student submissions.
            </p>
            <ul className="text-xs text-slate-400 space-y-2">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Deep structural extraction of claims & evidence</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Identifies potential misconceptions to probe</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Supports PDF, DOCX, and TXT documents</span>
              </li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="glass-panel-cyan rounded-2xl p-7 relative group hover:border-cyan-400/50 transition">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 transition">
              <MessageSquareText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              2. Personalized AI Viva
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Generates questions tailored directly to each specific assignment. Never asks generic trivia; asks students to defend their reasoning and methodology.
            </p>
            <ul className="text-xs text-slate-400 space-y-2">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Direct questions on specific paper statements</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Dynamic follow-up prompts for vague answers</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>100% text-based typed assessment interface</span>
              </li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="glass-panel-glow rounded-2xl p-7 relative group hover:border-indigo-400/50 transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-110 transition">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              3. Understanding & Integrity Report
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Summarizes student understanding across 5 dimensions and highlights factual or methodological inconsistencies for teacher review.
            </p>
            <ul className="text-xs text-slate-400 space-y-2">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>5-dimension rubric (Conceptual, Accuracy, Reasoning...)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Evidence-based review flags (no cheating labels)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Provides targeted oral questions for teachers</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-950/40 border-y border-slate-900">
        <div className="text-center mb-16">
          <h2 className="text-xs font-semibold text-purple-400 uppercase tracking-widest">
            Step-by-Step Workflow
          </h2>
          <p className="mt-2 text-3xl font-bold text-white tracking-tight">
            How VivaVoce AI Operates
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-md border border-cyan-800">
              STAGE 01
            </span>
            <h4 className="text-base font-bold text-white mt-4 mb-2">Student Submits Assignment</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Student uploads their paper (PDF, DOCX, TXT) along with course details. The system extracts raw text and metadata securely.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs font-mono font-bold text-purple-400 bg-purple-950/80 px-2.5 py-1 rounded-md border border-purple-800">
              STAGE 02
            </span>
            <h4 className="text-base font-bold text-white mt-4 mb-2">Gemini Analyzes & Probes</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gemini extracts core claims and generates 5 personalized viva questions with private evaluation rubrics and expected concepts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/80 px-2.5 py-1 rounded-md border border-indigo-800">
              STAGE 03
            </span>
            <h4 className="text-base font-bold text-white mt-4 mb-2">Interactive Text Viva</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              The student answers questions through text in real time. Dynamic follow-ups are triggered if an explanation is ambiguous.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800">
              STAGE 04
            </span>
            <h4 className="text-base font-bold text-white mt-4 mb-2">Teacher Review & Audit</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Faculty reviews understanding reports, side-by-side paper excerpts, and any flagged contradictions, retaining full decision authority.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy and Responsible AI Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="glass-panel-glow rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Responsible AI & Academic Fairness</h3>
              <p className="text-xs text-slate-400">Our ethical principles in evaluating student work</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-slate-300">
            <div className="space-y-2">
              <h4 className="font-semibold text-white flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>No Automatic Accusations</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                We never label a student a "cheater". Incomplete answers, nervousness, or writing style variations are not misconduct. We only provide evidence-based review flags.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-white flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>Human-in-the-Loop Authority</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                The AI does not make punitive academic decisions. Every flag provides suggested oral questions for the instructor to discuss directly with the student.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-white flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Paraphrasing is Respected</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Students are encouraged to explain concepts in their own words. Differing vocabulary from the submitted paper is welcomed as a sign of organic thought.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-white flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>Privacy & Confidentiality</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Teacher notes and internal integrity rubrics are strictly partitioned from student-facing results. Documents are processed exclusively for assessment.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
