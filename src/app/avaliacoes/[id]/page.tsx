'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  FileQuestion, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowRight, 
  RotateCcw,
  Clock,
  ChevronLeft
} from 'lucide-react';
import { Test, Question, QuestionOption } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const testId = params.id as string;

  const [test, setTest] = useState<any>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTest() {
      try {
        const res = await fetch(`/api/tests/${testId}`);
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Falha ao carregar avaliação');
        }
        const data = await res.json();
        setTest(data.test);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar prova');
      } finally {
        setLoading(false);
      }
    }
    loadTest();
  }, [testId, router]);

  const handleSelectOption = (questionId: number, optionId: number) => {
    if (result) return; // Prevent changing after submission
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = async () => {
    if (!test) return;

    // Check if all questions are answered
    const unanswered = test.questions.some((q: Question) => !selectedAnswers[q.id]);
    if (unanswered) {
      if (!confirm('Você ainda não respondeu a todas as questões. Deseja enviar mesmo assim?')) {
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/tests/${testId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: selectedAnswers }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao enviar avaliação');
      } else {
        setResult(data.submission);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      setError(err.message || 'Erro de conexão');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetTest = () => {
    setResult(null);
    setSelectedAnswers({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-trilha-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !test) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800">{error}</h2>
          <Link href="/cursos" className="mt-4 inline-block px-6 py-2.5 bg-trilha-blue-500 text-white rounded-xl font-bold">
            Voltar aos Cursos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href={`/cursos/${test.course_id}`} className="hover:text-trilha-blue-500 flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Voltar ao Curso
          </Link>
        </div>

        {/* Test Header */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-trilha-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                {test.course_title}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                {test.title}
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                {test.description}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <Award className="w-8 h-8 text-trilha-gold-600" />
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">Nota Mínima</p>
                <p className="text-lg font-black text-slate-900">{test.passing_score}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Banner (if submitted) */}
        {result && (
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-lg ${
            result.passed 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-white shadow-md ${
                  result.passed ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-amber-500 shadow-amber-500/30'
                }`}>
                  {result.passed ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
                </div>

                <div>
                  <h3 className="text-2xl font-black">
                    {result.passed ? 'Parabéns! Você foi Aprovado!' : 'Quase lá! Tente Novamente'}
                  </h3>
                  <p className="text-sm opacity-90 mt-1">
                    {result.passed 
                      ? `Você atingiu ${result.percentage}% e superou a nota mínima de ${result.passing_score}%.`
                      : `Você atingiu ${result.percentage}%. É necessário no mínimo ${result.passing_score}% para aprovação.`}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleResetTest}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-800 font-bold text-sm shadow-sm hover:bg-slate-50 border border-slate-200 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Refazer Avaliação
                </button>
                <Link
                  href="/aluno/notas"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-trilha-blue-500 text-white font-bold text-sm shadow-md hover:bg-trilha-blue-600 transition-all"
                >
                  Ver Histórico de Notas
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Score Stats bar */}
            <div className="mt-6 pt-6 border-t border-black/10 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs uppercase font-bold opacity-70">Nota Final</p>
                <p className="text-2xl font-black">{result.percentage}%</p>
              </div>
              <div>
                <p className="text-xs uppercase font-bold opacity-70">Questões Corretas</p>
                <p className="text-2xl font-black">{result.correct_count} / {result.total_questions}</p>
              </div>
              <div>
                <p className="text-xs uppercase font-bold opacity-70">Pontuação</p>
                <p className="text-2xl font-black">{result.score} / {result.total_points} pts</p>
              </div>
            </div>
          </div>
        )}

        {/* Questions Form */}
        <div className="space-y-6">
          {test.questions.map((q: Question, qIdx: number) => {
            const isAnswered = Boolean(selectedAnswers[q.id]);
            return (
              <div
                key={q.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-trilha-blue-50 text-trilha-blue-600 font-black text-xs flex items-center justify-center">
                      {qIdx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      Vale {q.points} pontos
                    </span>
                  </div>
                  {isAnswered && (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Respondida
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-6 leading-relaxed">
                  {q.question_text}
                </h3>

                {/* Multi-choice options */}
                <div className="space-y-3">
                  {q.options.map((opt: QuestionOption) => {
                    const isSelected = selectedAnswers[q.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectOption(q.id, opt.id)}
                        disabled={Boolean(result)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 text-sm ${
                          isSelected
                            ? 'bg-trilha-blue-50/80 border-trilha-blue-500 ring-2 ring-trilha-blue-500/20 text-slate-900 font-semibold'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        } ${result ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'border-trilha-blue-500 bg-trilha-blue-500 text-white'
                            : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <span className="leading-relaxed">{opt.option_text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Actions */}
        {!result && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="text-xs text-slate-500">
              Questões respondidas: <strong>{Object.keys(selectedAnswers).length}</strong> de <strong>{test.questions.length}</strong>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-trilha-blue-500 hover:bg-trilha-blue-600 text-white font-extrabold rounded-xl shadow-lg shadow-trilha-blue-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 text-base"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Calculando nota...
                </span>
              ) : (
                <>
                  <Award className="w-5 h-5" />
                  Enviar Avaliação para Correção
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
