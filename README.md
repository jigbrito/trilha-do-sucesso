# Trilha do Sucesso – Education Platform

A modern, intuitive, and responsive full-stack educational web application developed for **Trilha do Sucesso**, based on the technology stack and architectural patterns of the **Grana Solidária** ecosystem.

---

## 🚀 Tech Stack

* **Framework:** Next.js 14 (App Router) & React 18
* **Language:** TypeScript
* **Styling:** Tailwind CSS (with official Trilha do Sucesso brand palette: Royal Blue `#3E64DE`, Gold/Amber `#FFC107`, Slate `#1E293B`)
* **Icons:** Lucide React
* **Database:** PostgreSQL with Dedicated Schema (`trilha.*`) & `pg` connection pooling
* **Authentication:** JWT sessions via HTTP-only cookies and secure password hashing with `bcrypt`
* **Security Architecture:** Server-side grade calculation and validation (answer keys are strictly protected and never exposed to the client)

---

## 📋 Default Credentials (Testing Environment)

When running the initial database seed, the following test accounts are automatically provisioned:

| Role | Email | Password | Dashboard Access |
|---|---|---|---|
| **Administrator** | `admin@trilhadosucesso.com.br` | `admin123` | `/admin/dashboard` |
| **Student (Demo)** | `aluno@trilhadosucesso.com.br` | `aluno123` | `/aluno/dashboard` |

> *Tip: On the login page (`/login`), there are 1-click demo buttons to quickly fill in credentials for both student and administrator accounts.*

---

## 🛠️ Getting Started

### 1. Setup & Environment Variables
Dependencies are managed via `package.json`. Configure your environment variables in `.env.local` (see `.env.example` for reference):

```bash
POSTGRES_URL="your_postgresql_connection_string"
DB_SCHEMA="trilha"
NEXTAUTH_SECRET="your-secure-random-secret"
NEXTAUTH_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3001"
NEXT_PUBLIC_GRANA_SOLIDARIA_URL="https://granasolidaria.com.br"
PORT=3001
```

### 2. Database Migration & Seeding
To run database migrations and seed initial courses, video lessons, and quiz questions:

```bash
npm run db:migrate
npm run db:seed
```

### 3. Development Mode
Start the development server on port 3001:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### 4. Production Build
```bash
npm run build
npm run start
```

### 5. End-to-End Automated Testing
Run the complete end-to-end integration test suite covering authentication, enrollment, video progress tracking, test submission, automated server-side grading, and admin analytics:

```bash
node scripts/test-e2e.js
```

---

## 🗄️ Database Architecture (Schema `trilha`)

The platform utilizes a dedicated schema to isolate educational records while remaining compatible with shared PostgreSQL instances:

* `trilha.users`: Students and Administrators with roles, credentials, and contact info.
* `trilha.courses`: Published courses, categories, levels, workload hours, and thumbnails.
* `trilha.lessons`: Structured video lessons, descriptions, video URLs, durations, and order indices.
* `trilha.user_lesson_progress`: Tracked completion status for each student and lesson.
* `trilha.user_course_progress`: Real-time progress percentages (0% to 100%) and completed lesson counts per course.
* `trilha.tests`: Course assessments with required passing scores (e.g., 70%) and time limits.
* `trilha.questions`: Multiple-choice questions and point values.
* `trilha.question_options`: Answer options with `is_correct` flags (guarded strictly on the server).
* `trilha.submissions`: Student test submissions with scores, percentages, and pass/fail statuses.
* `trilha.submission_answers`: Audit trail of individual answers submitted by students.

---

## 🔄 Future Database Isolation

This platform is engineered to be **100% decoupled and independent**:

1. Provision a new standalone PostgreSQL instance (on Neon, Supabase, AWS RDS, or any provider).
2. Update the `POSTGRES_URL` in `.env.local` with the new connection string.
3. Run `npm run db:migrate && npm run db:seed`.
4. The platform will operate in its dedicated database without any application code changes.
