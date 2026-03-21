# DEALWISE UI REDESIGN SPEC
### Comprehensive Visual Overhaul Based on 2025-2026 Premium SaaS Standards

---

## SECTION 1: What Premium SaaS UIs Do That We Don't

After studying Linear, ContractCrab, Vercel, Stripe, shadcn/ui, and 50+ top-performing SaaS sites from 2025-2026, here is every visual pattern that separates premium from amateur:

### 1.1 Typography Hierarchy is Weak
- **Premium apps** use dramatic size contrast between heading levels. Linear's hero is 72px+ with -0.04em letter-spacing. ContractCrab uses 42px headings with Cabin (geometric) for headings and Inter for body -- a deliberate dual-font strategy.
- **We use** a single font (Inter) with timid size differences. Our hero is `text-4xl` to `text-7xl` which is fine on paper but the `tracking-tight` and weight choices don't create enough visual drama. Our body text at `text-sm` (14px) everywhere creates monotony.

### 1.2 Color Palette Lacks Depth
- **Premium apps** use 3-4 accent colors strategically: a primary brand, a secondary accent, a success/positive color, and semantic status colors. ContractCrab uses neon green `#C7FF6C` for CTAs against navy `#003A4E` -- extreme contrast that demands attention.
- **We use** indigo-to-purple gradient everywhere. It appears on: nav CTA, hero CTA, final CTA, auth modal, comparison button, chat send button, pricing card stripe, comparison table header, every single action button. This creates gradient fatigue. The purple-indigo gradient has become the "default" and no longer feels special.

### 1.3 Shadows Are Too Subtle
- **Premium apps** use layered shadows with color tinting. Stripe uses `0 2px 4px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08)` -- double-layer shadows that create real depth. ContractCrab uses `0 24px 64px rgba(0,0,0,0.35)` for modals.
- **We use** `shadow-sm` on most cards which is barely visible (`0 1px 2px rgba(0,0,0,0.05)`). Cards look flat and undifferentiated from background.

### 1.4 Micro-Interactions Are Missing
- **Premium apps** have: button press states (scale-down), hover glow effects on CTAs, staggered entrance animations on card grids, skeleton loading screens, shimmer effects during loading, progress animations with personality.
- **We have** basic `hover:shadow-md` and `hover:-translate-y-0.5` on cards. Our loading state is a single spinner. No skeleton screens. No button press feedback. No hover glow.

### 1.5 Spacing is Inconsistent
- **Premium apps** use a strict 4px/8px grid. Every gap, padding, and margin is a multiple of 4 or 8. Section padding is consistently 80-120px vertical.
- **We use** inconsistent spacing: sections alternate between `py-20` (80px) and `py-28` (112px) without clear logic. Card padding varies between `p-4`, `p-6`, `p-8` without semantic meaning.

### 1.6 Empty States Are Afterthoughts
- **Premium apps** treat empty states as onboarding opportunities with illustrations, helpful copy, and clear CTAs. Linear shows a beautifully designed empty state with keyboard shortcut hints.
- **Our** dashboard empty state is a centered icon + text + button. Functional but not delightful.

### 1.7 Backgrounds Lack Texture
- **Premium apps** use subtle noise textures, dot grids, gradient meshes, or very faint geometric patterns. Linear uses animated dot-grid backgrounds. Vercel uses subtle gradient orbs.
- **We use** flat solid colors (`#FAFBFE`, `#F3F4F8`) alternating between sections. This works but feels plain.

### 1.8 Cards Lack Visual Weight
- **Premium apps** give featured/important cards more visual weight through: colored left borders, gradient top stripes, subtle background gradients, icon-color-matched backgrounds.
- **Our cards** all look identical -- same border, same shadow, same radius. The only differentiation is content.

### 1.9 No Visual Feedback on Input Focus
- **Premium apps** show a visible glow, color change, or label animation on input focus. Stripe's inputs have a crisp blue border + subtle blue shadow on focus.
- **We have** `focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100` which is barely visible. The ring is too light.

### 1.10 No Brand Personality
- **Premium apps** have one or two distinctive visual signatures: ContractCrab's neon green buttons, Linear's gradient text, Vercel's triangle, Stripe's signature purple with diagonal stripes.
- **We use** generic indigo/purple that could be any SaaS app. No distinctive visual hook.

---

## SECTION 2: Page-by-Page Redesign Spec

---

### 2.1 LANDING PAGE (`app/page.tsx`)

#### Hero Section (lines 124-217)

**What's Wrong:**
- Headline is generic gradient text -- every SaaS does `bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`
- Subtitle at `text-lg` (18px) is too small for a hero, not enough contrast with body text below
- The "Animated stat card" ($14,000 loss) is good but looks like a regular card, not a hero element
- Trust line icons are `text-emerald-500` on `text-[#9CA3AF]` -- low contrast, easy to miss
- CTA button uses the same gradient as literally every other button -- no special treatment for THE primary action

**Exact Fixes:**

