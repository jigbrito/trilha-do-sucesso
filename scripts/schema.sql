-- Trilha do Sucesso Database Schema (Dedicated Schema)
CREATE SCHEMA IF NOT EXISTS trilha;

-- Users Table (Students & Administrators)
CREATE TABLE IF NOT EXISTS trilha.users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'student', -- 'student' | 'admin'
  cellphone VARCHAR(50),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses Table
CREATE TABLE IF NOT EXISTS trilha.courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  level VARCHAR(50) DEFAULT 'Iniciante',
  workload_hours INTEGER DEFAULT 4,
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lessons Table
CREATE TABLE IF NOT EXISTS trilha.lessons (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES trilha.courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 15,
  order_index INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Lesson Progress
CREATE TABLE IF NOT EXISTS trilha.user_lesson_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES trilha.users(id) ON DELETE CASCADE,
  lesson_id INTEGER NOT NULL REFERENCES trilha.lessons(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES trilha.courses(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT true,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, lesson_id)
);

-- User Course Progress
CREATE TABLE IF NOT EXISTS trilha.user_course_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES trilha.users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES trilha.courses(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0,
  completed_lessons INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  last_lesson_id INTEGER REFERENCES trilha.lessons(id) ON DELETE SET NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);

-- Tests / Assessments Table
CREATE TABLE IF NOT EXISTS trilha.tests (
  id SERIAL PRIMARY KEY,
  course_id INTEGER UNIQUE NOT NULL REFERENCES trilha.courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  passing_score INTEGER DEFAULT 70, -- 70% passing threshold
  time_limit_minutes INTEGER DEFAULT 30,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions Table
CREATE TABLE IF NOT EXISTS trilha.questions (
  id SERIAL PRIMARY KEY,
  test_id INTEGER NOT NULL REFERENCES trilha.tests(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  explanation TEXT,
  order_index INTEGER DEFAULT 1,
  points INTEGER DEFAULT 10
);

-- Question Options Table (Contains is_correct)
CREATE TABLE IF NOT EXISTS trilha.question_options (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES trilha.questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false
);

-- Submissions Table
CREATE TABLE IF NOT EXISTS trilha.submissions (
  id SERIAL PRIMARY KEY,
  test_id INTEGER NOT NULL REFERENCES trilha.tests(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES trilha.users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES trilha.courses(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_points INTEGER NOT NULL,
  percentage INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submission Answers (Auditing each answer chosen)
CREATE TABLE IF NOT EXISTS trilha.submission_answers (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER NOT NULL REFERENCES trilha.submissions(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES trilha.questions(id) ON DELETE CASCADE,
  selected_option_id INTEGER NOT NULL REFERENCES trilha.question_options(id) ON DELETE CASCADE,
  is_correct BOOLEAN NOT NULL
);

-- Indices for high performance
CREATE INDEX IF NOT EXISTS idx_trilha_users_email ON trilha.users(email);
CREATE INDEX IF NOT EXISTS idx_trilha_courses_slug ON trilha.courses(slug);
CREATE INDEX IF NOT EXISTS idx_trilha_lessons_course_id ON trilha.lessons(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_trilha_progress_user_course ON trilha.user_course_progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_trilha_submissions_user ON trilha.submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_trilha_submissions_test ON trilha.submissions(test_id);
