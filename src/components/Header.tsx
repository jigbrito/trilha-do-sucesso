'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  ShieldCheck, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Sparkles,
  LayoutDashboard
} from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* Top Banner Notice */}
      <div className="bg-trilha-dark-900 text-slate-200 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-trilha-gold-500 text-slate-900">
              NOVO
            </span>
            <span>Cursos 100% práticos, diretos e gratuitos com certificação.</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-300">
            <span>Ecossistema Integrado de Educação & Crédito</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-trilha-blue-500 flex items-center justify-center text-white shadow-md shadow-trilha-blue-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
                Trilha do Sucesso
                <Sparkles className="w-4 h-4 text-trilha-gold-500 fill-trilha-gold-500" />
              </span>
              <span className="text-xs font-medium text-slate-500 tracking-wider uppercase">
                Educação Empreendedora
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={`text-sm font-semibold transition-colors ${
                pathname === '/' ? 'text-trilha-blue-500' : 'text-slate-600 hover:text-trilha-blue-500'
              }`}
            >
              Início
            </Link>
            <Link
              href="/cursos"
              className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/cursos') ? 'text-trilha-blue-500' : 'text-slate-600 hover:text-trilha-blue-500'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Catálogo de Cursos
            </Link>

            {user && (
              <Link
                href="/aluno/dashboard"
                className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/aluno') ? 'text-trilha-blue-500' : 'text-slate-600 hover:text-trilha-blue-500'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Área do Aluno
              </Link>
            )}

            {user?.isAdmin && (
              <Link
                href="/admin/dashboard"
                className={`text-sm font-semibold transition-colors flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100`}
              >
                <ShieldCheck className="w-4 h-4" />
                Painel Admin
              </Link>
            )}
          </nav>

          {/* Right Section: Auth buttons or User Profile */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-trilha-blue-500 text-white flex items-center justify-center font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800 leading-tight">{user.name}</p>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {user.isAdmin ? 'Administrador' : 'Estudante'}
                    </p>
                  </div>
                </button>

                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Conectado como</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/aluno/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      Meu Painel de Estudos
                    </Link>

                    <Link
                      href="/aluno/notas"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Award className="w-4 h-4 text-slate-400" />
                      Minhas Notas & Avaliações
                    </Link>

                    {user.isAdmin && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50"
                      >
                        <ShieldCheck className="w-4 h-4 text-indigo-500" />
                        Gestão do Sistema (Admin)
                      </Link>
                    )}

                    <div className="border-t border-slate-100 mt-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair da Conta
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-trilha-blue-500 transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-trilha-blue-500 hover:bg-trilha-blue-600 rounded-xl shadow-md shadow-trilha-blue-500/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  Cadastre-se Grátis
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Início
          </Link>
          <Link
            href="/cursos"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Catálogo de Cursos
          </Link>
          {user ? (
            <>
              <Link
                href="/aluno/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Área do Aluno
              </Link>
              <Link
                href="/aluno/notas"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Minhas Notas
              </Link>
              {user.isAdmin && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-semibold text-indigo-700 bg-indigo-50 rounded-lg"
                >
                  Painel Administrativo
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 text-base font-semibold text-rose-600 hover:bg-rose-50 rounded-lg"
              >
                Sair da conta
              </button>
            </>
          ) : (
            <div className="pt-2 space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl"
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2.5 text-sm font-bold text-white bg-trilha-blue-500 rounded-xl"
              >
                Cadastre-se Grátis
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