```
HERO HEADLINE:
- Change from text-4xl/5xl/6xl/7xl to text-5xl/6xl/7xl sm:text-8xl
- Add letter-spacing: -0.035em (tracking-[-0.035em])
- Font weight: 800 (font-extrabold is correct, keep)
- Change gradient from indigo-600/purple-600 to a more distinctive combo:
  from-[#4F46E5] via-[#7C3AED] to-[#EC4899]
  This adds a pink terminus that makes the gradient more memorable
- Add a subtle text-shadow for depth: style={{ textShadow: '0 4px 24px rgba(79,70,229,0.15)' }}

HERO SUBTITLE:
- Increase to text-xl (20px) leading-relaxed
- Change max-w-xl to max-w-2xl for better line breaks
- Color: text-[#6B7280] instead of text-[#4B5563] -- slightly lighter for better hierarchy

STAT CARD:
- Change from Card variant="elevated" to a custom treatment:
  className="mx-auto mt-10 w-fit rounded-2xl border border-red-200/50 bg-gradient-to-br from-red-50 to-rose-50 px-10 py-6 shadow-lg shadow-red-500/10"
- This makes it visually distinct as a WARNING element, not just a card

CTA BUTTON:
- Make the primary CTA LARGER and more distinctive:
  className="rounded-full bg-[#111827] text-white px-10 py-5 text-lg font-semibold shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.24)] hover:-translate-y-0.5 transition-all"
- WHY: Dark button on light background is more premium (Vercel, Linear, Notion all use this)
- The gradient CTA should be reserved for secondary/lower CTAs to maintain hierarchy

TRUST LINE:
- Increase icon size to h-4.5 w-4.5
- Change container: add a light pill background
  className="flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1"
- Text: text-[#4B5563] font-medium (darker, not muted)

HERO BACKGROUND:
- Add a subtle radial gradient orb:
  background: "radial-gradient(ellipse 60% 40% at 50% -10%, rgba(79,70,229,0.08), transparent), radial-gradient(ellipse 40% 30% at 80% 20%, rgba(236,72,153,0.04), transparent)"
- This creates subtle color depth without being distracting
```

#### The Problem Section (lines 222-295)

**What's Wrong:**
- Section background `bg-[#F3F4F8]` is too similar to `bg-[#FAFBFE]` -- sections don't feel different enough
- Cards in 4-column grid are too cramped on desktop -- not enough breathing room
- Impact text ("+40% more hours") at `text-sm` doesn't stand out enough

**Exact Fixes:**

```
SECTION BACKGROUND:
- Change to bg-white with a subtle top border:
  className="border-t border-[#E5E7EB] bg-white"
- This creates cleaner section breaks

CARDS:
- Add colored left border matching the icon color:
  className="flex h-full flex-col border-l-4 border-l-red-400 rounded-2xl ..."
- Increase card padding from p-6 to px-6 py-7
- Gap: change gap-6 to gap-5 (slightly tighter grid, but larger cards)

IMPACT TEXT:
- Make it a pill/badge instead of plain text:
  className="mt-4 inline-flex items-center rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-bold text-red-600"
```

#### How It Works Section (lines 300-358)

**What's Wrong:**
- Step circles are small (h-16 w-16 = 64px) and don't command enough attention
- Connecting gradient line is too thin (h-0.5 = 2px)
- Step numbers "01", "02", "03" look dated

**Exact Fixes:**

```
STEP CIRCLES:
- Increase to h-20 w-20 (80px)
- Add a subtle glow: shadow-lg shadow-indigo-500/10
- Background: bg-gradient-to-br from-indigo-50 to-white

CONNECTING LINE:
- Increase to h-1 (4px)
- Use dashed pattern: border-dashed
- Or replace with animated dots

STEP LABELS:
- Change from "Step 01" to just "1" in a small circle:
  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">1</span>
- This is cleaner and more modern
```

#### Features Grid Section (lines 363-425)

**What's Wrong:**
- Feature cards all have identical `bg-indigo-50` icon backgrounds -- monotonous
- 6 features in a 3-column grid is the right layout but cards lack visual interest

**Exact Fixes:**

```
ICON BACKGROUNDS:
- Give each feature a unique accent color matching its purpose:
  Red Flag Detection: bg-red-50, icon text-red-600
  Rate Calculator: bg-emerald-50, icon text-emerald-600
  Missing Clause: bg-amber-50, icon text-amber-600
  Counter-Proposal: bg-blue-50, icon text-blue-600
  Scope Creep: bg-purple-50, icon text-purple-600
  AI Deep Analysis: bg-indigo-50, icon text-indigo-600

CARD ENHANCEMENTS:
- Add a subtle gradient background on hover:
  hover:bg-gradient-to-br hover:from-white hover:to-indigo-50/30
```

#### Live Demo Preview Section (lines 430-536)

**What's Wrong:**
- The mock contract is plain mono text in a gray box -- not engaging
- Score circle is small (h-20 w-20) in the preview
- The preview doesn't feel like a real app screenshot

**Exact Fixes:**

```
MOCK CONTRACT:
- Add line numbers on the left side (like a code editor)
- Add a top bar with dots (like a terminal/editor window):
  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#E5E7EB]">
    <div className="h-3 w-3 rounded-full bg-red-400" />
    <div className="h-3 w-3 rounded-full bg-amber-400" />
    <div className="h-3 w-3 rounded-full bg-emerald-400" />
    <span className="ml-2 text-xs text-[#9CA3AF]">contract.pdf</span>
  </div>
- This makes it look like a real product screenshot

OVERALL PREVIEW CARD:
- Add a subtle perspective tilt on hover:
  className="... transition-transform hover:rotate-[0.5deg]"
- Add a stronger shadow:
  shadow-xl shadow-indigo-500/5
```

#### Comparison Table Section (lines 541-604)

**What's Wrong:**
- Table looks like a basic HTML table, not a polished comparison
- "DealWise" column header gradient is the same as everything else
- X icons for "Lawyer" column are too subtle

**Exact Fixes:**

```
TABLE DESIGN:
- Add rounded corners to the table container with overflow-hidden
- Add more padding: py-6 instead of py-5 on rows
- Make the "DealWise" column values bolder: text-base font-bold (not text-sm)

COLUMN STYLING:
- DealWise column: bg-indigo-50/30 (subtle tint on the whole column)
- Lawyer column: leave as-is

CHECKMARKS:
- Increase CheckCircle size to h-5 w-5
- Add a subtle animation: scale-in when visible
```

#### Testimonials Section (lines 609-689)

**What's Wrong:**
- Quote icon is too subtle (text-indigo-100)
- Star ratings take up space but don't add much since all are 5 stars
- Author section border-t feels like a cut

**Exact Fixes:**

```
QUOTE DESIGN:
- Make quote icon visible: text-indigo-200 h-8 w-8
- Add large decorative quote marks: use a ::before pseudo-element
  or increase the Quote icon size significantly

CARD ENHANCEMENT:
- Add a subtle top border accent:
  className="... border-t-2 border-t-indigo-100"

STARS:
- Keep but make smaller: h-3.5 w-3.5
- Move to same line as author name
```

