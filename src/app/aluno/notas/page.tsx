'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Award, CheckCircle2, XCircle, ArrowLeft, BookOpen, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Submission } from '@/types';

export default function StudentGradesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    async function loadGrades() {
      try {
        const res = await fetch('/api/student/grades');
        if (res.ok) {
          const data = await res.json();
          setSubmissions(data.submissions || []);
        }
      } catch (err) {
        console.error('Error fetching grades:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadGrades();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-trilha-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center gap-2">
          <Link
            href="/aluno/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-trilha-blue-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-trilha-gold-50 text-trilha-gold-600 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Boletim & Histórico de Avaliações
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Todas as suas provas, notas calculadas pelo servidor e histórico de aprovações.
              </p>
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          {submissions.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">Nenhuma avaliação realizada ainda</h3>
              <p className="text-xs text-slate-400 mt-1">Conclua as aulas de um curso e faça o teste para receber sua nota.</p>
              <Link
                href="/cursos"
                className="mt-4 inline-block px-5 py-2.5 bg-trilha-blue-500 text-white font-bold text-xs rounded-xl"
              >
                Explorar Cursos
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-6">Curso & Avaliação</th>
                    <th className="py-4 px-6">Pontuação</th>
                    <th className="py-4 px-6">Aproveitamento</th>
                    <th className="py-4 px-6">Resultado</th>
                    <th className="py-4 px-6">Data de Envio</th>
                    <th className="py-4 px-6 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {submissions.map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <span className="text-xs font-bold text-slate-400 block uppercase">
                          {sub.course_title}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">
                          {sub.test_title}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-800">
                        {sub.score} / {sub.total_points} pts
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-black text-base text-slate-900">{sub.percentage}%</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          sub.passed 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-rose-100 text-rose-700'
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
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/avaliacoes/${sub.test_id}`}
                          className="text-xs font-bold text-trilha-blue-600 hover:underline"
                        >
                          Refazer
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
