# DEALWISE -- UX Perfection Plan

> Generated from competitor analysis (ContractCrab, ClauseGuard, BeforeYouSign) and 2025-2026 SaaS onboarding best practices research.

---

## Research Findings

### ContractCrab (contractcrab.com)
- **Without login:** Hero landing page has a drag-and-drop upload zone front and center. Users can upload a PDF/DOCX/TXT and get a one-page summary with improvement count -- no signup required.
- **Login gate:** After preview, clicking "See result" triggers an auth redirect. Full analysis, downloads, and archive are behind auth.
- **Key pattern:** Value-first. Show the user _proof_ the tool works before asking for commitment. Upload -> preview result -> gate the full report.
- **Pricing:** Pay-as-you-go ($3/contract), Light ($30/mo), Pro ($75/mo), Enterprise.
- **Post-analysis:** Dashboard with searchable archive, download modified contracts, clause-by-clause detail view.

### ClauseGuard (clauseguard.io)
- **Without login:** Full marketing site with animated demo carousel (upload -> processing spinner -> results). "3 free analyses, no credit card." Trust bar with stats, features grid, why-not-ChatGPT comparison, example flagged clauses.
- **Login gate:** All actual analysis lives at `/app` behind auth. Login/signup with social auth.
- **Key pattern:** Free-tier generosity. Three free analyses removes friction. Animated demo on landing page shows what results look like before you ever sign up.
- **Results include:** Risk score (0-100), flagged clauses with section references, plain-English explanations, negotiation counter-language (Pro+), analysis history.
- **Retention trick:** Exit-intent popup offers "5 Contract Red Flags" checklist via email capture.

### BeforeYouSign (beforeyou-sign.com)
- **Without login:** The entire service works without any account. "Pay, upload, get results. No sign-up, no login, no data trail."
- **Key pattern:** Zero-friction, pay-per-use. No auth at all. Privacy-first ("document analyzed in real-time and immediately discarded").
- **Pricing:** Quick Scan ($9.99) and Full Analysis ($29.99) -- one-time payments per contract.
- **Speed:** Everything completes within 60 seconds.
- **Results:** Risk score, clause identification, negotiation playbook, suggested revisions, PDF download.

### Key Takeaways Across Competitors
1. **Every competitor lets you upload and see SOMETHING without logging in.** ContractCrab shows a preview. ClauseGuard gives 3 free analyses. BeforeYouSign has no auth at all.
2. **The upload zone is the hero.** Not a "learn more" button -- an actual functional interface.
3. **Results are structured as: Score -> Summary -> Red Flags -> Details -> Next Steps.**
4. **Auth gates are placed AFTER value is demonstrated**, not before.
5. **All competitors show processing state** with step-by-step progress (extracting clauses -> identifying risks -> calculating score).

### 2025-2026 SaaS Onboarding Best Practices
- **Value-first:** Let users experience value before asking for commitment (Figma pattern).
- **Action-first design:** Get users creating real artifacts within 60 seconds.
- **Smart empty states:** Use blank screens as onboarding surfaces, not error messages.
- **Zero-friction signup:** Single-click social auth, progressive profiling.
- **Everboarding:** Reveal features progressively as user demonstrates readiness.
- **Micro-celebrations:** Animated checkmarks, progress notifications at milestones.
- **Time-to-value < 60 seconds** is the gold standard.

---

## Current Problems

### P1: No Route Protection At All
- **No middleware.ts exists.** Every page is accessible to every user, logged in or not.
- Dashboard, Chat, Compare, Bulk, Templates, Settings, API Docs -- all wide open.
- Logged-out users can navigate to `/dashboard` and see an empty page with no guidance.
- Logged-out users on `/chat` see "No contract history yet" with no prompt to sign in.
- No distinction between public and private routes anywhere in the codebase.

### P2: Landing Page Redirects Authenticated Users Away
- `app/page.tsx` line 99: `if (status === "authenticated") router.replace("/dashboard")`. This means authenticated users can NEVER see the landing page. If they want to share it or revisit pricing, they are bounced.
- Shows a loading spinner while checking auth status -- flicker on every visit.

