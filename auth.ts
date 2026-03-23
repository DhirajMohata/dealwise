import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import crypto from "crypto"
import bcrypt from "bcryptjs"
import { supabase } from "@/lib/supabase"
import { sendEmail, welcomeEmailHTML, verificationEmailHTML } from "@/lib/email"

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

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
        name: { label: "Name", type: "text" },
        action: { label: "Action", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string
        const password = credentials?.password as string
        const name = credentials?.name as string
        const action = credentials?.action as string

        if (!email || !password) return null
        if (!checkLoginAllowed(email)) return null
        if (password.length < 8) return null

        // Password complexity: require uppercase, lowercase, and number
        if (action === 'signup') {
          const hasUpper = /[A-Z]/.test(password);
          const hasLower = /[a-z]/.test(password);
          const hasNumber = /[0-9]/.test(password);
          if (!hasUpper || !hasLower || !hasNumber) return null;
        }

        if (action === "signup") {
          const { data: existing } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

          if (existing) {
            return null
          }

          const hashedPassword = hashPassword(password)
          const newUser = {
            id: crypto.randomUUID(),
            name: name || email.split("@")[0],
            email,
            password: hashedPassword,
          }

          const { error } = await supabase.from('users').insert(newUser);
          if (error) {
            return null
          }

          // Generate verification token
          const verificationToken = crypto.randomUUID();
          await supabase.from('users').update({ verification_token: verificationToken }).eq('email', email);

          // Send verification email instead of welcome email
          const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
          const verifyUrl = `${baseUrl}/auth/verify?token=${verificationToken}`;
          sendEmail(email, "Verify your email - dealwise", verificationEmailHTML(name || email.split("@")[0], verifyUrl)).catch(() => {});

          return { id: newUser.id, name: newUser.name, email: newUser.email }
        }

        // Login
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (!user || !bcrypt.compareSync(password, user.password)) {
          recordFailedLogin(email);
          return null
        }

        if (user && !user.email_verified) {
          return null; // Email not verified — user can't log in
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
