'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Clock, 
  PlayCircle, 
  CheckCircle2, 
  Award, 
  ShieldCheck, 
  ArrowRight,
  FileQuestion,
  ChevronRight
} from 'lucide-react';
import { Course, Lesson, Test } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [test, setTest] = useState<Test | null>(null);
  const [progress, setProgress] = useState({ progress_percentage: 0, completed_lessons: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourse() {
      try {
        const res = await fetch(`/api/courses/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setCourse(data.course);
          setLessons(data.lessons || []);
          setTest(data.test);
          if (data.user_progress) {
            setProgress(data.user_progress);
          }
        }
      } catch (err) {
        console.error('Error loading course:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-trilha-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <h2 className="text-2xl font-bold text-slate-800">Curso não encontrado</h2>
        <Link href="/cursos" className="mt-4 px-6 py-2.5 bg-trilha-blue-500 text-white rounded-xl font-bold">
          Voltar ao Catálogo
        </Link>
      </div>
    );
  }

  const firstLessonId = lessons.length > 0 ? lessons[0].id : null;
  const isAllLessonsCompleted = progress.progress_percentage === 100;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/cursos" className="hover:text-trilha-blue-500">Catálogo</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 truncate">{course.title}</span>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10">
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-trilha-blue-50 text-trilha-blue-600 text-xs font-bold border border-blue-100">
                  {course.category}
                </span>
                <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                  Nível: {course.level}
                </span>
                <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Gratuito
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {course.title}
              </h1>

              <p className="text-slate-600 text-base leading-relaxed">
                {course.description}
              </p>
            </div>

            {/* Quick stats and Progress */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span>{lessons.length} Aulas em Vídeo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{course.workload_hours}h de Duração</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-trilha-gold-600" />
                  <span>Certificado com Prova</span>
                </div>
              </div>

              {user && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                    <span>Seu Progresso no Curso</span>
                    <span className="text-trilha-blue-600">{progress.progress_percentage}% Concluído</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-trilha-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress.progress_percentage}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                {firstLessonId && (
                  <Link
                    href={`/cursos/${course.id}/aula/${firstLessonId}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-trilha-blue-500 hover:bg-trilha-blue-600 text-white font-bold rounded-xl shadow-lg shadow-trilha-blue-500/25 transition-all text-sm"
                  >
                    <PlayCircle className="w-5 h-5" />
                    {progress.completed_lessons > 0 ? 'Continuar Aulas' : 'Começar a Assistir'}
                  </Link>
                )}

                {test && (
                  <Link
                    href={`/avaliacoes/${test.id}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-all text-sm"
                  >
                    <FileQuestion className="w-5 h-5 text-trilha-gold-600" />
                    Fazer Avaliação Final
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="lg:col-span-5 relative rounded-2xl overflow-hidden min-h-[260px] bg-slate-100 shadow-inner">
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Course Syllabus */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">
                Grade Curricular ({lessons.length} Aulas)
              </h2>
            </div>

            <div className="space-y-3">
              {lessons.map((lesson, idx) => (
                <Link
                  key={lesson.id}
                  href={`/cursos/${course.id}/aula/${lesson.id}`}
                  className="block bg-white p-5 rounded-2xl border border-slate-200 hover:border-trilha-blue-500/50 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${
                        lesson.is_completed 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-slate-100 text-slate-600 group-hover:bg-trilha-blue-50 group-hover:text-trilha-blue-600'
                      }`}>
                        {lesson.is_completed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-800 group-hover:text-trilha-blue-600 transition-colors">
                          {lesson.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1 line-clamp-2">
                          {lesson.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {lesson.duration_minutes} min
                      </span>
                      <PlayCircle className="w-5 h-5 text-slate-300 group-hover:text-trilha-blue-500 transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Assessment Card Sidebar */}
          <div className="lg:col-span-4">
            {test ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5 sticky top-28">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-trilha-gold-600 flex items-center justify-center font-bold">
                  <Award className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">{test.title}</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Complete as aulas para testar seus conhecimentos e emitir sua nota oficial.
                  </p>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nota mínima para aprovação:</span>
                    <span className="font-bold text-slate-900">{test.passing_score}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tempo estimado:</span>
                    <span className="font-bold text-slate-900">{test.time_limit_minutes} minutos</span>
                  </div>
                  {test.last_submission && (
                    <div className="flex justify-between pt-2 border-t border-slate-100">
                      <span className="text-slate-500">Sua melhor nota:</span>
                      <span className={`font-bold ${test.last_submission.passed ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {test.last_submission.percentage}% ({test.last_submission.passed ? 'Aprovado' : 'Não aprovado'})
                      </span>
                    </div>
                  )}
                </div>

                <Link
                  href={`/avaliacoes/${test.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-trilha-gold-500 hover:bg-trilha-gold-600 text-slate-950 font-bold rounded-xl shadow-md transition-all text-sm"
                >
                  <FileQuestion className="w-4 h-4" />
                  Iniciar Avaliação Online
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center text-slate-500 text-sm">
                Nenhuma avaliação cadastrada para este curso no momento.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
