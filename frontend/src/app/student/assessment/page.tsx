'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { Sparkles, CheckCircle2, AlertCircle, Clock, Play, Award, ArrowRight, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function StudentAssessmentPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [activeAssessment, setActiveAssessment] = useState<any | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [attemptResult, setAttemptResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssessments() {
      try {
        const data = await apiRequest<any[]>('/assessments/available');
        setAssessments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAssessments();
  }, []);

  const handleStartAssessment = async (assessmentId: string) => {
    setLoading(true);
    try {
      const fullAssessment = await apiRequest<any>(`/assessments/${assessmentId}`);
      setActiveAssessment(fullAssessment);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setAttemptResult(null);
    } catch (err: any) {
      alert(err.message || 'Failed to start assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionKey: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleSubmitAssessment = async () => {
    if (!activeAssessment) return;

    const answersArray = Object.entries(selectedAnswers).map(([qId, ans]) => ({
      question_id: qId,
      answer: ans,
    }));

    try {
      const result = await apiRequest<any>(`/assessments/${activeAssessment.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers: answersArray }),
      });

      setAttemptResult(result);
      if (result.score >= (activeAssessment.passing_score || 70)) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      alert(err.message || 'Submission error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-400">
        <Sparkles className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-2" />
        <p className="text-sm font-medium">Loading assessment engine...</p>
      </div>
    );
  }

  // View Result Modal / Screen
  if (attemptResult) {
    const passed = attemptResult.score >= (activeAssessment?.passing_score || 70);
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-surface-border text-center space-y-6">
          <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
            passed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400'
          }`}>
            {passed ? <Award className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Assessment Completed
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              {passed ? 'Skill Verification Successful! 🎉' : 'Keep Learning & Retry'}
            </h2>
            <p className="text-sm text-slate-400">
              You scored <strong className="text-white text-lg">{attemptResult.score?.toFixed(1)}%</strong>
            </p>
          </div>

          {passed && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium inline-flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Skill Badge added to your student profile & digital portfolio!</span>
            </div>
          )}

          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={() => {
                setActiveAssessment(null);
                setAttemptResult(null);
              }}
              className="px-6 py-2.5 rounded-xl bg-surface-subtle border border-surface-border text-slate-200 text-xs font-bold hover:border-brand-primary"
            >
              Back to Assessment Hub
            </button>
            <Link
              href="/student/skills"
              className="px-6 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:opacity-90"
            >
              View Skill Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active Assessment Question Screen
  if (activeAssessment) {
    const questions = activeAssessment.questions || [];
    const currentQ = questions[currentQuestionIndex];
    const isLast = currentQuestionIndex === questions.length - 1;

    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between glass-panel p-4 rounded-2xl border border-surface-border">
          <div>
            <span className="text-[10px] uppercase font-bold text-brand-primary">Skill Assessment</span>
            <h2 className="text-base font-bold text-white">{activeAssessment.title}</h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-surface-subtle px-3 py-1.5 rounded-lg">
            <Clock className="w-4 h-4 text-brand-cyan" />
            <span>Time: {activeAssessment.duration_minutes || 15} Mins</span>
          </div>
        </div>

        {/* Question Card */}
        {currentQ && (
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-surface-border pb-4">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>Points: {currentQ.points || 1}</span>
            </div>

            <h3 className="text-lg font-bold text-white leading-relaxed">
              {currentQ.question_text}
            </h3>

            {/* Options */}
            <div className="space-y-3">
              {Object.entries(currentQ.options || {}).map(([key, text]: any) => {
                const isSelected = selectedAnswers[currentQ.id] === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectOption(currentQ.id, key)}
                    className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-brand-primary bg-brand-primary/10 text-white'
                        : 'border-surface-border bg-surface-subtle text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                        isSelected ? 'bg-brand-primary text-white' : 'bg-surface-border text-slate-400'
                      }`}>
                        {key}
                      </span>
                      <span>{text}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-brand-primary" />}
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-surface-border">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                className="px-4 py-2 rounded-xl bg-surface-subtle text-xs font-bold text-slate-300 disabled:opacity-50"
              >
                Previous
              </button>

              {isLast ? (
                <button
                  onClick={handleSubmitAssessment}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 hover:opacity-90"
                >
                  Submit Assessment
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="px-6 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold hover:opacity-90"
                >
                  Next Question
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Available Assessments List
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Skill Verification Assessment Hub</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Take standardized MCQ skill assessments to validate your proficiency and earn verified profile badges.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {assessments.map((ass: any) => (
          <div key={ass.id} className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-brand-primary/20 text-brand-primary">
                  {ass.assessment_type || 'MCQ'}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand-cyan" /> {ass.duration_minutes} Mins
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">{ass.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{ass.description}</p>
            </div>

            <button
              onClick={() => handleStartAssessment(ass.id)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-purple text-white text-xs font-bold shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Start Assessment</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
