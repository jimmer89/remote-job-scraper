import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getDb } from './db';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const db = getDb();
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(credentials.email) as any;

        if (user && await bcrypt.compare(credentials.password, user.password_hash)) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            isPro: user.is_pro === 1,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.isPro = (user as any).isPro || false;
        token.userId = user.id;
      }
      if (trigger === 'update' && session?.isPro !== undefined) {
        token.isPro = session.isPro;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).isPro = token.isPro || false;
        (session.user as any).id = token.userId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Register new user with hashed password
export async function registerUser(email: string, password: string, name: string) {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    throw new Error('User already exists');
  }

  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, 12);

  db.prepare(
    'INSERT INTO users (id, email, password_hash, name, is_pro, created_at) VALUES (?, ?, ?, ?, 0, datetime("now"))'
  ).run(id, email, passwordHash, name);

  return { id, email, name, isPro: false };
}

// Upgrade user to Pro
export function upgradeUserToPro(email: string) {
  const db = getDb();
  db.prepare(
    'UPDATE users SET is_pro = 1, pro_expires_at = datetime("now", "+30 days") WHERE email = ?'
  ).run(email);
}

// Downgrade user from Pro
export function downgradeUser(email: string) {
  const db = getDb();
  db.prepare(
    'UPDATE users SET is_pro = 0, pro_expires_at = NULL WHERE email = ?'
  ).run(email);
}
