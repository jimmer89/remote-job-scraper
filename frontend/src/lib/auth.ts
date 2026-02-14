import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

// Simple in-memory user store (replace with DB in production)
const users: Map<string, { id: string; email: string; password: string; name: string; isPro: boolean; proExpiresAt: Date | null }> = new Map();

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

        const user = users.get(credentials.email);
        if (user && user.password === credentials.password) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            isPro: user.isPro,
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
      // Handle session update (e.g., after Stripe payment)
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
  secret: process.env.NEXTAUTH_SECRET || 'chilljobs-secret-key-change-in-production',
};

// Helper to register new user
export async function registerUser(email: string, password: string, name: string) {
  if (users.has(email)) {
    throw new Error('User already exists');
  }
  
  const id = Math.random().toString(36).substring(7);
  users.set(email, {
    id,
    email,
    password, // In production, hash this!
    name,
    isPro: false,
    proExpiresAt: null,
  });
  
  return { id, email, name, isPro: false };
}

// Helper to upgrade user to Pro
export function upgradeUserToPro(email: string) {
  const user = users.get(email);
  if (user) {
    user.isPro = true;
    user.proExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    users.set(email, user);
  }
}
