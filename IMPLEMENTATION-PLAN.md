# DEALWISE — Complete Implementation Plan

## Rules
- Nothing is "done" until tested
- Each item has: description, files to change, test method, status
- Status: TODO | IN PROGRESS | DONE | TESTED

---

## P0 — Security & Critical (Must fix before ANY deployment)

| # | Task | Files | How to test | Status |
|---|------|-------|-------------|--------|
| 1 | Replace SHA-256 with bcrypt for passwords | `auth.ts` | Sign up, sign in, verify hash in users.json is bcrypt format | TODO |
| 2 | Generate real NEXTAUTH_SECRET | `.env.local` | `openssl rand -base64 32`, paste in env | TODO |
| 3 | Switch from JSON files to SQLite database | `lib/credits.ts`, `auth.ts`, new `lib/db.ts`, `package.json` (add better-sqlite3) | Sign up, analyze, check data persists in .db file | TODO |
| 4 | Remove fake stats from landing page | `app/page.tsx` | Visual check — no "10,000+" or "$2.4M" | TODO |
| 5 | Fix OG image (real PNG, not SVG renamed) | `public/og-image.png`, `app/layout.tsx` | Share URL on Twitter/LinkedIn preview tool | TODO |
| 6 | Sanitize dangerouslySetInnerHTML in chat | `app/chat/page.tsx` | Send `<script>alert(1)</script>` in chat, verify no XSS | TODO |

## P1 — Code Quality & UX (Should fix before launch)

| # | Task | Files | How to test | Status |
|---|------|-------|-------------|--------|
| 7 | Split analyze page into components | `app/analyze/page.tsx` → `components/analyze/` (UploadForm, Results, ScoreDisplay, RedFlagList, etc.) | Build passes, all analyze features still work | TODO |
| 8 | Eliminate duplicated constants | All pages importing CURRENCIES/getScoreColor → use `lib/constants.ts` | `grep -r "CURRENCIES" app/` shows only `lib/constants.ts` | TODO |
| 9 | Server-side history storage (in SQLite) | `lib/db.ts`, `app/api/history/route.ts`, update analyze page | Analyze → history shows on different browser | TODO |
| 10 | Remove theme toggle from settings (light only) | `app/settings/page.tsx`, delete `components/ThemeProvider.tsx` | Settings page has no theme option | TODO |
| 11 | Streaming chat responses | `app/api/chat/route.ts`, `app/chat/page.tsx` | Chat shows words appearing one by one | TODO |
| 12 | Admin settings integration (read limits from DB) | `app/api/analyze/route.ts`, `lib/admin-settings.ts` | Change limit in admin → analyze respects new limit | TODO |
| 13 | GET handler on analyze route returns JSON | `app/api/analyze/route.ts` | `curl http://localhost:3000/api/analyze` returns JSON error | TODO |

## P2 — Competitive Features

| # | Task | Files | How to test | Status |
|---|------|-------|-------------|--------|
| 14 | OCR for scanned PDFs | `app/api/parse-pdf/route.ts`, add tesseract.js | Upload a scanned PDF → text extracted | TODO |
| 15 | Clause-level inline highlighting | `app/analyze/page.tsx` components | Red flag clauses highlighted in original text | TODO |
| 16 | Stripe integration for pro plans | `lib/stripe.ts`, `app/api/stripe/route.ts`, `app/pricing/page.tsx` | Buy credits → Stripe checkout → credits added | TODO |
| 17 | Email verification + forgot password | `auth.ts`, `app/auth/verify/page.tsx`, `app/auth/reset/page.tsx` | Sign up → verify email → login | TODO |
| 18 | Error monitoring (Sentry) | `next.config.ts`, `app/layout.tsx` | Trigger error → appears in Sentry dashboard | TODO |
| 19 | DOCX export of analysis report | `lib/export-docx.ts`, analyze page | Click export → .docx downloads with results | TODO |
| 20 | Pagination on dashboard + admin | `app/dashboard/page.tsx`, `app/admin/page.tsx` | 100+ entries → paginated correctly | TODO |

## P3 — Nice to Have

| # | Task | Files | How to test | Status |
|---|------|-------|-------------|--------|
| 21 | Contract version tracking | `lib/db.ts`, `app/versions/page.tsx` | Upload v1, upload v2 → see diff | TODO |
| 22 | Team/collaboration features | `lib/teams.ts`, `app/team/page.tsx` | Create team, invite member, share analysis | TODO |
| 23 | Slack/webhook integrations | `lib/webhooks.ts`, admin settings | Analyze → webhook fires to Slack | TODO |
| 24 | Multi-language support | `lib/i18n.ts`, all pages | Switch to Hindi → UI in Hindi | TODO |
| 25 | Onboarding tour for new users | `components/OnboardingTour.tsx` | New user → guided tour shows | TODO |
| 26 | Email notifications | `lib/email.ts`, `app/api/email/route.ts` | Sign up → welcome email received | TODO |
| 27 | Upload progress bar | `app/analyze/page.tsx` upload section | Upload large PDF → progress bar shows | TODO |
| 28 | CSV/Excel export for bulk | `app/bulk/page.tsx` | Bulk analyze → export CSV downloads | TODO |
| 29 | Compare supports file upload + history | `app/compare/page.tsx` | Upload PDF in compare → works | TODO |

---

## Implementation Order

**Phase 1 (P0 — do first):** Items 1-6
**Phase 2 (P1 — do next):** Items 7-13
**Phase 3 (P2 — then these):** Items 14-20
**Phase 4 (P3 — last):** Items 21-29

Each phase: implement → test → mark DONE → move to next.
