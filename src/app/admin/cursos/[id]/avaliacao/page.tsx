'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useAuth } from '@/context/AuthContext';
import { 
  FileQuestion, 
  PlusCircle, 
  Trash2, 
  Award, 
  ArrowLeft, 
  CheckCircle2,
  Save,
  AlertCircle
} from 'lucide-react';
import { Course } from '@/types';

interface QuestionForm {
  question_text: string;
  points: number;
  options: {
    option_text: string;
    is_correct: boolean;
  }[];
}

export default function AdminTestBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [timeLimit, setTimeLimit] = useState(30);
  const [questions, setQuestions] = useState<QuestionForm[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push('/login');
      return;
    }

    async function loadTest() {
      try {
        const res = await fetch(`/api/admin/tests?course_id=${courseId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.test) {
            setTitle(data.test.title || '');
            setDescription(data.test.description || '');
            setPassingScore(data.test.passing_score || 70);
            setTimeLimit(data.test.time_limit_minutes || 30);
            if (Array.isArray(data.test.questions)) {
              setQuestions(data.test.questions.map((q: any) => ({
                question_text: q.question_text,
                points: q.points || 10,
                options: q.options || []
              })));
            }
          }
        }

        const courseRes = await fetch(`/api/courses/${courseId}`);
        if (courseRes.ok) {
          const cData = await courseRes.json();
          setCourse(cData.course);
          if (!title) {
            setTitle(`Avaliação Final: ${cData.course.title}`);
          }
        }
      } catch (err) {
        console.error('Error loading test builder:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user?.isAdmin) {
      loadTest();
    }
  }, [user, authLoading, courseId, router]);

  const handleAddQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        question_text: '',
        points: 25,
        options: [
          { option_text: '', is_correct: true },
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
        ]
      }
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSetCorrectOption = (questionIdx: number, optionIdx: number) => {
    setQuestions(prev => prev.map((q, qI) => {
      if (qI !== questionIdx) return q;
      return {
        ...q,
        options: q.options.map((opt, optI) => ({
          ...opt,
          is_correct: optI === optionIdx,
        }))
      };
    }));
  };

  const handleOptionTextChange = (questionIdx: number, optionIdx: number, text: string) => {
    setQuestions(prev => prev.map((q, qI) => {
      if (qI !== questionIdx) return q;
      return {
        ...q,
        options: q.options.map((opt, optI) => optI === optionIdx ? { ...opt, option_text: text } : opt)
      };
    }));
  };

  const handleQuestionTextChange = (questionIdx: number, text: string) => {
    setQuestions(prev => prev.map((q, qI) => qI === questionIdx ? { ...q, question_text: text } : q));
  };

  const handleSaveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    // Validation
    if (questions.length === 0) {
      setError('Adicione pelo menos 1 questão para a prova.');
      setSaving(false);
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text.trim()) {
        setError(`O enunciado da questão ${i + 1} está em branco.`);
        setSaving(false);
        return;
      }
      const hasCorrect = q.options.some(opt => opt.is_correct);
      if (!hasCorrect) {
        setError(`A questão ${i + 1} precisa ter uma resposta correta definida.`);
        setSaving(false);
        return;
      }
    }

    try {
      const res = await fetch('/api/admin/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: parseInt(courseId, 10),
          title,
          description,
          passing_score: passingScore,
          time_limit_minutes: timeLimit,
          questions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao salvar avaliação');
      } else {
        setSuccessMsg('Avaliação e gabarito salvos com sucesso no banco de dados!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      setError(err.message || 'Erro de conexão');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-x-hidden">
        <div className="flex items-center gap-2">
          <Link
            href="/admin/cursos"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para Cursos
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <span className="text-xs font-bold text-amber-600 uppercase">Construtor de Avaliação & Gabarito</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {course ? `Avaliação: ${course.title}` : 'Configurar Avaliação'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Cadastre questões de múltipla escolha, defina a resposta correta e a nota de corte para aprovação.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveTest} className="space-y-8">
          {/* General Settings */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Parâmetros da Prova</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Título da Avaliação</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Descrição / Instruções</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Orientações aos alunos antes de iniciar..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nota Mínima de Aprovação (%)</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={passingScore}
                  onChange={(e) => setPassingScore(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tempo Estimado (minutos)</label>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">
                Questões da Prova ({questions.length})
              </h3>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors"
              >
                <PlusCircle className="w-4 h-4" /> Adicionar Questão
              </button>
            </div>

            {questions.map((q, qIdx) => (
              <div
                key={qIdx}
                className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg">
                    Questão {qIdx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(qIdx)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> Remover Questão
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Enunciado da Questão</label>
                  <input
                    type="text"
                    required
                    value={q.question_text}
                    onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                    placeholder="Digite a pergunta para o aluno..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-500 uppercase">
                    Alternativas (Marque a correta):
                  </label>

                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name={`correct-opt-${qIdx}`}
                        checked={opt.is_correct}
                        onChange={() => handleSetCorrectOption(qIdx, optIdx)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        title="Marcar como alternativa correta"
                      />
                      <input
                        type="text"
                        required
                        value={opt.option_text}
                        onChange={(e) => handleOptionTextChange(qIdx, optIdx, e.target.value)}
                        placeholder={`Alternativa ${optIdx + 1}`}
                        className={`flex-1 px-3.5 py-2 rounded-xl border text-sm transition-all ${
                          opt.is_correct
                            ? 'border-emerald-500 bg-emerald-50/50 font-semibold'
                            : 'border-slate-300'
                        }`}
                      />
                      {opt.is_correct && (
                        <span className="text-[11px] font-bold text-emerald-600 shrink-0">
                          Resposta Correta ✓
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-lg shadow-indigo-600/30 transition-all text-base disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Salvando Prova...' : 'Salvar Avaliação no Banco'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