#### Pricing Section (lines 694-810)

**What's Wrong:**
- Two pricing cards side-by-side when one is "Coming Soon" feels empty
- The disabled Pro card at `opacity-75` looks broken, not "coming soon"
- "$0/forever" is good copy but the card doesn't feel special enough

**Exact Fixes:**

```
FREE CARD:
- Make it wider: center it as a single card (max-w-lg) instead of side-by-side
- Add a "Most Popular" or "Current" banner:
  A diagonal ribbon or a top badge
- Add a subtle pulse animation on the border:
  animate-pulse on a pseudo-element border

PRO CARD:
- Move to a small teaser section BELOW the free card:
  "Want team features? Pro plan coming soon."
  with an email signup input
- This removes the awkward empty card

CHECKMARKS:
- Change from generic Check to CheckCircle for more visual weight
- Add slight stagger animation on each list item
```

#### Final CTA Section (lines 815-840)

**What's Wrong:**
- Background is the same gradient used everywhere (from-indigo-600 to-purple-600)
- Text is just white on gradient -- no visual texture
- CTA button is white on purple which is fine but doesn't pop enough

**Exact Fixes:**

```
BACKGROUND:
- Use bg-[#111827] (dark) instead of gradient
- Add a subtle grid/dot pattern overlay
- This creates a more premium, Vercel-style dark section

TEXT:
- Add subtle gradient text on the headline:
  bg-gradient-to-r from-white via-white to-indigo-200 bg-clip-text text-transparent

CTA BUTTON:
- Use the brand gradient for the button here (reverse the dark/light relationship):
  className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-10 py-5 text-lg font-semibold text-white shadow-[0_4px_30px_rgba(79,70,229,0.4)]"
```

#### Footer (lines 845-901)

**What's Wrong:**
- Footer is too simple -- just logo + links + copyright
- No visual interest, feels like an afterthought

**Exact Fixes:**

```
LAYOUT:
- Add a grid layout with columns:
  Column 1: Logo + tagline + social links
  Column 2: Product links (Analyze, Templates, Compare)
  Column 3: Resources links (API Docs, Privacy, Terms)
  Column 4: Company (Contact, Blog)

STYLING:
- Background: bg-[#111827] text-white
  (dark footer is more premium and creates a clear page-end signal)
- Link color: text-[#9CA3AF] hover:text-white
- Add a top gradient border:
  <div className="h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

BOTTOM BAR:
- Separate copyright into its own row with border-t border-[#1F2937]
- Add "Built with Next.js" tech badges as subtle gray pills
```

---

### 2.2 ANALYZE PAGE (`app/analyze/page.tsx`)

#### Upload Zone

**What's Wrong:**
- Upload zone is a basic textarea or drag-drop area
- Paste/File toggle is just two buttons
- No visual feedback during drag-over state
- File upload success state is plain text

**Exact Fixes:**

```
UPLOAD ZONE CONTAINER:
- Wrap in a visually distinctive zone:
  className="rounded-2xl border-2 border-dashed border-[#D1D5DB] bg-[#FAFBFE] p-8 text-center transition-all hover:border-indigo-300 hover:bg-indigo-50/30"
- During drag-over:
  className="border-indigo-500 bg-indigo-50 scale-[1.01]"
  Add a pulsing ring: ring-4 ring-indigo-100

PASTE/FILE TOGGLE:
- Use a proper segmented control (pill toggle):
  className="inline-flex rounded-xl bg-[#F3F4F8] p-1"
  Active button: className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#111827] shadow-sm"
  Inactive button: className="rounded-lg px-4 py-2 text-sm font-medium text-[#9CA3AF]"

FILE SUCCESS STATE:
- Show a card with file icon, name, page count, and a remove button:
  className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
  <FileText className="h-8 w-8 text-emerald-600" />
```

#### Form Layout

**What's Wrong:**
- Form fields are stacked vertically with no visual grouping
- Optional fields toggle (`showOptional`) is good but the transition is jarring
- "Sample contract" button looks like regular text

**Exact Fixes:**

```
FORM SECTIONS:
- Group related fields in cards:
  1. "Contract" card -- textarea + upload
  2. "Deal Details" card -- scope, price, hours, currency
  3. "Settings" (collapsible) -- API key, country

FIELD LAYOUT:
- Use 2-column grid for deal details: grid grid-cols-1 sm:grid-cols-2 gap-4
- Price and Hours side by side
- Currency as a small dropdown to the right of Price

SAMPLE BUTTON:
- Make it a visible outlined button:
  className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 transition-all hover:bg-indigo-100"
```

#### Results Display

**What's Wrong:**
- Tab bar for results (overview/red flags/missing/etc.) is basic
- Cards in results all look the same
- Score circle animation is good but needs more celebration for good scores

**Exact Fixes:**

```
TAB BAR:
- Use a sticky tab bar that stays visible while scrolling results:
  className="sticky top-16 z-40 flex gap-1 rounded-xl bg-white/80 backdrop-blur-xl border border-[#E5E7EB] p-1.5 shadow-sm"
  Active tab: className="rounded-lg bg-[#111827] px-4 py-2 text-sm font-semibold text-white"
  Inactive tab: className="rounded-lg px-4 py-2 text-sm font-medium text-[#4B5563] hover:bg-[#F3F4F8]"

RED FLAG CARDS:
- Left border colored by severity (already exists, good)
- Add severity icon: ShieldAlert for critical, AlertTriangle for high, Info for medium/low
- Counter-proposal language should be in a code-block style:
  className="rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] p-4 font-mono text-sm"

SCORE CELEBRATION:
- For scores >= 70: add confetti particles (use canvas-confetti library)
- For scores <= 30: add a subtle red pulse around the score circle
```

#### Red Flag Cards

**What's Wrong:**
- All red flag cards look identical except for left border color
- Counter-proposal text doesn't stand out from the description
- Severity badges are too small

