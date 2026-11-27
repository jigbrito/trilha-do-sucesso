# Trilha do Sucesso – Plataforma Educacional

Plataforma educacional full-stack moderna, intuitiva e responsiva desenvolvida para a **Trilha do Sucesso**, baseada na arquitetura e stack tecnológica do ecossistema **Grana Solidária**.

---

## 🚀 Tecnologias Utilizadas

* **Framework:** Next.js 14 (App Router) & React 18
* **Linguagem:** TypeScript
* **Estilização:** Tailwind CSS (com paleta oficial da Trilha do Sucesso: Azul `#3E64DE`, Dourado/Âmbar `#FFC107`, Ardósia `#1E293B`)
* **Ícones:** Lucide React
* **Banco de Dados:** PostgreSQL com Schema Dedicado (`trilha.*`) e Pool de conexões `pg`
* **Autenticação:** Sessão JWT via cookies HTTP-only e hash de senhas com `bcrypt`
* **Arquitetura de Segurança:** Validação e cálculo de notas exclusivamente no backend (gabarito protegido)

---

## 📋 Credenciais Padrão (Ambiente de Teste)

Ao executar o seed inicial da base, os seguintes acessos são criados automaticamente:

| Perfil | E-mail | Senha | Acesso / Painel |
|---|---|---|---|
| **Administrador** | `admin@trilhadosucesso.com.br` | `admin123` | `/admin/dashboard` |
| **Estudante (Demo)** | `aluno@trilhadosucesso.com.br` | `aluno123` | `/aluno/dashboard` |

> *Dica: Na tela de login (`/login`) há botões de preenchimento rápido em 1 clique para testar ambos os perfis instantaneamente.*

---

## 🛠️ Como Executar a Aplicação

### 1. Instalação e Configuração
As dependências já estão instaladas. As variáveis de ambiente estão configuradas em `.env.local`:
```bash
POSTGRES_URL="sua_string_de_conexao_postgresql"
DB_SCHEMA="trilha"
PORT=3001
```

### 2. Migração e Seed do Banco de Dados
Para recriar o schema e popular os cursos iniciais com aulas e avaliações:
```bash
npm run db:migrate
npm run db:seed
```

### 3. Execução em Modo de Desenvolvimento
```bash
npm run dev
```
Acesse: [http://localhost:3001](http://localhost:3001)

### 4. Build de Produção
```bash
npm run build
npm run start
```

### 5. Testes End-to-End
Para executar a suíte de testes de ponta a ponta (login, matrícula, progresso de aulas, envio de prova, notas e admin):
```bash
node scripts/test-e2e.js
```

---

## 🗄️ Estrutura do Banco de Dados (Schema `trilha`)

* `trilha.users`: Estudantes e Administradores com papéis e hashes de senha.
* `trilha.courses`: Cursos publicados, categorias, carga horária e capas.
* `trilha.lessons`: Grade de aulas em vídeo, descrição, duração e ordenação.
* `trilha.user_lesson_progress`: Registro de aulas concluídas por cada aluno.
* `trilha.user_course_progress`: Percentual de avanço do aluno em cada curso (0% a 100%).
* `trilha.tests`: Avaliações finais com nota de corte para aprovação.
* `trilha.questions`: Questões de múltipla escolha e pontuações.
* `trilha.question_options`: Alternativas com gabarito `is_correct` (protegido no backend).
* `trilha.submissions`: Provas realizadas com pontuação, percentual e status de aprovação.
* `trilha.submission_answers`: Auditoria de cada questão respondida pelo aluno.

---

## 🔄 Como Separar em um Banco de Dados Dedicado no Futuro

A aplicação foi projetada para ser **100% desacoplada e independente**:
1. Crie uma nova instância de banco de dados PostgreSQL (no Neon, Supabase ou provedor de sua preferência).
2. No arquivo `.env.local`, substitua a variável `POSTGRES_URL` pela nova string de conexão.
3. Execute `npm run db:migrate` e `npm run db:seed`.
4. Pronto! A plataforma passa a rodar em seu próprio banco dedicado sem necessidade de alterar nenhuma linha de código.
