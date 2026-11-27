'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useAuth } from '@/context/AuthContext';
import { 
  Video, 
  PlusCircle, 
  Trash2, 
  Clock, 
  ArrowLeft, 
  ExternalLink,
  CheckCircle2 
} from 'lucide-react';
import { Course, Lesson } from '@/types';

export default function AdminLessonsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  // New Lesson form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState(15);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      if (res.ok) {
        const data = await res.json();
        setCourse(data.course);
        setLessons(data.lessons || []);
      }
    } catch (err) {
      console.error('Error loading course lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push('/login');
      return;
    }
    if (user?.isAdmin) {
      fetchLessons();
    }
  }, [user, authLoading, courseId, router]);

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: parseInt(courseId, 10),
          title,
          description,
          video_url: videoUrl,
          duration_minutes: duration,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao adicionar aula');
      } else {
        setTitle('');
        setDescription('');
        setVideoUrl('');
        setDuration(15);
        fetchLessons();
      }
    } catch (err: any) {
      setError(err.message || 'Erro de conexão');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm('Deseja excluir esta aula?')) return;

    try {
      const res = await fetch(`/api/admin/lessons?id=${lessonId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchLessons();
      }
    } catch (err) {
      console.error('Error deleting lesson:', err);
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

        {/* Course Header */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <span className="text-xs font-bold text-indigo-600 uppercase">Organização de Aulas</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {course ? course.title : 'Carregando curso...'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Adicione vídeos e organize a grade curricular deste curso.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Lessons List */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Aulas Cadastradas ({lessons.length})
            </h3>

            {lessons.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
                Nenhuma aula cadastrada ainda. Use o formulário ao lado para adicionar a primeira aula.
              </div>
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson, idx) => (
                  <div
                    key={lesson.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{lesson.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{lesson.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1 font-semibold text-slate-600">
                            <Clock className="w-3 h-3" /> {lesson.duration_minutes} min
                          </span>
                          <span className="truncate max-w-xs">{lesson.video_url}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteLesson(lesson.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg shrink-0 transition-colors"
                      title="Excluir aula"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Lesson Form */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm sticky top-28 space-y-5">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-600" />
                Adicionar Nova Aula
              </h3>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleAddLesson} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Título da Aula</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Como Precificar com Markup"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Descrição</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Resumo do que é ensinado no vídeo..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">URL do Vídeo</label>
                  <input
                    type="text"
                    required
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/embed/... ou link MP4"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Formatos aceitos: links embed do YouTube ou vídeo MP4 direto.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Duração (minutos)</label>
                  <input
                    type="number"
                    min={1}
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={adding}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
                >
                  {adding ? 'Adicionando...' : 'Adicionar Aula'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