**Exact Fixes:**

```
RED FLAG CARD LAYOUT:
- Header row: severity badge + issue title (side by side)
- Body: description text
- Footer: "Suggested fix:" in a distinct callout box
  className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 p-3"
  Label: "Counter-proposal" in text-emerald-700 font-semibold text-xs uppercase
  Text: text-sm text-emerald-800

SEVERITY BADGES:
- Make larger: px-3 py-1 text-xs (not text-[11px])
- Add icon: dot circle for critical (pulsing), triangle for high, circle for medium, info for low
```

---

### 2.3 DASHBOARD (`app/dashboard/page.tsx`)

#### Stat Cards (lines 176-219)

**What's Wrong:**
- All stat cards have the same visual weight
- Icon circles are small (h-10 w-10)
- Values at `text-2xl` don't command enough attention

**Exact Fixes:**

```
STAT CARD DESIGN:
- Increase value size to text-3xl font-bold
- Put label ABOVE value (not below)
- Icon: move to top-right corner as a subtle background element
  className="absolute top-4 right-4 h-12 w-12 text-[#F3F4F8]" (watermark style)
- Add a colored accent line at top of each card:
  <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-indigo-500" />
  (Use different colors: indigo, emerald, amber, purple)
- Card padding: p-6 --> p-5 (tighter, more compact)
- Add sparkline/mini chart in each card showing trend
```

#### Table Design (lines 222-337)

**What's Wrong:**
- Table header `bg-gray-50` is too subtle
- Alternating row colors (`bg-white` / `bg-[#FAFBFE]`) barely visible
- Action buttons are cramped

**Exact Fixes:**

```
TABLE HEADER:
- className="border-b-2 border-[#E5E7EB] bg-[#FAFBFE] text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7280]"
- Increase header padding: px-6 py-4

TABLE ROWS:
- Remove alternating colors (too busy)
- Add stronger hover: hover:bg-indigo-50/50
- Row padding: py-4 --> py-5 for more breathing room
- Add a subtle left border indicator for score quality:
  Score >= 70: border-l-2 border-l-emerald-400
  Score 40-69: border-l-2 border-l-amber-400
  Score < 40: border-l-2 border-l-red-400

ACTION BUTTONS:
- "View" button: make it a link-style text button (not bordered)
  className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
- "Delete" button: keep icon-only but add tooltip
```

#### Score Distribution Chart (lines 342-386)

**What's Wrong:**
- Custom bar chart is good but bars are too narrow
- Labels at `text-[10px]` too small to read
- No axis labels or context

**Exact Fixes:**

```
BAR CHART:
- Increase bar width: each bar should be w-12 minimum
- Add rounded bottoms as well: rounded-lg (not just rounded-t-lg)
- Add value labels ON the bars (not above)
- Label size: text-xs (not text-[10px])
- Add a y-axis label: "Number of Contracts"
- Consider using a proper chart library (Recharts) for polish
```

---

### 2.4 CHAT PAGE (`app/chat/page.tsx`)

#### Message Bubbles (lines 396-436)

**What's Wrong:**
- User bubble `bg-indigo-50` is very light -- almost invisible
- AI bubble has `border border-[#E5E7EB]` which looks identical to every other card
- Bubble radius `rounded-2xl` on both sides makes it look like a card, not a message

**Exact Fixes:**

```
USER BUBBLE:
- className="rounded-2xl rounded-br-md bg-indigo-600 px-4 py-3 text-sm text-white"
  (Colored bubble with sharp bottom-right corner for chat feel)
- Remove the indigo-50 background -- use actual brand color

AI BUBBLE:
- className="rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm text-[#374151] shadow-sm border border-[#E5E7EB]"
  (Sharp bottom-left corner for chat feel)
- Add subtle left border accent: border-l-2 border-l-indigo-200

AVATAR SIZE:
- Increase from h-8 w-8 to h-9 w-9
- AI avatar: add a subtle pulse animation when responding
```

#### Input Design (lines 464-493)

**What's Wrong:**
- Input bar is plain -- just a textarea with a button
- Send button at `h-11 w-11` is oddly sized
- No mention of keyboard shortcut (Enter to send)

**Exact Fixes:**

```
INPUT CONTAINER:
- Add a shadow to the input bar container:
  className="border-t border-[#E5E7EB] bg-white px-6 py-4 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]"
- This makes the input bar feel elevated above the messages

INPUT FIELD:
- className="w-full resize-none rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-5 py-3.5 text-sm text-[#111827] placeholder-[#9CA3AF] outline-none transition-all focus:border-indigo-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(79,70,229,0.1)]"
- Add keyboard shortcut hint:
  <span className="absolute right-14 bottom-3 text-[10px] text-[#D1D5DB]">Enter to send</span>

SEND BUTTON:
- className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#111827] text-white transition-all hover:bg-[#1F2937] disabled:opacity-30"
  (Solid dark button instead of gradient -- cleaner)
```

#### Sidebar Design (lines 238-319)

**What's Wrong:**
- Sidebar width is hardcoded to 300px -- could be tighter
- Contract history items have too much padding
- No visual indicator of which contract is most recent

**Exact Fixes:**

```
SIDEBAR:
- Width: 280px (slightly narrower for more chat space)
- Background: bg-[#FAFBFE] instead of bg-white (subtle distinction)
- Add a search input at the top of the sidebar

CONTRACT ITEMS:
- Add a timestamp relative format: "2 hours ago" instead of "Mar 20"
- Show score as a colored dot instead of text:
  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> for good
  <div className="h-2.5 w-2.5 rounded-full bg-amber-500" /> for fair
  <div className="h-2.5 w-2.5 rounded-full bg-red-500" /> for poor
```

#### Empty State (lines 356-393)

**What's Wrong:**
- Large gradient box for Sparkles icon feels heavy
- Suggestion buttons are small and cramped

**Exact Fixes:**

