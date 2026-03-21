# DEALWISE — Quality Assurance System

## Purpose
This document defines a RIGOROUS testing process. Nothing gets marked "done" until it's tested with real data and verified working. Every test has an expected result and an actual result.

---

## PHASE 1: PDF Upload + Analysis Pipeline (MOST CRITICAL)

### Test Method
1. Download 10 real contract PDFs from the internet
2. Upload each through our `/api/parse-pdf` endpoint
3. Check: text extracted correctly? All pages? No garbled text?
4. Run each through `/api/analyze`
5. Check: score reasonable? Red flags accurate? Green flags accurate?

### Test Contracts to Find Online
| # | Type | Source to search | Expected rating |
|---|------|-----------------|-----------------|
| 1 | Freelance web dev | Search "freelance web development contract PDF" | Medium |
| 2 | Design services | Search "graphic design contract PDF download" | Medium |
| 3 | Consulting agreement | Search "consulting agreement PDF template" | Good |
| 4 | Bad contract (one-sided) | Search "independent contractor agreement PDF" | Bad |
| 5 | Indian IT contract | Search "software development agreement India PDF" | Medium |
| 6 | UK freelance contract | Search "freelance contract UK PDF" | Good |
| 7 | Photography contract | Search "photography services contract PDF" | Medium |
| 8 | Content writing | Search "content writing agreement PDF" | Medium |
| 9 | NDA + services | Search "NDA and services agreement PDF" | Medium |
| 10 | Employment misclassified as contractor | Search "independent contractor agreement PDF" | Bad |

### What to verify for each
- [ ] PDF uploads without error
- [ ] Text extraction is complete (not truncated)
- [ ] Auto-detection: currency, price, scope, parties extracted correctly
- [ ] Analysis: score is in the right range
- [ ] Analysis: red flags are real issues (no false positives)
- [ ] Analysis: green flags are real positives (no false negatives)
- [ ] Analysis: missing clauses are actually missing
- [ ] Analysis: AI insights add value beyond heuristics
- [ ] Counter-proposals are actionable and make sense

---

## PHASE 2: Text Paste Analysis (Secondary Path)

### Test with 10 diverse pasted contracts
Same contracts as above but pasted as text, to verify:
- [ ] Analysis results are identical to PDF path
- [ ] Auto-detection works on pasted text too
- [ ] Different contract types detected correctly

---

## PHASE 3: Chat Testing

### Test scenarios
| # | Test | Expected |
|---|------|----------|
| 1 | Ask "What does unlimited revisions mean?" with no context | General advice about revisions |
| 2 | Load a bad contract from history, ask "Is this fair?" | Specific analysis referencing the contract |
| 3 | Ask follow-up "What should I change?" | Actionable counter-proposals |
| 4 | Ask "Explain clause 3" | Should reference the actual clause text |
| 5 | Ask in Hindi/regional context "Kya ye contract safe hai?" | Should still respond helpfully |

### What to verify
- [ ] Chat loads contract context from history sidebar
- [ ] Chat loads context from "Chat about this" button on analyze page
- [ ] Responses reference actual contract text, not generic advice
- [ ] Follow-up questions maintain context
- [ ] No "fake" responses without API key (should clearly say AI unavailable)

---

## PHASE 4: Compare Page Testing

### Test scenarios
| # | Test | Expected |
|---|------|----------|
| 1 | Paste two different contracts, analyze both | Side-by-side scores shown |
| 2 | Load from history dropdown | Contract text fills in |
| 3 | Compare good vs bad contract | Clear winner identified |

### What to verify
- [ ] Both contracts analyze successfully
- [ ] Scores shown side by side
- [ ] "Better" verdict is correct
- [ ] Load from history works

---

## PHASE 5: Dashboard Testing

### Test scenarios
- [ ] Empty dashboard shows onboarding/CTA
- [ ] After 3+ analyses, stats are accurate
- [ ] "View" button loads the result on analyze page
- [ ] Search filters correctly
- [ ] Delete removes entry
- [ ] Score distribution chart matches actual data

---

## PHASE 6: Templates Testing

### Test scenarios
- [ ] All 6 templates display
- [ ] "Use Template" copies text to clipboard
- [ ] "Analyze" button navigates to /analyze with text pre-filled
- [ ] Category filter works
- [ ] Search works

---

## PHASE 7: Settings Testing

### Test scenarios
- [ ] Save API key → used in next analysis
- [ ] Save default currency → used in next analysis
- [ ] Save default country → used in next analysis
- [ ] Toggle "Show AI insights" off → AI section hidden in results
- [ ] Toggle "Show country context" off → country section hidden
- [ ] Clear history → dashboard empty

---

## PHASE 8: Auth Flow Testing

### Test scenarios
- [ ] Sign up with email/password → dashboard
- [ ] Sign in with existing account → dashboard
- [ ] Access /dashboard without login → redirect to sign-in
- [ ] Sign in → redirect back to original page
- [ ] Sign out → nav updates
- [ ] Analyze without login → works (first free)
- [ ] After analysis without login → signup prompt shown

---

## PHASE 9: UX Checklist (Every Page)

For EACH page, verify:
- [ ] Page loads without errors
- [ ] No console errors (except Grammarly hydration)
- [ ] Mobile responsive (resize browser to 375px)
- [ ] All buttons work
- [ ] All links navigate correctly
- [ ] Loading states shown during async operations
- [ ] Error states shown on failure
- [ ] Empty states shown when no data

### Pages to check
1. / (landing)
2. /analyze
3. /dashboard
4. /chat
5. /templates
6. /compare
7. /bulk
8. /settings
9. /api-docs
10. /auth/signin
11. /privacy
12. /terms

---

## PHASE 10: UX/UI Issues to Fix

### Priority 1: Flows that feel broken
- [ ] After PDF upload, user should NOT need to fill in any fields manually
- [ ] After analysis, "Chat about this" should be prominent
- [ ] Results should feel like a professional report, not a dev tool
- [ ] Loading state should feel like magic, not waiting

### Priority 2: Visual consistency
- [ ] All pages use same card style
- [ ] All pages use same button styles
- [ ] All pages use same typography
- [ ] All pages use same spacing
- [ ] Nav looks same on all pages

### Priority 3: Missing UX
- [ ] Toast notifications for success/error actions
- [ ] Breadcrumb or back navigation on inner pages
- [ ] "What's this?" tooltips on complex features
- [ ] Keyboard shortcuts guide

---

## TRACKING

For each test, record:
- PASS / FAIL
- If FAIL: what went wrong, which file to fix
- After fix: re-test and mark PASS

## RULE
**Nothing is "done" until it's tested and passing. No exceptions.**
