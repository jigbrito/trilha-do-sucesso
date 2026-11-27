import React from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Target, 
  Recycle, 
  Award, 
  BookOpen,
  Users,
  Clock,
  Layers
} from 'lucide-react';
import { query } from '@/lib/db';

async function getFeaturedCourses() {
  try {
    const res = await query(`
      SELECT 
        c.*,
        COUNT(l.id)::int as total_lessons
      FROM trilha.courses c
      LEFT JOIN trilha.lessons l ON l.course_id = c.id
      WHERE c.is_published = true
      GROUP BY c.id
      ORDER BY c.id ASC
    `);
    return res.rows;
  } catch (err) {
    console.error('Error fetching featured courses:', err);
    return [];
  }
}

export default async function HomePage() {
  const courses = await getFeaturedCourses();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-20 lg:py-28">
        {/* Background gradient decorative shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-trilha-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-trilha-gold-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-trilha-gold-400 text-xs sm:text-sm font-semibold">
                <Sparkles className="w-4 h-4 fill-trilha-gold-400" />
                <span>Educação Prática para Empreendedores e PMEs</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
                Bem-vindo à <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300">
                  Trilha do Sucesso
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 max-w-2xl font-light leading-relaxed">
                Cursos práticos, diretos e gratuitos. Aprenda gestão financeira, vendas online e sustentabilidade sem enrolação e acelere seu crescimento profissional.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  href="/cadastro"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-trilha-blue-500 hover:bg-trilha-blue-600 text-white font-bold rounded-xl shadow-lg shadow-trilha-blue-500/30 transition-all hover:scale-105 active:scale-95 text-base"
                >
                  Começar Gratuitamente
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  href="/cursos"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold rounded-xl border border-slate-700 transition-all text-base"
                >
                  <BookOpen className="w-5 h-5" />
                  Ver Grade de Cursos
                </Link>
              </div>

              {/* Highlights */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-slate-300">
                <div>
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-xs text-slate-400">Gratuito</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">Direto</div>
                  <div className="text-xs text-slate-400">Ao Ponto</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">Certificado</div>
                  <div className="text-xs text-slate-400">Com Prova Online</div>
                </div>
              </div>
            </div>

            {/* Right Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-2xl relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-trilha-gold-500/20 text-trilha-gold-400 flex items-center justify-center font-bold">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Ecossistema Integrado</h3>
                    <p className="text-xs text-slate-400">Educação e Crédito para o seu Negócio</p>
                  </div>
                </div>

                <blockquote className="text-sm italic text-slate-300 border-l-2 border-trilha-gold-500 pl-4 py-1 mb-6 leading-relaxed">
                  &quot;Nosso propósito é criar um ecossistema capaz de prover, de forma simultânea e integrada, 
                  crédito e educação empreendedora.&quot;
                </blockquote>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <strong className="text-white block">Finanças & Precificação</strong>
                      Controle de caixa, markup e ponto de equilíbrio.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <strong className="text-white block">Marketing Digital & Vendas</strong>
                      WhatsApp Business, Instagram e anúncios locais.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <strong className="text-white block">Economia Circular & Gestão</strong>
                      Redução de desperdícios e práticas sustentáveis.
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-700/60 text-center">
                  <p className="text-xs text-slate-400">
                    Você que conclui a Trilha do Sucesso terá acesso facilitado a soluções financeiras para a sua empresa!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-trilha-blue-500 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Cursos Disponíveis
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight">
              Trilhas de Aprendizado Focadas em Resultados
            </h2>
            <p className="text-slate-600 text-base sm:text-lg mt-3">
              Aulas em vídeo dinâmicas com avaliações integradas para certificar o seu domínio do conteúdo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group hover:-translate-y-1"
              >
                {/* Course Image */}
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-900/80 backdrop-blur-md text-white shadow-sm">
                      {course.category}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-trilha-gold-500 text-slate-900 shadow-sm">
                      {course.level}
                    </span>
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-trilha-blue-500 transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-slate-600 text-sm mt-2 line-clamp-3 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                      <span className="flex items-center gap-1.5 font-medium">
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        {course.total_lessons} {course.total_lessons === 1 ? 'aula' : 'aulas'}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {course.workload_hours}h de carga horária
                      </span>
                    </div>

                    <Link
                      href={`/cursos/${course.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-trilha-blue-50 hover:bg-trilha-blue-500 text-trilha-blue-600 hover:text-white font-bold rounded-xl transition-all duration-200 text-sm"
                    >
                      Acessar Curso
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Methodology Banner */}
      <section className="bg-slate-50 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-trilha-blue-500 flex items-center justify-center shrink-0">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Foco na Prática Real</h4>
                <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                  Sem teorias desnecessárias. Conteúdos focados no dia a dia do micro e pequeno empresário.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Avaliação com Correção Automática</h4>
                <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                  Realize os testes online, receba sua nota em tempo real e comprove sua aprovação.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Porta de Entrada para Crédito</h4>
                <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                  Integração com o ecossistema de fomento a negócios para liberar oportunidades para sua empresa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Pronto para transformar a gestão do seu negócio?
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Crie sua conta agora mesmo em menos de 1 minuto e comece a estudar sem nenhum custo.
          </p>
          <div className="pt-4">
            <Link
              href="/cadastro"
              className="inline-flex items-center gap-2 px-8 py-4 bg-trilha-gold-500 hover:bg-trilha-gold-600 text-slate-950 font-extrabold rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 text-base"
            >
              Criar Conta Gratuita
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
