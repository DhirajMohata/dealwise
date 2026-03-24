import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { supabase } from "@/lib/supabase"

// Brute force protection
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

function checkLoginAllowed(email: string): boolean {
  const record = loginAttempts.get(email);
  if (!record) return true;
  if (Date.now() < record.lockedUntil) return false; // Still locked
  if (Date.now() >= record.lockedUntil) { loginAttempts.delete(email); return true; } // Lock expired
  return true;
}

function recordFailedLogin(email: string) {
  const record = loginAttempts.get(email) || { count: 0, lockedUntil: 0 };
  record.count++;
  if (record.count >= 5) {
    record.lockedUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
  }
  loginAttempts.set(email, record);
}

function clearLoginAttempts(email: string) {
  loginAttempts.delete(email);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string
        const password = credentials?.password as string

        if (!email || !password) return null
        if (!checkLoginAllowed(email)) return null

        // Login only — signup is handled by /api/auth/signup
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (!user || !bcrypt.compareSync(password, user.password)) {
          recordFailedLogin(email);
          return null
        }

        if (!user.email_verified) {
          return null // Email not verified — must verify first
        }

        clearLoginAttempts(email);
        return { id: user.id, name: user.name, email: user.email }
      },
    }),
    // Google OAuth (optional - works if credentials are set)
    ...(process.env.GOOGLE_CLIENT_ID
      ? [Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        })]
      : []),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // If there's a callbackUrl on the same origin, use it
      if (url.startsWith(baseUrl)) return url
      // Allow relative URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Default to dashboard
      return `${baseUrl}/dashboard`
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