### P3: Nav Shows Everything to Everyone
- `components/Nav.tsx` shows all links (Analyze, Dashboard, Chat, Templates, Compare, API) regardless of auth status.
- Logged-out users clicking "Dashboard" land on an empty, confusing page.
- No active page indicator -- users cannot tell which page they are on.
- Mobile nav shows Settings link even when not logged in.

### P4: No Auth Gate on Protected Pages
- No page checks `useSession()` and redirects or shows an auth prompt.
- Dashboard, Chat, Compare, Bulk, Settings, Templates, API Docs -- none verify auth.
- Users who navigate directly to these URLs get a broken or empty experience.

### P5: Analyze Page Has No Auth Flow for Saving
- Analysis works without login (good), but results are only saved to localStorage.
- No prompt to sign up/in after getting results to save them permanently.
- History is in localStorage, which means it is lost on clearing browser data or switching devices.

### P6: Poor Loading States
- Global `loading.tsx` is a bare spinner with "Loading..." text.
- No skeleton screens. No contextual loading messages.
- Analyze page shows a spinner during analysis, but no step-by-step progress (unlike competitors).

### P7: No Toast/Notification System
- No success feedback after actions (analysis complete, settings saved, history deleted).
- `settings/page.tsx` uses `window.alert()` for "Analysis history cleared" -- very jarring.
- `window.confirm()` for destructive actions -- no styled confirmation dialog.

### P8: Empty States Are Weak
- Dashboard empty state: icon + "No analyses yet" + link. No onboarding guidance.
- Chat empty state: Suggested questions are good, but no contract-selection guidance for first-time users.
- Compare page: No way to load contracts from history -- must re-paste.

### P9: Google Sign-In Callback URL is Hardcoded
- `AuthModal.tsx` line 66: `signIn('google', { callbackUrl: '/analyze' })`. After Google sign-in, user always lands on `/analyze` regardless of where they came from. Should redirect back to the page they were on.

### P10: No Breadcrumbs or Context
- "Back to Home" links on every internal page, but authenticated users' "home" should be Dashboard, not landing page.
- Dashboard has "Back to Home" pointing to `/` which redirects to `/dashboard` -- circular.

### P11: Mobile UX Gaps
- Mobile nav shows ALL links (8 items + auth) in a long list with no grouping.
- No bottom navigation for mobile -- common pattern for app-like SaaS.
- Logged-out mobile users see Settings link that leads to a useless page.

### P12: Analyze Page UX Issues
- PDF upload, paste, and rate fields are all on one long page -- could be a stepper.
- No auto-detection of currency/rate from contract text.
- After analysis, the result replaces the form -- user cannot easily tweak and re-analyze.
- Share button generates a URL with base64 data in query params -- can be extremely long.

---

## Fix Plan

### 1. AUTH & ROUTE PROTECTION

#### Pages Classification

| Route | Auth Required | Behavior |
|-------|--------------|----------|
| `/` (Landing) | PUBLIC | Show to everyone. Do NOT redirect authenticated users away. Show different CTA (e.g., "Go to Dashboard" vs "Analyze Free"). |
| `/privacy` | PUBLIC | Static page, no auth needed. |
| `/terms` | PUBLIC | Static page, no auth needed. |
| `/auth/signin` | PUBLIC | Sign-in page. Redirect to `/dashboard` if already authenticated. |
| `/analyze` | SEMI-PROTECTED | Allow first analysis without login. After analysis completes, prompt to sign in to save results. Gate re-analysis or bulk features behind auth. |
| `/report` | PUBLIC | Shared report page, must remain public for sharing. |
| `/dashboard` | PROTECTED | Redirect to `/auth/signin?callbackUrl=/dashboard` if not authenticated. |
| `/chat` | PROTECTED | Redirect to `/auth/signin?callbackUrl=/chat` if not authenticated. |
| `/templates` | PROTECTED | Redirect to `/auth/signin?callbackUrl=/templates` if not authenticated. |
| `/compare` | PROTECTED | Redirect to `/auth/signin?callbackUrl=/compare` if not authenticated. |
| `/bulk` | PROTECTED | Redirect to `/auth/signin?callbackUrl=/bulk` if not authenticated. |
| `/settings` | PROTECTED | Redirect to `/auth/signin?callbackUrl=/settings` if not authenticated. |
| `/api-docs` | PUBLIC | Reference docs should be publicly accessible. |

