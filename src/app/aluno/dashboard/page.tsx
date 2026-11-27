'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  CheckCircle2, 
  Award, 
  Clock, 
  ArrowRight, 
  PlayCircle,
  FileQuestion,
  TrendingUp,
  Flame,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    async function loadDashboard() {
      try {
        const res = await fetch('/api/student/dashboard');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadDashboard();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-trilha-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { stats, courses, pending_tests, recent_grades } = data || {};

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-trilha-blue-500/10 blur-2xl pointer-events-none" />

          <div className="max-w-3xl relative z-10 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-trilha-gold-400 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 fill-trilha-gold-400" />
              Área do Aluno
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Olá, {user?.name}! 👋
            </h1>
            <p className="text-slate-300 text-sm sm:text-base font-light max-w-2xl leading-relaxed">
              Continue seus estudos na Trilha do Sucesso. Cada aula assistida e avaliação concluída aproxima você da certificação e de novas oportunidades para sua empresa.
            </p>
          </div>
        </div>

        {/* 4 Key Performance Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-trilha-blue-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Cursos Ativos</p>
              <p className="text-2xl font-black text-slate-900">{courses?.length || 0}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Aulas Concluídas</p>
              <p className="text-2xl font-black text-slate-900">{stats?.completed_lessons_count || 0}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Média Geral</p>
              <p className="text-2xl font-black text-slate-900">{stats?.average_grade || 0}%</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Certificações</p>
              <p className="text-2xl font-black text-slate-900">{stats?.certified_courses || 0}</p>
            </div>
          </div>
        </div>

        {/* Ongoing Courses Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Seus Cursos em Andamento
            </h2>
            <Link href="/cursos" className="text-xs sm:text-sm font-bold text-trilha-blue-600 hover:underline flex items-center gap-1">
              Ver todos os cursos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses?.map((c: any) => (
              <div
                key={c.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-40 w-full relative overflow-hidden bg-slate-100">
                    <img
                      src={c.thumbnail_url}
                      alt={c.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-900/80 backdrop-blur-md text-white">
                        {c.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-slate-900 text-base line-clamp-2">
                      {c.title}
                    </h3>

                    {/* Progress Bar */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-600">
                        <span>{c.completed_lessons} de {c.total_lessons} aulas</span>
                        <span className="text-trilha-blue-600 font-bold">{c.progress_percentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-trilha-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${c.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2">
                  <Link
                    href={`/cursos/${c.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-trilha-blue-50 hover:bg-trilha-blue-500 text-trilha-blue-600 hover:text-white font-bold rounded-xl transition-all text-xs sm:text-sm"
                  >
                    <PlayCircle className="w-4 h-4" />
                    {c.progress_percentage > 0 ? 'Continuar Assistindo' : 'Iniciar Aula'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lower Section: Pending Assessments & Recent Grades */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Pending Assessments */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileQuestion className="w-5 h-5 text-trilha-gold-600" />
              Avaliações Pendentes
            </h3>

            {pending_tests && pending_tests.length > 0 ? (
              <div className="space-y-3">
                {pending_tests.map((t: any) => (
                  <div
                    key={t.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4"
                  >
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 block uppercase">
                        {t.course_title}
                      </span>
                      <h4 className="text-sm font-bold text-slate-800 mt-0.5">
                        {t.test_title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Nota para aprovação: <strong>{t.passing_score}%</strong>
                      </p>
                    </div>

                    <Link
                      href={`/avaliacoes/${t.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-trilha-gold-500 hover:bg-trilha-gold-600 text-slate-950 font-bold rounded-xl text-xs transition-colors shrink-0 shadow-sm"
                    >
                      Fazer Prova
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                Parabéns! Você não possui avaliações pendentes no momento.
              </div>
            )}
          </div>

          {/* Recent Grades */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-trilha-blue-600" />
                Últimas Notas Recebidas
              </h3>
              <Link href="/aluno/notas" className="text-xs font-bold text-trilha-blue-600 hover:underline">
                Histórico completo
              </Link>
            </div>

            {recent_grades && recent_grades.length > 0 ? (
              <div className="space-y-3">
                {recent_grades.map((g: any) => (
                  <div
                    key={g.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4"
                  >
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 block uppercase">
                        {g.course_title}
                      </span>
                      <h4 className="text-sm font-bold text-slate-800 mt-0.5">
                        {g.test_title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(g.submitted_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                        g.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {g.percentage}% • {g.passed ? 'Aprovado' : 'Reprovado'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
                Nenhuma avaliação realizada ainda. Assista às aulas e faça sua primeira prova!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
