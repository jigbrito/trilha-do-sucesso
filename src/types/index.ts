export type UserRole = 'student' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  cellphone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isAdmin: boolean;
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
  level: string;
  workload_hours: number;
  thumbnail_url: string;
  is_published: boolean;
  total_lessons?: number;
  user_progress?: {
    progress_percentage: number;
    completed_lessons: number;
    completed_at?: string | null;
  };
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  description: string;
  video_url: string;
  duration_minutes: number;
  order_index: number;
  is_completed?: boolean;
  created_at: string;
}

export interface QuestionOption {
  id: number;
  question_id: number;
  option_text: string;
  is_correct?: boolean; // Only visible to admin, hidden from students!
}

export interface Question {
  id: number;
  test_id: number;
  question_text: string;
  explanation?: string;
  points: number;
  order_index: number;
  options: QuestionOption[];
}

export interface Test {
  id: number;
  course_id: number;
  course_title?: string;
  title: string;
  description: string;
  passing_score: number;
  time_limit_minutes: number;
  is_published: boolean;
  questions?: Question[];
  total_points?: number;
  last_submission?: Submission;
}

export interface Submission {
  id: number;
  test_id: number;
  user_id: number;
  course_id: number;
  course_title?: string;
  test_title?: string;
  student_name?: string;
  student_email?: string;
  score: number;
  total_points: number;
  percentage: number;
  passed: boolean;
  submitted_at: string;
  answers?: {
    question_id: number;
    question_text: string;
    selected_option_id: number;
    selected_option_text: string;
    is_correct: boolean;
  }[];
}
