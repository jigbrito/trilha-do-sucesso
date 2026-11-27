'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useAuth } from '@/context/AuthContext';
import { 
  Users, 
  BookOpen, 
  CheckCircle2, 
  Award, 
  TrendingUp, 
  ArrowRight,
  PlusCircle
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push('/login');
      return;
    }

    async function loadAdminData() {
      try {
        const res = await fetch('/api/admin/overview');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Error loading admin overview:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user?.isAdmin) {
      loadAdminData();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { stats, recent_submissions, popular_courses } = data || {};

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Visão Geral da Plataforma
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Acompanhe as métricas de alunos, engajamento e avaliações em tempo real.
            </p>
          </div>

          <Link
            href="/admin/cursos"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Gerenciar Cursos
          </Link>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase">Total de Alunos</p>
            <p className="text-3xl font-black text-slate-900">{stats?.total_students || 0}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase">Cursos Criados</p>
            <p className="text-3xl font-black text-slate-900">{stats?.total_courses || 0}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase">Aulas Assistidas</p>
            <p className="text-3xl font-black text-slate-900">{stats?.lessons_completed || 0}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase">Taxa de Aprovação</p>
            <p className="text-3xl font-black text-slate-900">{stats?.pass_rate || 0}%</p>
          </div>
        </div>

        {/* Recent Student Submissions */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-lg">
              Últimas Avaliações Enviadas por Alunos
            </h3>
            <Link href="/admin/desempenho" className="text-xs font-bold text-indigo-600 hover:underline">
              Ver todas as submissões
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Aluno</th>
                  <th className="py-3.5 px-6">Curso & Avaliação</th>
                  <th className="py-3.5 px-6">Nota</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent_submissions && recent_submissions.length > 0 ? (
                  recent_submissions.map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-6">
                        <span className="font-bold text-slate-900 block">{sub.student_name}</span>
                        <span className="text-xs text-slate-400">{sub.student_email}</span>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="text-xs font-bold text-slate-400 block uppercase">{sub.course_title}</span>
                        <span className="font-semibold text-slate-800 text-xs">{sub.test_title}</span>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="font-bold text-slate-900">{sub.percentage}%</span>
                        <span className="text-xs text-slate-400 ml-1.5">({sub.score}/{sub.total_points} pts)</span>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          sub.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {sub.passed ? 'Aprovado' : 'Reprovado'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-xs text-slate-500">
                        {new Date(sub.submitted_at).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                      Nenhuma avaliação enviada ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
