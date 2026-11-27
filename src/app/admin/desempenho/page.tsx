'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useAuth } from '@/context/AuthContext';
import { Award, CheckCircle2, XCircle, Filter } from 'lucide-react';

export default function AdminSubmissionsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push('/login');
      return;
    }

    async function loadData() {
      try {
        const [subRes, courseRes] = await Promise.all([
          fetch('/api/admin/submissions'),
          fetch('/api/admin/courses'),
        ]);

        if (subRes.ok) {
          const subData = await subRes.json();
          setSubmissions(subData.submissions || []);
        }

        if (courseRes.ok) {
          const cData = await courseRes.json();
          setCourses(cData.courses || []);
        }
      } catch (err) {
        console.error('Error fetching submissions:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user?.isAdmin) {
      loadData();
    }
  }, [user, authLoading, router]);

  const filtered = selectedCourse === 'all'
    ? submissions
    : submissions.filter(s => String(s.course_id) === selectedCourse);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Desempenho & Notas dos Alunos
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Registro auditável de todas as avaliações submetidas na plataforma.
            </p>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3.5 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm"
            >
              <option value="all">Todos os Cursos</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              Nenhuma avaliação registrada para os filtros selecionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-6">Aluno</th>
                    <th className="py-4 px-6">Curso & Avaliação</th>
                    <th className="py-4 px-6">Pontuação</th>
                    <th className="py-4 px-6">Aproveitamento</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Data de Envio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-900 block">{sub.student_name}</span>
                        <span className="text-xs text-slate-400">{sub.student_email}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs font-bold text-slate-400 block uppercase">{sub.course_title}</span>
                        <span className="font-semibold text-slate-800 text-xs">{sub.test_title}</span>
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-800">
                        {sub.score} / {sub.total_points} pts
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-black text-slate-900 text-base">{sub.percentage}%</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          sub.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {sub.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {sub.passed ? 'Aprovado' : 'Reprovado'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500">
                        {new Date(sub.submitted_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