```
EMPTY STATE:
- Use a simpler icon treatment: just the Sparkles icon at h-12 w-12 text-indigo-400
  (no background box)
- Suggestions: make them full-width cards in a single column:
  className="w-full rounded-xl border border-[#E5E7EB] bg-white p-4 text-left text-sm text-[#4B5563] transition-all hover:border-indigo-300 hover:shadow-sm group"
  Add a small arrow icon on the right: <ArrowRight className="h-4 w-4 text-[#D1D5DB] group-hover:text-indigo-500 transition-colors" />
```

---

### 2.5 COMPARE PAGE (`app/compare/page.tsx`)

**What's Wrong:**
- Side-by-side textareas are plain
- "Load from history" dropdown is tiny and hard to find
- Results cards are dense with many small elements
- Detailed Comparison table repeats info from the cards

**Exact Fixes:**

```
TEXTAREA CONTAINERS:
- Add labels as floating headers:
  className="relative rounded-2xl border-2 border-[#E5E7EB] bg-white p-0 shadow-sm transition-all focus-within:border-indigo-400 focus-within:shadow-md"
  Label: <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-3 bg-[#FAFBFE] rounded-t-2xl">
           <span className="text-sm font-semibold text-[#111827]">Contract A</span>
           <select>...</select>
         </div>

RESULT CARDS:
- Give the winning card a gold/green glow:
  className="... ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/10"
- "BETTER" badge: make it larger and more celebratory
  className="rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-bold text-white"

COMPARISON TABLE:
- Remove it entirely -- the side-by-side cards already show everything
- OR collapse it into an expandable accordion "See Detailed Breakdown"
```

---

### 2.6 TEMPLATES PAGE (`app/templates/page.tsx`)

**What's Wrong:**
- Template cards are text-heavy with long descriptions
- Category filter tabs are basic
- No visual preview of what the template looks like
- Copy button interaction could be better

**Exact Fixes:**

```
CARD DESIGN:
- Reduce description to 2 lines max with line-clamp-2
- Add a colored top stripe matching category:
  Web Dev: indigo, Design: purple, Consulting: amber, Marketing: emerald, General: gray
  <div className="h-1 rounded-t-2xl bg-indigo-500" />
- Add a "popularity" indicator: "Most Used" badge on 1-2 templates

CARD GRID:
- Use grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6
- Cards should be same height: use flex flex-col, flex-1 on description

CATEGORY TABS:
- Use pill-style tabs:
  className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-all"
  Active: "bg-[#111827] text-white"
  Inactive: "bg-white border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F4F8]"

COPY INTERACTION:
- After copying, show a toast notification at bottom-center
- Button text: "Copy to Clipboard" --> changes to "Copied!" with a check animation
- Add a secondary action: "Analyze This Template" that sends to /analyze
```

---

### 2.7 NAV (`components/Nav.tsx`)

**What's Wrong:**
- Nav height at 64px (h-16) is standard but could be taller for more presence
- Logo is a gradient square with "D" -- generic
- Link styles don't have enough active state distinction
- User pill in nav takes up too much space

**Exact Fixes:**

```
NAV HEIGHT: Keep h-16 (64px) -- this is correct for SaaS

LOGO:
- Make the icon more distinctive: consider using the Zap icon (from footer) consistently
  className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111827]"
  <Zap className="h-4 w-4 text-white" />
- Or use a custom SVG mark
- "DEALWISE" text: text-base font-bold tracking-tight (reduce from text-lg)

LINK STYLES:
- Active link: add a bottom indicator line
  className="relative text-sm font-semibold text-[#111827] after:absolute after:bottom-[-21px] after:left-0 after:right-0 after:h-0.5 after:bg-[#111827] after:rounded-full"
- Inactive: text-sm font-medium text-[#6B7280] hover:text-[#111827]
- This creates a tab-bar feel in the nav

CTA BUTTON (right side):
- When logged out:
  className="rounded-full bg-[#111827] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1F2937] transition-colors"
  (Dark button, not gradient -- matches hero CTA)
- "Sign In" text link: keep as-is

USER PILL:
- Simplify: just avatar + chevron dropdown (no name visible)
  On click: show a dropdown with name, email, settings, sign out
  className="flex items-center gap-1.5 rounded-full p-1 transition-colors hover:bg-[#F3F4F8]"

MOBILE MENU:
- Add backdrop blur when open: bg-white/95 backdrop-blur-xl
- Animate links in with stagger: 50ms delay per item
```

---

### 2.8 AUTH MODAL (`components/AuthModal.tsx`)

**What's Wrong:**
- Modal is well-designed overall -- this is one of the stronger components
- The gradient top line and centered Sparkles icon are good
- Tab toggle is clean

**Exact Fixes (minor refinements):**

```
MODAL:
- Max width: change from max-w-md (448px) to max-w-sm (384px) for a more focused feel
- Shadow: increase to shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]

INPUTS:
- Add a transition on the icon when field is focused:
  className="... peer" on input
  className="... peer-focus:text-indigo-500" on the icon label

SUBMIT BUTTON:
- Change from gradient to solid:
  className="w-full rounded-xl bg-[#111827] py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#1F2937]"

GOOGLE BUTTON:
- Add subtle shadow: shadow-sm
- Make border slightly more visible: border-[#D1D5DB]

TRUST BADGES:
- Move ABOVE the form (below the subtitle) for trust before action
- Or make them slightly larger: text-xs instead of text-[11px]
```

---

## SECTION 3: Design Tokens

These EXACT values should be used consistently across every page:

### Typography

