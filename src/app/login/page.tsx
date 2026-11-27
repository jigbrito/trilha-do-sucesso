'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { GraduationCap, Sparkles, LogIn, AlertCircle, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password, rememberMe);
    if (!res.success) {
      setError(res.error || 'E-mail ou senha incorretos.');
      setLoading(false);
    } else {
      // Redirect based on destination or default to aluno dashboard
      router.push('/aluno/dashboard');
      router.refresh();
    }
  };

  const handleQuickFillStudent = () => {
    setEmail('aluno@trilhadosucesso.com.br');
    setPassword('aluno123');
    setError(null);
  };

  const handleQuickFillAdmin = () => {
    setEmail('admin@trilhadosucesso.com.br');
    setPassword('admin123');
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 bg-trilha-blue-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-trilha-blue-500/30">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="mt-5 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Acessar Plataforma
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Entre para continuar seus estudos na Trilha do Sucesso
          </p>
        </div>

        {/* Demo Fast-Fill Pill Buttons for Testing */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
            Acesso Rápido para Demonstração:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleQuickFillStudent}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-sm transition-all"
            >
              <UserCheck className="w-3.5 h-3.5 text-trilha-blue-500" />
              Aluno Demo
            </button>
            <button
              type="button"
              onClick={handleQuickFillAdmin}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 shadow-sm transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              Admin Demo
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-trilha-blue-500 focus:border-transparent text-slate-900 text-sm transition-all shadow-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Senha
              </label>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-trilha-blue-500 focus:border-transparent text-slate-900 text-sm transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-trilha-blue-500 focus:ring-trilha-blue-500"
              />
              <span className="text-xs text-slate-600 font-medium">Lembrar-me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-trilha-blue-500 hover:bg-trilha-blue-600 text-white font-bold rounded-xl shadow-lg shadow-trilha-blue-500/25 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Entrando...
              </span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Entrar na Plataforma
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-sm text-slate-600">
            Ainda não tem conta?{' '}
            <Link href="/cadastro" className="font-bold text-trilha-blue-500 hover:underline">
              Cadastre-se grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
