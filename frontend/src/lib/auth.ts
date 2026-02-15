import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://remote-job-scraper-production-2b9c.up.railway.app';
const INTERNAL_TOKEN = process.env.INTERNAL_TOKEN || process.env.SCRAPE_TOKEN || '';

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

        try {
          const res = await fetch(`${API_URL}/api/users/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!res.ok) return null;

          const user = await res.json();
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            isPro: user.isPro,
          };
        } catch {
          return null;
        }
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

// Register new user via backend API
export async function registerUser(email: string, password: string, name: string) {
  const res = await fetch(`${API_URL}/api/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || 'Registration failed');
  }

  return res.json();
}

// Upgrade user to Pro via backend API (server-to-server, requires internal token)
export async function upgradeUserToPro(email: string, stripeCustomerId?: string) {
  const res = await fetch(`${API_URL}/api/users/upgrade`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${INTERNAL_TOKEN}`,
    },
    body: JSON.stringify({ email, stripe_customer_id: stripeCustomerId }),
  });
  return res.json();
}

// Downgrade user via backend API (server-to-server, requires internal token)
export async function downgradeUser(stripeCustomerId: string) {
  const res = await fetch(`${API_URL}/api/users/downgrade`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${INTERNAL_TOKEN}`,
    },
    body: JSON.stringify({ stripe_customer_id: stripeCustomerId }),
  });
  return res.json();
}
