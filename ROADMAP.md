# DEALWISE — Complete Perfection Roadmap

## Status: IN PROGRESS
Last updated: March 20, 2026

---

## PHASE 1: Analysis Engine — Handle ALL Contract Types
**Goal: Any freelance contract in the world should work perfectly**

### 1.1 Contract Types to Support
- [x] Fixed-price project contracts ✅
- [x] Hourly rate contracts ✅ (auto-detected)
- [x] Retainer agreements ✅ (auto-detected)
- [x] Milestone-based payments ✅ (auto-detected, tested 30/40/30)
- [x] Revenue share / royalty contracts ✅ (auto-detected)
- [x] Day-rate contracts ✅ (auto-detected)
- [x] Per-word / per-unit contracts ✅ (auto-detected, fixed priority)
- [ ] Equity + cash hybrid ("$5000 + 1% equity")

### 1.2 Analysis Accuracy Fixes
- [x] Make price/hours OPTIONAL ✅ (auto-detect from text)
- [x] Auto-detect contract type from text ✅ (7 types)
- [x] Auto-detect payment amount from contract text ✅ ($, Rs., £, €)
- [x] Auto-detect payment schedule from contract text ✅
- [x] Fix: IP "deliverables transfer" not detected ✅ (regex updated)
- [x] Fix: Liability "equals total fees" not detected ✅ (regex updated)
- [x] Fix: "Late payments incur interest" not detected ✅ (regex updated)
- [x] Fix: Kill fee "pays for work completed" not detected ✅ (regex updated)
- [x] Fix: Good contracts score 70-100 ✅ (near-perfect = 100)
- [x] Fix: Moderate contracts score 30-60 ✅ (Indian = 31)
- [x] Fix: Bad contracts score 0-30 ✅ (nightmare = 0)
- [x] Fix: Unlimited bug fixes detection ✅ (new pattern added)
- [x] Fix: Contract type priority order ✅ (per-unit before retainer)

### 1.3 More Detection Patterns
- [ ] Minimum hours / guaranteed hours clause
- [ ] Overtime / after-hours rate
- [ ] Travel expense coverage
- [ ] Equipment provision
- [ ] Training period (unpaid work disguised as training)
- [ ] Right to showcase / case study rights
- [ ] Insurance requirements (liability, E&O)
- [ ] Background check requirements
- [ ] Drug testing clauses
- [ ] Social media restrictions
- [ ] Moonlighting restrictions (different from non-compete)

### 1.4 Test with 50+ Real Contract Patterns
- [ ] Web development fixed-price
- [ ] Web development hourly
- [ ] Graphic design project
- [ ] Graphic design retainer
- [ ] Content writing per-word
- [ ] Content writing monthly retainer
- [ ] Video production project
- [ ] Photography event contract
- [ ] Consulting hourly
- [ ] Consulting project
- [ ] Mobile app development
- [ ] SEO/Marketing retainer
- [ ] Virtual assistant contract
- [ ] Translation services
- [ ] Voice-over / narration
- [ ] Architecture / CAD services
- [ ] Legal consulting
- [ ] Accounting services
- [ ] Music production / licensing
- [ ] SaaS development
- [ ] UI/UX design
- [ ] Illustration / art commission
- [ ] Social media management retainer
- [ ] Public relations retainer
- [ ] Tutoring / coaching
- [ ] Event planning
- [ ] Data entry / admin
- [ ] Transcription services
- [ ] 3D modeling / animation
- [ ] Technical writing
- [ ] EACH tested with: good terms, bad terms, and Indian/UK/US variants

---

## PHASE 2: UX Improvements
**Goal: Every flow feels smooth, intuitive, professional**

### 2.1 Analyze Page UX
- [ ] Make price and hours OPTIONAL with smart defaults
- [ ] Add "I don't know my hours" helper (estimate calculator)
- [ ] Auto-detect currency from contract text (Rs., $, £, €)
- [ ] Show real-time character count on contract input
- [ ] Better empty state before analysis
- [ ] "Try with sample contract" button for new users
- [ ] Smooth scroll between form and results
- [ ] Better tab transitions
- [ ] Collapsible red flag details (show summary, expand for details)

### 2.2 Dashboard UX
- [ ] Loading skeleton while fetching history
- [ ] Empty dashboard with onboarding steps
- [ ] Trend chart (scores over time)
- [ ] "Getting Started" checklist for new users

### 2.3 Chat UX
- [ ] Show typing indicator
- [ ] Suggested follow-up questions after each response
- [ ] Code-formatted contract clauses in responses
- [ ] "Summarize this contract" quick action

### 2.4 Templates UX
- [ ] Preview template before using
- [ ] Customizable template fields (fill in blanks)
- [ ] "Create from scratch" option
- [ ] Template difficulty/complexity indicator

### 2.5 Compare UX
- [ ] Load contracts from history (don't re-paste)
- [ ] Highlight differences between versions
- [ ] "Which is better?" verdict with reasoning

### 2.6 General UX
- [ ] Consistent loading states on ALL pages
- [ ] Toast notifications for actions (copied, saved, deleted)
- [ ] Breadcrumb navigation
- [ ] "Back" button behavior on all pages
- [ ] Mobile: bottom nav bar for quick switching
- [ ] Onboarding tour for first-time users

---

## PHASE 3: UI Polish
**Goal: Looks like a $2M startup product**

### 3.1 Visual Improvements
- [ ] Consistent card styling across ALL pages
- [ ] Better typography hierarchy
- [ ] Micro-animations on interactions (button press, card hover)
- [ ] Loading skeletons instead of spinners
- [ ] Better color consistency
- [ ] Proper spacing rhythm (8px grid)

### 3.2 Component Consistency
- [ ] Unified button styles (primary, secondary, ghost, danger)
- [ ] Unified input field styles
- [ ] Unified card styles
- [ ] Unified badge/pill styles
- [ ] Unified section header pattern

---

## PHASE 4: Remaining Feature Gaps
- [ ] Negotiation email generator (write the actual email to send to client)
- [ ] Contract health score trending (how your deals improve over time)
- [ ] "Share My Rate" social card (viral feature)
- [ ] Rate benchmarking (your rate vs market data)

---

## TRACKING

When each item is done, mark it [x]. This file is the source of truth.