```css
/* Font Family */
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;

/* Font Sizes */
--text-hero: 72px;       /* Hero headlines only */
--text-display: 56px;    /* Major page titles */
--text-h1: 36px;         /* Section titles (landing page) */
--text-h2: 28px;         /* Section titles (app pages) */
--text-h3: 22px;         /* Card titles, sub-sections */
--text-h4: 18px;         /* Card headers, large labels */
--text-body-lg: 16px;    /* Prominent body text, descriptions */
--text-body: 15px;       /* Default body text */
--text-sm: 14px;         /* Secondary text, table cells */
--text-xs: 13px;         /* Labels, captions, metadata */
--text-tiny: 11px;       /* Badges, timestamps, fine print */

/* Tailwind equivalents */
Hero:      text-7xl sm:text-8xl (72px/80px)
Display:   text-5xl sm:text-6xl (48px/60px)
H1:        text-3xl sm:text-4xl (30px/36px)
H2:        text-2xl sm:text-3xl (24px/30px)
H3:        text-xl (20px)
H4:        text-lg (18px)
Body LG:   text-base (16px)
Body:      text-[15px]
SM:        text-sm (14px)
XS:        text-xs (12px) -- note: bump captions to 13px manually
Tiny:      text-[11px]

/* Font Weights */
Hero/Display:  font-extrabold (800)
Headings:      font-bold (700)
Subheadings:   font-semibold (600)
Body emphasis: font-medium (500)
Body:          font-normal (400)

/* Letter Spacing */
Hero:     tracking-[-0.035em]
Headings: tracking-tight (-0.025em)
Body:     tracking-normal (0)
Overline: tracking-[0.15em] uppercase text-xs font-semibold
Badges:   tracking-wider (0.05em) uppercase text-[11px] font-semibold
```

### Colors

```css
/* Backgrounds */
--bg-page:        #FAFBFE;   /* Default page background */
--bg-card:        #FFFFFF;   /* Card surfaces */
--bg-subtle:      #F3F4F8;   /* Secondary backgrounds, inputs */
--bg-inset:       #F1F3F9;   /* Inset elements, code blocks */
--bg-dark:        #111827;   /* Dark sections, footer, dark CTAs */
--bg-dark-subtle: #1F2937;   /* Dark section hover states */

/* Text */
--text-primary:   #111827;   /* Headings, important text */
--text-secondary: #4B5563;   /* Body text, descriptions */
--text-muted:     #6B7280;   /* Placeholder, helper text */
--text-faint:     #9CA3AF;   /* Timestamps, fine print */
--text-disabled:  #D1D5DB;   /* Disabled text */

/* Brand */
--brand:          #4F46E5;   /* Primary brand (indigo-600) */
--brand-hover:    #4338CA;   /* Brand hover (indigo-700) */
--brand-light:    #EEF2FF;   /* Brand backgrounds (indigo-50) */
--brand-ring:     rgba(79, 70, 229, 0.15);  /* Focus rings */

/* Borders */
--border-default: #E5E7EB;   /* Standard borders */
--border-subtle:  #F3F4F6;   /* Very subtle borders */
--border-strong:  #D1D5DB;   /* Emphasized borders */
--border-brand:   rgba(79, 70, 229, 0.2);  /* Brand-colored borders */

/* Semantic: Status */
--success:        #059669;   /* emerald-600 */
--success-bg:     #ECFDF5;   /* emerald-50 */
--success-border: #A7F3D0;   /* emerald-200 */
--warning:        #D97706;   /* amber-600 */
--warning-bg:     #FFFBEB;   /* amber-50 */
--warning-border: #FDE68A;   /* amber-200 */
--danger:         #DC2626;   /* red-600 */
--danger-bg:      #FEF2F2;   /* red-50 */
--danger-border:  #FECACA;   /* red-200 */
--info:           #2563EB;   /* blue-600 */
--info-bg:        #EFF6FF;   /* blue-50 */
--info-border:    #BFDBFE;   /* blue-200 */

/* Semantic: Risk Severity (specific to DealWise) */
--risk-critical:    #DC2626;   /* red-600 */
--risk-critical-bg: #FEF2F2;   /* red-50 */
--risk-high:        #EA580C;   /* orange-600 */
--risk-high-bg:     #FFF7ED;   /* orange-50 */
--risk-medium:      #D97706;   /* amber-600 */
--risk-medium-bg:   #FFFBEB;   /* amber-50 */
--risk-low:         #2563EB;   /* blue-600 */
--risk-low-bg:      #EFF6FF;   /* blue-50 */
```

### Spacing

```css
/* Section Spacing */
--section-py:       112px;   /* py-28 -- vertical padding for landing page sections */
--section-py-app:   32px;    /* py-8 -- vertical padding for app page content */
--section-px:       24px;    /* px-6 -- horizontal padding */
--section-max-w:    1280px;  /* max-w-7xl */

/* Card Spacing */
--card-padding-sm:  16px;    /* p-4 */
--card-padding-md:  24px;    /* p-6 */
--card-padding-lg:  32px;    /* p-8 */
--card-gap:         20px;    /* gap-5 -- between cards in a grid */

/* Element Spacing */
--gap-xs:           4px;     /* gap-1 */
--gap-sm:           8px;     /* gap-2 */
--gap-md:           12px;    /* gap-3 */
--gap-lg:           16px;    /* gap-4 */
--gap-xl:           24px;    /* gap-6 */
--gap-2xl:          32px;    /* gap-8 */
--gap-3xl:          48px;    /* gap-12 */
```

### Border Radius

```css
/* Border Radius */
--radius-sm:    6px;     /* rounded-md -- small elements like badges */
--radius-md:    8px;     /* rounded-lg -- buttons, inputs */
--radius-lg:    12px;    /* rounded-xl -- cards, modals, larger elements */
--radius-xl:    16px;    /* rounded-2xl -- featured cards, hero elements */
--radius-full:  9999px;  /* rounded-full -- pills, avatars, CTAs */

/* Usage Guide */
Badges:     rounded-full (pill shape)
Buttons:    rounded-xl (default), rounded-full (CTA/primary)
Inputs:     rounded-xl
Cards:      rounded-2xl
Modals:     rounded-2xl
Avatars:    rounded-full
Nav:        N/A (edge-to-edge)
Tooltips:   rounded-lg
```

### Shadows