#### Implementation: Create `middleware.ts` at Project Root

```typescript
// middleware.ts
import { auth } from "@/auth"
import { NextResponse } from "next/server"

const PROTECTED_ROUTES = [
  "/dashboard",
  "/chat",
  "/templates",
  "/compare",
  "/bulk",
  "/settings",
]

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  if (isProtected && !req.auth) {
    const signInUrl = new URL("/auth/signin", req.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
```

#### After-Login Redirect
- Default redirect after login: `/dashboard`
- If user was trying to access a protected route, redirect back to that route via `callbackUrl` param.
- Already partially implemented in `auth.ts` callbacks but needs the middleware to set `callbackUrl`.

#### Auth Modal Enhancement
- Fix Google callbackUrl: Instead of hardcoding `/analyze`, pass `window.location.pathname` as callbackUrl.
- Add a `reason` prop to AuthModal: display contextual messages like "Sign in to save your analysis" vs "Sign in to access Chat".

---

### 2. NAVIGATION UX

#### Logged-OUT Nav Links
```
[Logo DEALWISE]   Analyze   Pricing   API Docs     [Sign In] [Analyze Free (CTA)]
```
- Show only: Analyze, Pricing (anchor to `/#pricing`), API Docs
- Right side: "Sign In" text button + "Analyze Free" gradient pill button
- Hide: Dashboard, Chat, Templates, Compare, Settings

