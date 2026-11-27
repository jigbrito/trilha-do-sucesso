'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  User, 
  Menu, 
  X, 
  LayoutDashboard, 
  LogOut, 
  Award, 
  ShieldCheck, 
  BookOpen, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b border-gray-100">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 h-20 flex items-center justify-between">
        
        {/* Brand / Logo (Official Trilha do Sucesso Logo from trilhadosucesso.com.br) */}
        <Link 
          href="/" 
          className="group flex items-center transition-transform duration-200 hover:scale-[1.02] active:scale-95"
        >
          <div className="flex items-center">
            <Image 
              src="/logo-trilha.png" 
              alt="Trilha do Sucesso" 
              width={220} 
              height={70} 
              className="h-10 sm:h-12 w-auto object-contain transition-all duration-300 group-hover:drop-shadow-[0_4px_12px_rgba(62,100,222,0.15)]" 
              priority 
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${
              pathname === '/' 
                ? 'text-trilha-blue-600 font-semibold' 
                : 'text-gray-600 hover:text-trilha-blue-600'
            }`}
          >
            Início
          </Link>

          <Link
            href="/cursos"
            className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
              isActive('/cursos') 
                ? 'text-trilha-blue-600 font-semibold' 
                : 'text-gray-600 hover:text-trilha-blue-600'
            }`}
          >
            <BookOpen size={16} className="text-gray-400 group-hover:text-trilha-blue-600" />
            <span>Cursos & Trilhas</span>
          </Link>

          <a
            href="https://granasolidaria.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-trilha-blue-600 text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            <span>Crédito para Empresas</span>
            <ExternalLink size={13} className="text-gray-400" />
          </a>

          {user && (
            <Link
              href="/aluno/dashboard"
              className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/aluno') 
                  ? 'text-trilha-blue-600 font-semibold' 
                  : 'text-gray-600 hover:text-trilha-blue-600'
              }`}
            >
              <LayoutDashboard size={16} />
              <span>Área do Aluno</span>
            </Link>
          )}

          {user?.isAdmin && (
            <Link
              href="/admin/dashboard"
              className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/admin') 
                  ? 'text-indigo-600 font-semibold' 
                  : 'text-indigo-600/80 hover:text-indigo-700'
              }`}
            >
              <ShieldCheck size={16} />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        {/* Right Section: Auth & Actions */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Quick direct button to user's dashboard */}
              <Link
                href={user.isAdmin ? "/admin/dashboard" : "/aluno/dashboard"}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
                  user.isAdmin
                    ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100'
                    : 'bg-blue-50 text-trilha-blue-600 hover:bg-blue-100 border border-blue-100'
                }`}
              >
                {user.isAdmin ? <ShieldCheck size={16} /> : <LayoutDashboard size={16} />}
                <span>{user.isAdmin ? "Painel Admin" : "Meu Painel"}</span>
              </Link>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-trilha-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-gray-700 max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        {user.isAdmin ? 'Administrador' : 'Aluno'}
                      </p>
                      <p className="text-sm font-bold text-gray-900 truncate mt-0.5">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/aluno/dashboard"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-trilha-blue-600 transition-colors"
                      >
                        <LayoutDashboard size={16} className="text-gray-400" />
                        <span>Meu Painel de Estudos</span>
                      </Link>

                      <Link
                        href="/aluno/notas"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-trilha-blue-600 transition-colors"
                      >
                        <Award size={16} className="text-gray-400" />
                        <span>Minhas Notas & Avaliações</span>
                      </Link>

                      {user.isAdmin && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 transition-colors"
                        >
                          <ShieldCheck size={16} className="text-indigo-500" />
                          <span>Painel Administrativo</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-1 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          logout();
                        }}
                        className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut size={16} />
                        <span>Sair da conta</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="flex items-center gap-2 text-gray-700 hover:text-trilha-blue-600 font-semibold text-sm transition-colors py-2 px-3 rounded-lg hover:bg-gray-50"
              >
                <User size={18} className="text-trilha-blue-500" />
                <span>Login</span>
              </Link>
              <Link
                href="/cadastro"
                className="flex items-center justify-center px-5 py-2.5 bg-trilha-blue-500 hover:bg-trilha-blue-600 text-white rounded-xl font-semibold shadow-md shadow-trilha-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all text-sm"
              >
                Comece Grátis
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Abrir Menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Navigation (exact Grana Solidária style) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-4">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                pathname === '/' ? 'text-trilha-blue-600 font-bold' : 'text-gray-700'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Início
            </Link>

            <Link
              href="/cursos"
              className={`text-sm font-medium transition-colors ${
                isActive('/cursos') ? 'text-trilha-blue-600 font-bold' : 'text-gray-700'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Catálogo de Cursos
            </Link>

            <a
              href="https://granasolidaria.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-trilha-blue-600 text-sm font-medium transition-colors flex items-center justify-between"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span>Crédito para Empresas</span>
              <ExternalLink size={14} className="text-gray-400" />
            </a>

            <hr className="border-gray-100 my-2" />

            {user ? (
              <div className="flex flex-col space-y-3 pt-1">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-trilha-blue-500 text-white flex items-center justify-center font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>

                <Link
                  href={user.isAdmin ? "/admin/dashboard" : "/aluno/dashboard"}
                  className="flex items-center gap-2 text-trilha-blue-600 font-bold text-sm py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {user.isAdmin ? <ShieldCheck size={18} /> : <LayoutDashboard size={18} />}
                  <span>{user.isAdmin ? "Painel Admin" : "Meu Painel de Estudos"}</span>
                </Link>

                <Link
                  href="/aluno/notas"
                  className="flex items-center gap-2 text-gray-700 font-medium text-sm py-1"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Award size={18} className="text-gray-400" />
                  <span>Minhas Notas & Avaliações</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-2 text-rose-600 font-semibold text-sm pt-2 text-left"
                >
                  <LogOut size={18} />
                  <span>Sair da conta</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3 pt-1">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 py-2.5 text-gray-700 hover:text-trilha-blue-600 font-semibold text-sm border border-gray-200 rounded-xl"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User size={18} />
                  <span>Login</span>
                </Link>
                <Link
                  href="/cadastro"
                  className="flex items-center justify-center px-4 py-2.5 bg-trilha-blue-500 text-white rounded-xl font-semibold shadow-md shadow-trilha-blue-500/20 text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Comece Grátis
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
