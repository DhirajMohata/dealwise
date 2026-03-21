import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import crypto from "crypto"
import bcrypt from "bcryptjs"
import { supabase } from "@/lib/supabase"
import { sendEmail, welcomeEmailHTML } from "@/lib/email"

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
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

        if (action === "signup") {
          const { data: existing } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

          if (existing) {
            throw new Error("User already exists. Please login instead.")
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
            throw new Error("Failed to create account. Please try again.")
          }

          // Send welcome email (non-blocking)
          sendEmail(email, "Welcome to dealwise!", welcomeEmailHTML(name || email.split("@")[0])).catch(() => {});

          return { id: newUser.id, name: newUser.name, email: newUser.email }
        }

        // Login
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (!user || !bcrypt.compareSync(password, user.password)) {
          throw new Error("Invalid email or password.")
        }
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
