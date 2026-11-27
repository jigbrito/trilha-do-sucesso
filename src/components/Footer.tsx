import React from 'react';
import Link from 'next/link';
import { GraduationCap, Sparkles, ExternalLink, Mail, Shield, CheckCircle2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-trilha-blue-500 flex items-center justify-center text-white">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-xl font-extrabold text-white flex items-center gap-1.5">
                Trilha do Sucesso
                <Sparkles className="w-4 h-4 text-trilha-gold-500 fill-trilha-gold-500" />
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              &quot;Nosso propósito é criar um ecossistema capaz de prover, de forma simultânea e integrada, 
              crédito e educação empreendedora para impulsionar pequenos e médios negócios.&quot;
            </p>
            <div className="flex items-center gap-2 text-xs text-trilha-gold-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Cursos práticos, diretos e com certificação gratuita.
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Navegação</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Início</Link>
              </li>
              <li>
                <Link href="/cursos" className="hover:text-white transition-colors">Catálogo de Cursos</Link>
              </li>
              <li>
                <Link href="/aluno/dashboard" className="hover:text-white transition-colors">Área do Aluno</Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">Login / Cadastro</Link>
              </li>
            </ul>
          </div>

          {/* Ecosystem Connection */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Ecossistema</h4>
            <p className="text-xs text-slate-400 mb-3">
              Em breve, quem conclui os cursos da Trilha do Sucesso terá acesso facilitado a crédito empresarial.
            </p>
            <a
              href="https://granasolidaria.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-trilha-blue-100 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors border border-slate-700"
            >
              Conheça a Grana Solidária
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Trilha do Sucesso. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Plataforma Segura & Certificada
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
