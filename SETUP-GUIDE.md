# DEALWISE — External Services Setup Guide

## Do these steps, then tell me. I'll wire everything up.

---

## 1. DATABASE — Supabase (Free)

1. Go to https://supabase.com → Sign up / Sign in
2. Click "New Project"
3. Name: `dealwise`
4. Set a database password (SAVE IT)
5. Region: choose closest to you
6. Wait for project to create (~2 min)
7. Go to Settings → Database → Connection string → URI
8. Copy the connection string — looks like:
   ```
   postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
9. Give me this connection string

---

## 2. GOOGLE OAUTH (Free)

1. Go to https://console.cloud.google.com
2. Create a new project (or use existing)
3. Go to APIs & Services → OAuth consent screen
4. Choose "External" → Create
5. Fill in: App name = "dealwise", User support email = yours
6. Save and continue through all steps
7. Go to APIs & Services → Credentials
8. Click "Create Credentials" → "OAuth client ID"
9. Application type: "Web application"
10. Name: "dealwise"
11. Authorized redirect URIs: Add these TWO:
    - `http://localhost:3000/api/auth/callback/google`
    - `https://your-domain.com/api/auth/callback/google` (add later when you have a domain)
12. Click Create
13. Copy the **Client ID** and **Client Secret**

---

## 3. VERCEL DEPLOYMENT (Free)

1. Go to https://vercel.com → Sign up with GitHub
2. Push dealwise code to a GitHub repo
3. Import the repo in Vercel
4. Add environment variables in Vercel dashboard:
   - `DATABASE_URL` = your Supabase connection string
   - `OPENAI_API_KEY` = your OpenAI key
   - `NEXTAUTH_SECRET` = (I'll generate one)
   - `NEXTAUTH_URL` = https://your-vercel-domain.vercel.app
   - `GOOGLE_CLIENT_ID` = from step 2
   - `GOOGLE_CLIENT_SECRET` = from step 2
5. Deploy

---

## 4. DOMAIN (Optional, ~$10/year)

1. Buy a domain on Namecheap, Google Domains, or Cloudflare
2. Point it to Vercel (they guide you through this)
3. Update `NEXTAUTH_URL` to your domain
4. Add domain to Google OAuth redirect URIs

---

## What to give me:

Once you've done steps 1-2, paste me:
- [ ] Supabase connection string
- [ ] Google Client ID
- [ ] Google Client Secret

I'll then:
- Switch from SQLite to Postgres
- Enable Google OAuth
- Fix all production readiness issues
- Get it deployment-ready

---

## Current .env.local should look like:

```env
OPENAI_API_KEY=sk-proj-your-key
NEXTAUTH_SECRET=kJ7mP9xQ2vR5tY8wA3dF6gH1jK4nB0cE7iL2oM5pS8u
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres...your-supabase-url
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-secret
```