```css
/* Shadows */
--shadow-xs:    0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-sm:    0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-md:    0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
--shadow-lg:    0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04);
--shadow-xl:    0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
--shadow-2xl:   0 25px 50px -12px rgba(0, 0, 0, 0.2);
--shadow-brand: 0 4px 14px -2px rgba(79, 70, 229, 0.25);
--shadow-brand-lg: 0 8px 30px -4px rgba(79, 70, 229, 0.3);
--shadow-glow:  0 0 20px rgba(79, 70, 229, 0.15);

/* Usage Guide */
Cards (default):   shadow-sm
Cards (elevated):  shadow-md
Cards (featured):  shadow-lg
Cards (hover):     shadow-md (from shadow-sm)
Modals:            shadow-2xl
Dropdowns:         shadow-lg
CTA buttons:       shadow-brand
Input focus:       shadow-glow (via ring)
Nav:               none (border-b only)
```

---

## SECTION 4: Component Patterns

### Button

```tsx
/* PRIMARY (main CTA) */
className="inline-flex items-center justify-center gap-2 rounded-full bg-[#111827] px-8 py-4 text-base font-semibold text-white shadow-[0_4px_14px_-2px_rgba(0,0,0,0.15)] transition-all hover:bg-[#1F2937] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md focus:outline-none focus:ring-2 focus:ring-[#111827] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"

/* PRIMARY BRAND (when on dark background) */
className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-[0_4px_14px_-2px_rgba(79,70,229,0.25)] transition-all hover:shadow-lg hover:brightness-105 active:brightness-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"

/* SECONDARY */
className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-5 py-2.5 text-sm font-semibold text-[#4B5563] shadow-xs transition-all hover:bg-[#F9FAFB] hover:border-[#D1D5DB] hover:shadow-sm active:bg-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-[#E5E7EB] focus:ring-offset-2 disabled:opacity-50"

/* GHOST */
className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-[#4B5563] transition-all hover:bg-[#F3F4F8] hover:text-[#111827] active:bg-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-[#E5E7EB] disabled:opacity-50"

/* DANGER */
className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 active:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"

/* SIZES */
sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5"
md: "px-5 py-2.5 text-sm rounded-xl gap-2"
lg: "px-8 py-4 text-base rounded-full gap-2"
```

### Card

```tsx
/* DEFAULT */
className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm"

/* ELEVATED */
className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-md"

/* FEATURED (with brand accent) */
className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-md ring-1 ring-indigo-100"

/* INTERACTIVE (hover state) */
className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-200 cursor-pointer"

/* DANGER CARD (red flags) */
className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm border-l-4 border-l-red-500"

/* SUBTLE (inset) */
className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4"
```

### Input Field

```tsx
/* DEFAULT */
className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] placeholder-[#9CA3AF] outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.08)]"

/* WITH ICON */
<div className="relative">
  <Icon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF] transition-colors peer-focus:text-indigo-500" />
  <input className="peer w-full rounded-xl border border-[#E5E7EB] bg-white py-3 pl-10 pr-4 text-sm ..." />
</div>

/* ERROR STATE */
className="... border-red-300 focus:border-red-500 focus:ring-red-500/10"
<p className="mt-1.5 text-xs font-medium text-red-600">Error message</p>

/* LABEL */
<label className="mb-1.5 block text-sm font-medium text-[#374151]">Label</label>
```

### Textarea

```tsx
className="w-full resize-y rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#111827] placeholder-[#9CA3AF] outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 min-h-[120px]"
```

### Select

```tsx
<div className="relative">
  <select className="w-full appearance-none rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 pr-10 text-sm text-[#111827] outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 cursor-pointer">
    ...
  </select>
  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
</div>
```

### Badge / Pill

```tsx
/* DEFAULT (neutral) */
className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-[#F3F4F8] px-2.5 py-0.5 text-[11px] font-semibold text-[#4B5563]"

/* SUCCESS */
className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700"

/* WARNING */
className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700"

/* DANGER */
className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-700"

/* INFO / BRAND */
className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700"

/* With dot indicator */
<span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
```

### Tab Bar

```tsx
/* CONTAINER */
className="inline-flex items-center gap-1 rounded-xl bg-[#F3F4F8] p-1"

/* ACTIVE TAB */
className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#111827] shadow-sm transition-all"

/* INACTIVE TAB */
className="rounded-lg px-4 py-2 text-sm font-medium text-[#6B7280] transition-all hover:text-[#111827]"

/* ALTERNATIVE: Underline tabs (for results page) */
Active:   "border-b-2 border-[#111827] pb-3 text-sm font-semibold text-[#111827]"
Inactive: "border-b-2 border-transparent pb-3 text-sm font-medium text-[#6B7280] hover:text-[#111827] hover:border-[#D1D5DB]"
```

### Modal

```tsx
/* BACKDROP */
className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"

/* MODAL CONTAINER */
className="relative w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden"

/* MODAL HEADER (if needed) */
className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4"
<h2 className="text-lg font-semibold text-[#111827]">Title</h2>

/* MODAL BODY */
className="px-6 py-5"

/* MODAL FOOTER */
className="flex items-center justify-end gap-3 border-t border-[#E5E7EB] bg-[#FAFBFE] px-6 py-4"

/* CLOSE BUTTON */
className="absolute right-4 top-4 rounded-lg p-1.5 text-[#9CA3AF] transition-colors hover:bg-[#F3F4F8] hover:text-[#4B5563]"
```

### Table

```tsx
/* CONTAINER */
className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden"

/* TABLE */
className="w-full text-left text-sm"

/* HEADER ROW */
className="border-b border-[#E5E7EB] bg-[#FAFBFE]"
<th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B7280]">

/* BODY ROW */
className="border-b border-[#F3F4F6] transition-colors hover:bg-[#FAFBFE]"
<td className="px-6 py-4 text-sm text-[#4B5563]">

/* BODY ROW (with left score indicator) */
className="border-b border-[#F3F4F6] border-l-2 border-l-emerald-400 transition-colors hover:bg-[#FAFBFE]"

/* NO RESULTS */
<td colSpan={N} className="px-6 py-16 text-center">
  <EmptyState ... />
</td>
```

### Score Circle

