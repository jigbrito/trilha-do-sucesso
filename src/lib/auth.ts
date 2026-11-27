import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';
import { query } from './db';
import { SessionUser, User } from '@/types';

const SECRET_KEY = process.env.NEXTAUTH_SECRET || 'trilha-do-sucesso-secret-jwt-key-2026';
const COOKIE_NAME = 'trilha_session';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Minimalist, robust HMAC SHA-256 JWT implementation
export function signJwt(payload: Record<string, any>, expiresInSeconds: number): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(body)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyJwt<T = any>(token: string): T | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, sig] = parts;
    const expectedSig = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');

    if (sig !== expectedSig) return null;

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload as T;
  } catch (err) {
    return null;
  }
}

export async function loginUser(email: string, password: string, rememberMe: boolean = false) {
  const cleanEmail = email.trim().toLowerCase();
  const res = await query<User>(
    'SELECT id, name, email, password, role, cellphone, avatar_url FROM trilha.users WHERE email = $1 LIMIT 1',
    [cleanEmail]
  );

  if (res.rows.length === 0) {
    return { error: 'E-mail ou senha incorretos' };
  }

  const user = res.rows[0];
  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return { error: 'E-mail ou senha incorretos' };
  }

  // Session duration: 7 days if rememberMe, 24 hours otherwise
  const durationSeconds = rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60;
  const sessionUser: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isAdmin: user.role === 'admin',
  };

  const token = signJwt(sessionUser, durationSeconds);

  return {
    user: sessionUser,
    token,
    maxAge: durationSeconds,
  };
}

export async function registerUser(name: string, email: string, password: string, cellphone?: string) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  // Check if exists
  const check = await query('SELECT id FROM trilha.users WHERE email = $1 LIMIT 1', [cleanEmail]);
  if (check.rows.length > 0) {
    return { error: 'Este e-mail já está cadastrado. Por favor, faça login.' };
  }

  const hashed = await hashPassword(password);
  const insert = await query<User>(
    `INSERT INTO trilha.users (name, email, password, role, cellphone)
     VALUES ($1, $2, $3, 'student', $4)
     RETURNING id, name, email, role, cellphone, created_at`,
    [cleanName, cleanEmail, hashed, cellphone || null]
  );

  const newUser = insert.rows[0];
  const sessionUser: SessionUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    isAdmin: false,
  };

  const token = signJwt(sessionUser, 24 * 60 * 60);

  return {
    user: sessionUser,
    token,
    maxAge: 24 * 60 * 60,
  };
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const payload = verifyJwt<SessionUser>(sessionCookie.value);
  if (!payload || !payload.id) {
    return null;
  }

  return {
    id: payload.id,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    isAdmin: payload.role === 'admin',
  };
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Não autenticado');
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (!user.isAdmin) {
    throw new Error('Acesso negado: Requer privilégios de administrador');
  }
  return user;
}

export { COOKIE_NAME };
