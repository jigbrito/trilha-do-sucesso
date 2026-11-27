'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  PlayCircle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Award,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Course, Lesson, Test } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const courseId = params.id as string;
  const currentLessonId = parseInt(params.lessonId as string, 10);

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [test, setTest] = useState<Test | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [progress, setProgress] = useState({ progress_percentage: 0, completed_lessons: 0 });
  const [toggling, setToggling] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourseAndLesson() {
      try {
        const res = await fetch(`/api/courses/${courseId}`);
        if (res.ok) {
          const data = await res.json();
          setCourse(data.course);
          setLessons(data.lessons || []);
          setTest(data.test);
          if (data.user_progress) {
            setProgress(data.user_progress);
          }

          const found = (data.lessons || []).find((l: Lesson) => l.id === currentLessonId);
          if (found) {
            setCurrentLesson(found);
            setIsCompleted(Boolean(found.is_completed));
          }
        }
      } catch (err) {
        console.error('Error loading lesson:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCourseAndLesson();
  }, [courseId, currentLessonId]);

  const handleToggleCompleted = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setToggling(true);
    try {
      const res = await fetch(`/api/lessons/${currentLessonId}/progress`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setIsCompleted(data.is_completed);
        setProgress(data.course_progress);

        // Update local lesson list is_completed
        setLessons(prev => prev.map(l => l.id === currentLessonId ? { ...l, is_completed: data.is_completed } : l));
      }
    } catch (err) {
      console.error('Error toggling progress:', err);
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="w-10 h-10 border-4 border-trilha-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentLesson || !course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
        <h2 className="text-xl font-bold">Aula não encontrada</h2>
        <Link href={`/cursos/${courseId}`} className="mt-4 px-6 py-2 bg-trilha-blue-500 rounded-xl font-bold">
          Voltar para o Curso
        </Link>
      </div>
    );
  }

  const currentIndex = lessons.findIndex(l => l.id === currentLessonId);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Top Bar Navigation */}
      <div className="bg-slate-950/80 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/cursos/${courseId}`}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar ao Curso
          </Link>
          <span className="text-slate-700">|</span>
          <span className="text-xs sm:text-sm font-bold text-slate-200 truncate max-w-xs sm:max-w-md">
            {course.title}
          </span>
        </div>

        {/* Progress Pill */}
        <div className="hidden sm:flex items-center gap-3">
          <span className="text-xs text-slate-400">Progresso do Curso:</span>
          <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-trilha-blue-500 transition-all duration-300"
              style={{ width: `${progress.progress_percentage}%` }}
            />
          </div>
          <span className="text-xs font-bold text-trilha-blue-400">{progress.progress_percentage}%</span>
        </div>
      </div>

      {/* Main Player & Sidebar Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Video Area */}
        <div className="lg:col-span-8 flex flex-col bg-black">
          {/* Responsive 16:9 Video Wrapper */}
          <div className="relative w-full aspect-video bg-black flex items-center justify-center">
            {currentLesson.video_url.includes('youtube.com') || currentLesson.video_url.includes('youtu.be') ? (
              <iframe
                src={currentLesson.video_url}
                title={currentLesson.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={currentLesson.video_url}
                controls
                className="w-full h-full object-contain"
              />
            )}
          </div>

          {/* Player Controls & Lesson Info */}
          <div className="p-6 sm:p-8 bg-slate-900 border-t border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-trilha-gold-400">
                  Aula {currentIndex + 1} de {lessons.length}
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {currentLesson.title}
                </h1>
              </div>

              {/* Mark Completed Button */}
              <button
                type="button"
                onClick={handleToggleCompleted}
                disabled={toggling}
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md ${
                  isCompleted
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-trilha-blue-500 hover:bg-trilha-blue-600 text-white'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                {isCompleted ? 'Aula Concluída ✓' : 'Marcar como Concluída'}
              </button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
              {currentLesson.description}
            </p>

            {/* Bottom Lesson Navigation */}
            <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
              {prevLesson ? (
                <Link
                  href={`/cursos/${courseId}/aula/${prevLesson.id}`}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Aula Anterior
                </Link>
              ) : <div />}

              {nextLesson ? (
                <Link
                  href={`/cursos/${courseId}/aula/${nextLesson.id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all"
                >
                  Próxima Aula
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : test ? (
                <Link
                  href={`/avaliacoes/${test.id}`}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-trilha-gold-500 hover:bg-trilha-gold-600 text-slate-950 rounded-xl text-xs sm:text-sm font-extrabold shadow-lg transition-transform hover:scale-105"
                >
                  <Award className="w-4 h-4" />
                  Fazer Avaliação Final
                </Link>
              ) : <div />}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Course Playlist */}
        <div className="lg:col-span-4 bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col h-full overflow-y-auto">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50">
            <h3 className="font-bold text-sm text-white flex items-center justify-between">
              <span>Conteúdo do Curso</span>
              <span className="text-xs text-slate-400 font-normal">
                {progress.completed_lessons} de {lessons.length} aulas
              </span>
            </h3>
          </div>

          <div className="divide-y divide-slate-800/60 flex-1">
            {lessons.map((lesson, idx) => {
              const isCurrent = lesson.id === currentLessonId;
              return (
                <Link
                  key={lesson.id}
                  href={`/cursos/${courseId}/aula/${lesson.id}`}
                  className={`p-4 flex items-start gap-3 transition-colors ${
                    isCurrent
                      ? 'bg-trilha-blue-500/10 border-l-4 border-trilha-blue-500'
                      : 'hover:bg-slate-900'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                    lesson.is_completed
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isCurrent
                      ? 'bg-trilha-blue-500 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {lesson.is_completed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-xs sm:text-sm font-medium line-clamp-2 ${
                      isCurrent ? 'text-trilha-blue-400 font-bold' : 'text-slate-300'
                    }`}>
                      {lesson.title}
                    </p>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {lesson.duration_minutes} min
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Test Action in Playlist */}
          {test && (
            <div className="p-4 bg-slate-900 border-t border-slate-800">
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 space-y-2">
                <div className="flex items-center gap-2 text-trilha-gold-400 font-bold text-xs">
                  <Award className="w-4 h-4" />
                  <span>Avaliação Certificadora</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Nota mínima: {test.passing_score}% para aprovação.
                </p>
                <Link
                  href={`/avaliacoes/${test.id}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-trilha-gold-500 hover:bg-trilha-gold-600 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                >
                  Realizar Prova
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