```tsx
/* CONTAINER */
className="relative h-40 w-40"

/* SVG */
<svg className="-rotate-90" viewBox="0 0 120 120" width="160" height="160">
  /* Background circle */
  <circle cx="60" cy="60" r="54" fill="none" className="stroke-[#F3F4F6]" strokeWidth="8" />
  /* Score circle */
  <circle cx="60" cy="60" r="54" fill="none" className={scoreColor.ring} strokeWidth="8" strokeLinecap="round"
    strokeDasharray={circumference} strokeDashoffset={offset}
    style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
  />
</svg>

/* CENTER TEXT */
<div className="absolute inset-0 flex flex-col items-center justify-center">
  <span className={`text-4xl font-bold ${scoreColor.text}`}>{score}</span>
  <span className="text-xs font-medium text-[#9CA3AF]">/ 100</span>
</div>
```

### Progress Indicator (Loading)

```tsx
/* SPINNER */
className="h-5 w-5 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-indigo-600"

/* SKELETON LINE */
className="h-4 w-3/4 animate-pulse rounded-lg bg-[#E5E7EB]"

/* SKELETON CARD */
<div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
  <div className="h-4 w-1/3 animate-pulse rounded bg-[#E5E7EB]" />
  <div className="mt-3 h-3 w-full animate-pulse rounded bg-[#F3F4F6]" />
  <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-[#F3F4F6]" />
</div>

/* PROGRESS BAR */
<div className="h-1.5 w-full rounded-full bg-[#E5E7EB] overflow-hidden">
  <div className="h-full rounded-full bg-indigo-600 transition-all duration-500" style={{ width: `${progress}%` }} />
</div>

/* STEP INDICATOR (analysis loading) */
<div className="flex items-center gap-3">
  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
    completed ? 'bg-emerald-500 text-white' : active ? 'bg-indigo-600 text-white animate-pulse' : 'bg-[#E5E7EB] text-[#9CA3AF]'
  }`}>
    {completed ? <Check className="h-4 w-4" /> : <span className="text-xs font-bold">{step}</span>}
  </div>
  <span className={`text-sm ${active ? 'font-semibold text-[#111827]' : 'text-[#9CA3AF]'}`}>{label}</span>
</div>
```

---

## SECTION 5: Priority Order (Maximum Visual Impact First)

### Phase 1: Immediate Impact (1-2 hours)
These changes affect every page and create the biggest visual shift:

1. **Update globals.css design tokens** -- add all CSS variables from Section 3
2. **Fix the Nav** -- dark CTA button, active link indicators, simplified user pill
3. **Fix Button component** -- dark primary button instead of gradient everywhere
4. **Fix Card shadows** -- upgrade from shadow-sm to shadow-sm + proper hover states
5. **Fix input focus states** -- stronger ring with brand color tint

### Phase 2: Landing Page (2-3 hours)
The landing page is what new users see first:

6. **Hero redesign** -- larger text, distinctive gradient, dark CTA button, better spacing
7. **Section backgrounds** -- alternate between white and bg-[#FAFBFE] with border-t separators
8. **Feature cards** -- unique icon colors per feature, not all indigo
9. **Live demo preview** -- add terminal-style header dots, stronger shadow
10. **Footer** -- dark background, multi-column layout, gradient border top
11. **Final CTA section** -- dark background instead of gradient, grid pattern overlay
12. **Pricing** -- single centered card instead of two-column with disabled card

### Phase 3: App Pages (2-3 hours)
The pages users interact with daily:

13. **Analyze page tabs** -- sticky tab bar with dark active state
14. **Red flag cards** -- severity-colored left borders, counter-proposal callout boxes
15. **Dashboard stat cards** -- colored top accents, larger values, trend sparklines
16. **Dashboard table** -- left border score indicators, stronger hover states
17. **Chat bubbles** -- colored user bubbles, chat-style rounded corners
18. **Chat input** -- elevated shadow, keyboard shortcut hint

### Phase 4: Polish (1-2 hours)
Refinements that add delight:

19. **Skeleton loading screens** -- replace spinners with skeleton cards
20. **Empty states** -- add illustrations or larger icons, better copy
21. **Template cards** -- category-colored top stripes, line-clamp descriptions
22. **Compare page** -- winning card glow effect, simplified results
23. **Auth modal** -- solid dark submit button, trust badges above form
24. **Micro-interactions** -- button press scale, hover glows, staggered entrance animations

### Phase 5: Advanced Polish (optional, 1-2 hours)

25. **Score celebration** -- confetti for good scores, red pulse for bad
26. **Background textures** -- subtle dot grid or noise on hero section
27. **Toast notifications** -- for copy actions, saves, deletions
28. **Smooth page transitions** -- fade between routes
29. **Dark mode** -- implement full dark mode using CSS variables

---

## Quick Reference: Current vs. Proposed

| Element | Current | Proposed |
|---------|---------|----------|
| Primary CTA | Gradient indigo-purple | Solid #111827 dark |
| Card shadow | shadow-sm | shadow-sm, hover:shadow-md |
| Input focus | ring-indigo-100 (barely visible) | ring-indigo-500/10 + blue border |
| Nav CTA | Gradient pill | Solid dark pill |
| Section breaks | Alternating bg colors | White + border-t |
| Feature icons | All indigo-50 | Unique color per feature |
| Footer | White, minimal | Dark #111827, multi-column |
| Hero size | text-7xl max | text-8xl max |
| Badge radius | rounded-full (good) | Keep |
| Card radius | rounded-2xl (good) | Keep |
| Chat user bubble | bg-indigo-50 (barely visible) | bg-indigo-600 text-white |
| Table hover | hover:bg-indigo-50/30 | hover:bg-[#FAFBFE] |
| Loading state | Single spinner | Skeleton cards + step indicator |

---

*Generated from analysis of: Linear, ContractCrab, Vercel, Stripe, shadcn/ui, and 50+ top SaaS sites (2025-2026). Every recommendation includes exact Tailwind classes ready for implementation.*