#### Logged-IN Nav Links
```
[Logo DEALWISE]   Analyze   Dashboard   Chat   Compare   Templates   Bulk     [User avatar] [Settings gear] [Sign Out]
```
- Show all feature pages
- Hide: Pricing (they're already a user)
- Replace "Sign In" / "Analyze Free" with user avatar + settings + sign out
- Add: Bulk link (currently missing from nav)

#### Active Page Indicator
- Add `usePathname()` from `next/navigation`
- Apply active styles: `text-indigo-600 font-semibold` + bottom border accent on the active link
- Implementation:
```typescript
const pathname = usePathname()
const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')
// In link className:
className={`text-sm font-medium transition-colors ${
  isActive(href)
    ? 'text-indigo-600'
    : 'text-[#4B5563] hover:text-[#111827]'
}`}
```

#### Mobile Nav
- Group links into sections:
  - **Analyze** section: Analyze, Compare, Bulk
  - **Manage** section: Dashboard, Chat, Templates
  - **Account** section: Settings, Sign Out
- Add visual separators (thin divider lines) between groups
- Consider a bottom tab bar for mobile with 4 key actions: Analyze, Dashboard, Chat, More (dropdown)

#### Logo Behavior
- Logged out: Logo links to `/`
- Logged in: Logo links to `/dashboard`

---

### 3. ANALYZE PAGE UX

#### Upload Flow Improvements
1. **Drag-and-drop zone should be more prominent** -- make it the visual hero of the page, similar to ContractCrab's landing hero upload zone.
2. **Auto-detect from contract:** After paste or upload, attempt to extract:
   - Currency (look for $, EUR, GBP symbols in text)
   - Quoted price (look for numbers near "payment", "fee", "price")
   - Estimated hours (look for timeline mentions)
   - Pre-fill fields when detected, with an "Auto-detected" badge users can override
3. **Sticky analyze button:** On long contracts, the "Analyze" button should be sticky at the bottom of the viewport so users do not have to scroll down.
4. **Character/word count:** Show a live word count below the paste area so users know their contract was pasted correctly.

#### Loading State (During Analysis)
Replace the current spinner with a step-by-step progress indicator (like ClauseGuard):
```
Step 1: Parsing contract text...        [done checkmark]
Step 2: Identifying clauses...          [done checkmark]
Step 3: Detecting red flags...          [spinning]
Step 4: Calculating effective rate...   [pending]
Step 5: Generating recommendations...   [pending]
```
- Use a vertical stepper with animated transitions
- Show estimated time remaining ("~15 seconds")
- Add a subtle pulsing animation on the current step

#### Results Display Hierarchy
Present results in this order (matching competitor patterns):
1. **Score Circle** (large, animated, color-coded) + Recommendation badge
2. **Rate Comparison Card** (Quoted Rate -> Effective Rate with reduction percentage)
3. **Summary** (2-3 sentence plain-English overview)
4. **Red Flags** (expandable cards, sorted by severity)
5. **Missing Clauses** (expandable cards)
6. **Green Flags** (collapsed by default -- positive reinforcement)
7. **Counter-Proposal Language** (copy-to-clipboard sections)
8. **AI Deep Insights** (if enabled in settings)

#### After Analysis Actions
- **Save to Dashboard** -- prominent button. If not logged in, show auth modal with message "Sign in to save this analysis to your dashboard."
- **Export PDF** -- keep current functionality
- **Share Link** -- keep but shorten the URL (use a hash or ID instead of full base64)
- **Compare with Another** -- button that navigates to `/compare` with this contract pre-filled as Contract A
- **Ask AI About This** -- button that navigates to `/chat` with this contract loaded as context
- **Analyze Another** -- reset form but keep rate/scope fields filled (common for users analyzing multiple contracts for the same project)

#### Post-Analysis Sign-Up Prompt (for Unauthenticated Users)
After showing results, display a non-intrusive banner:
```
+--------------------------------------------------------------+
|  Want to save this analysis and track your contracts?         |
|  [Create Free Account]  or  [Sign In]                         |
|  Your analysis will be saved to your dashboard automatically. |
+--------------------------------------------------------------+
```
- Dismissible (X button)
- Does NOT block results -- results are always fully visible
- Uses localStorage flag `dealwise_signup_dismissed` to not show again for 7 days if dismissed

---

### 4. DASHBOARD UX

#### Empty State (First-Time User Onboarding)
Replace the current minimal empty state with a rich onboarding surface:
```
+------------------------------------------------------------------+
|                                                                    |
|   [Sparkles icon]                                                  |
|                                                                    |
|   Welcome to DEALWISE!                                             |
|   Let's analyze your first contract.                               |
|                                                                    |
|   1. [Analyze a Contract]    -- Your first analysis (2 min)        |
|   2. [Browse Templates]     -- See freelancer-friendly contracts   |
|   3. [Ask the AI]           -- Get answers about contract terms    |
|                                                                    |
|   Or drag a PDF here to get started instantly.                     |
|                                                                    |
+------------------------------------------------------------------+
```
- Checklist-style onboarding with auto-detection of completed steps
- Once user completes first analysis, step 1 gets a green checkmark
- Checklist is dismissible and does not reappear once dismissed

#### History Display Improvements
- Add **filter chips**: All | Good Deals | Needs Work | Risky | Walk Away
- Add **sort options**: Newest First (default) | Score High->Low | Score Low->High
- Add **date range filter**: Last 7 days | Last 30 days | All time
- Make table rows clickable (entire row) to view the analysis
- Add **bulk actions**: Select multiple -> Delete | Export
- On mobile: Switch from table to card layout

#### Stats Cards Enhancement
- Make stat cards clickable:
  - "Total Contracts" -> scrolls to history table
  - "Average Score" -> shows trend chart (if 3+ analyses)
  - "Est. Rate Impact" -> shows breakdown tooltip
- Add sparkline mini-charts inside stat cards showing trend over last 5 analyses

---

### 5. CHAT UX

#### Starting a Conversation
- If user has no history: Show a welcoming empty state with general suggested questions AND a prominent "Analyze a contract first" CTA
- If user has history: Auto-suggest loading their most recent contract
- Add a "New Chat" button in the header to clear conversation and start fresh

#### Contract Context Loading
- Add a dropdown/search at the top of chat: "Chatting about: [Select a contract v]"
- Allow switching contracts mid-conversation (with a confirmation: "Start new chat with different contract?")
- Show a small context indicator: "Discussing: Website Redesign Contract (Score: 45/100)"
- Allow pasting a new contract directly into chat (detect if message is a long text and offer "Analyze this as a new contract?")

#### Suggested Questions (Context-Aware)
When a contract is loaded, generate suggestions based on its actual issues:
- "What does the unlimited revisions clause mean for me?"
- "How can I negotiate the Net-60 payment terms?"
- "Is the IP clause fair?"
Instead of generic questions. Use the contract's red flags to generate these.

#### Message UX
- Add copy button on AI messages (copy the full response)
- Add a "Regenerate" button on the last AI response
- Support markdown rendering in AI responses (headers, bold, lists, code blocks)
- Add timestamps on messages (relative: "2 min ago")

---

### 6. COMPARE UX

#### Load Contracts from History
- Add "Load from History" button next to each textarea
- Opens a small modal/dropdown showing past analyses
- Click to auto-fill the contract text from history
- Pre-fill deal details (scope, price, hours) from the loaded contract

#### Side-by-Side Display Improvements
- Add a "Swap A/B" button to switch contracts
- Highlight the winning metric in each row with a green background
- Add a "View Full Analysis" link for each contract that opens in a new tab
- Add an exportable comparison report (PDF or text)

#### Quick Compare from Dashboard
- Add a "Compare" button on each history entry
- Clicking it navigates to `/compare` with that contract pre-loaded as Contract A
- Show "Select Contract B to compare" prompt

---

### 7. TEMPLATES UX

#### Template Preview
- Add a "Preview" button that expands the template inline (already partially implemented)
- Show a visual quality badge: "Freelancer-Approved" or "Industry Standard"
- Add a "What makes this template good?" collapsible section explaining the protective clauses included
- Show a mock score: "Typical DealWise Score: 82/100" to demonstrate quality

#### Customize and Use
- Add "Use This Template" button that:
  1. Copies template to clipboard
  2. Shows toast: "Template copied! Paste it into your contract editor."
- Add "Analyze This Template" button that pre-fills the analyze page with the template text
- Allow users to create custom templates from their best-scoring analyzed contracts
- Add search/filter by category (already implemented -- enhance with keyword search within template content)

---

### 8. GENERAL UX

#### Loading States
Create a `Skeleton` component for consistent loading:
```typescript
// components/ui/Skeleton.tsx
function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
  )
}
```
Use contextual skeleton screens instead of spinners:
- Dashboard: Show skeleton stat cards + skeleton table rows
- Chat: Show skeleton sidebar + empty chat area
- Templates: Show skeleton template cards

#### Error Handling
- Replace `window.alert()` and `window.confirm()` with styled modal dialogs
- Add an error boundary with a helpful message + "Report Bug" link
- API errors should show specific, actionable messages:
  - "API key invalid" -> "Check your API key in Settings"
  - "Rate limit exceeded" -> "You've reached the limit. Try again in X minutes."
  - "Contract too long" -> "Your contract exceeds 50,000 characters. Try splitting it."

#### Success Feedback (Toast System)
Implement a toast notification system:
```typescript
// lib/toast.ts or use a library like sonner/react-hot-toast
// Suggested: `sonner` -- lightweight, beautiful, works with Next.js

// Usage:
toast.success("Analysis saved to dashboard!")
toast.error("Failed to export PDF")
toast.info("Tip: You can drag and drop PDF files")
```

Places to add toasts:
- Analysis complete: "Analysis complete! Score: 67/100"
- PDF exported: "PDF downloaded successfully"
- Settings saved: "Settings saved" (replace current inline "Saved" text)
- History cleared: "Analysis history cleared" (replace `window.alert`)
- Template copied: "Template copied to clipboard"
- Share link copied: "Share link copied to clipboard"
- Sign in successful: "Welcome back, [name]!"
- Sign up successful: "Account created! Welcome to DealWise."

#### Empty States
Every page should have a purposeful empty state:

| Page | Empty State Content |
|------|-------------------|
| Dashboard | Onboarding checklist (see section 4) |
| Chat (no history) | "Analyze a contract first, then come back to chat about it" + link to `/analyze` |
| Chat (has history, no selection) | Suggested questions + "Select a contract from the sidebar" |
| Compare | "Analyze at least 2 contracts to compare them" + link to `/analyze` |
| Templates (filtered, no match) | "No templates match your filter. Try a different category." |
| Bulk (no files) | Drag-drop zone with helpful text |

#### Mobile Experience
- **Responsive tables:** Switch to card layout on screens < 768px
- **Touch targets:** Ensure all buttons are at least 44x44px
- **Swipe gestures:** On chat page, swipe right to open sidebar, swipe left to close
- **Bottom sheet:** On mobile, use bottom sheets instead of modals for auth and confirmations
- **Sticky header:** Nav should be sticky (already is) with scroll-up-to-show pattern on mobile to maximize screen space
- **PDF upload:** Ensure file picker works well on mobile (camera capture for photos of contracts)

#### Keyboard Shortcuts
Add keyboard shortcuts for power users:
- `Cmd/Ctrl + K`: Open quick navigation / search
- `Cmd/Ctrl + N`: New analysis
- `Cmd/Ctrl + Enter`: Submit analysis (when in analyze page)
- `Esc`: Close modals

#### Accessibility
- Ensure all interactive elements have `aria-label` or visible labels
- Add `aria-live="polite"` to toast container for screen reader announcements
- Ensure color is not the only indicator (use icons alongside color-coded scores)
- Add `role="alert"` to error messages
- Tab order should follow visual order on all pages

---

## Implementation Priority

### Phase 1: Critical (Do First)
1. Create `middleware.ts` for route protection
2. Fix Nav to show different links based on auth status
3. Add active page indicator to Nav
4. Fix landing page to not redirect authenticated users
5. Fix Google sign-in callbackUrl

### Phase 2: High Impact (Next Sprint)
6. Add post-analysis sign-up prompt on analyze page
7. Improve dashboard empty state with onboarding
8. Install toast library (sonner) and replace alerts/confirms
9. Add "Load from History" to compare page
10. Add skeleton loading states to dashboard and chat

### Phase 3: Polish (Following Sprint)
11. Improve analyze page loading state (step-by-step progress)
12. Add keyboard shortcuts
13. Improve mobile nav (grouped links, bottom tab bar)
14. Context-aware chat suggestions
15. Template quality badges and "Analyze This" button

### Phase 4: Delight (Ongoing)
16. Auto-detect currency/rate from contract text
17. Sparkline charts in dashboard stat cards
18. Swipe gestures on mobile
19. Quick navigation (Cmd+K)
20. Custom templates from high-scoring analyses

---

## Technical Notes

### State Management for Auth-Gated UX
- Use `useSession()` from next-auth/react for client-side auth checks
- Use `auth()` from `@/auth` for server-side checks in middleware
- Store "first analysis" flag in localStorage: `dealwise_first_analysis_done`
- Track dismissed prompts: `dealwise_signup_prompt_dismissed` with timestamp

### Migration Path for History
- Current: localStorage only (`dealwise_history`)
- Future: Sync localStorage history to server after sign-in
- On sign-in, check localStorage for existing history entries and offer to import them to the user's server-side account

### File Structure for New Components
```
components/
  ui/
    Skeleton.tsx        (new)
    Toast.tsx           (new - or use sonner)
    ConfirmDialog.tsx   (new - replace window.confirm)
    BottomSheet.tsx     (new - mobile modals)
  Nav.tsx               (modify - auth-aware links, active indicator)
  AuthModal.tsx         (modify - contextual messages, fix callbackUrl)
  AuthProvider.tsx      (no changes)
  HistoryPanel.tsx      (no changes)
middleware.ts           (new - at project root)
```

---

## Sources
- [SaaS Onboarding Flows That Convert in 2026 - SaaSUI](https://www.saasui.design/blog/saas-onboarding-flows-that-actually-convert-2026)
- [SaaS Onboarding Best Practices 2026 - Design Revision](https://designrevision.com/blog/saas-onboarding-best-practices)
- [Next.js Middleware Protected Routes - Medium](https://medium.com/@turingvang/nextjs-middleware-protected-routes-bcb3df06db0c)
- [Securing Pages and API Routes - NextAuth.js](https://next-auth.js.org/tutorials/securing-pages-and-api-routes)
- [How to Secure Routes in Next.js - freeCodeCamp](https://www.freecodecamp.org/news/secure-routes-in-next-js/)
- [Freemium to Premium Strategies - Userpilot](https://userpilot.com/blog/freemium-to-premium/)
- [SaaS Freemium Conversion Rates 2026 - First Page Sage](https://firstpagesage.com/seo-blog/saas-freemium-conversion-rates/)
- [We Analyzed 36 SaaS Onboarding Flows - UserGuiding](https://userguiding.com/blog/saas-onboarding-ux-analysis)
