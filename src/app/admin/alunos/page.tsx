'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useAuth } from '@/context/AuthContext';
import { Users, Mail, Phone, Calendar, BookOpen, Award } from 'lucide-react';

export default function AdminStudentsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push('/login');
      return;
    }

    async function loadStudents() {
      try {
        const res = await fetch('/api/admin/students');
        if (res.ok) {
          const data = await res.json();
          setStudents(data.students || []);
        }
      } catch (err) {
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user?.isAdmin) {
      loadStudents();
    }
  }, [user, authLoading, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-x-hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Alunos Cadastrados
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Lista completa de estudantes, progresso de cursos e desempenho em avaliações.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              Nenhum aluno cadastrado no momento.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-6">Aluno</th>
                    <th className="py-4 px-6">Contato</th>
                    <th className="py-4 px-6">Cursos Matriculados</th>
                    <th className="py-4 px-6">Provas Realizadas</th>
                    <th className="py-4 px-6">Média Geral</th>
                    <th className="py-4 px-6">Data de Cadastro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                            {st.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{st.name}</span>
                            <span className="text-xs text-slate-400">{st.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600">
                        {st.cellphone || 'Não informado'}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-800">
                        {st.courses_enrolled} cursos ({st.courses_completed} concluídos)
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-800">
                        {st.tests_taken} avaliações
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-black text-slate-900">{st.average_grade}%</span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500">
                        {new Date(st.created_at).toLocaleDateString('pt-BR')}
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
