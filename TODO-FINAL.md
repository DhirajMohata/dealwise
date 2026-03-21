# FINAL TODO — Landing Page + Contact + Reports + Reviews

## 1. Landing Page — Remove AI-generated feel
- [ ] Remove generic section overlines ("THE PROBLEM", "HOW IT WORKS", etc.)
- [ ] Remove generic icon + title + description card pattern (every section looks the same)
- [ ] Make each section visually DIFFERENT from each other
- [ ] Remove bullet-point style feature lists
- [ ] Add real personality to the copy (not corporate speak)
- [ ] Better visual hierarchy — not everything looks like a card grid
- [ ] Smoother transitions between sections
- [ ] Footer: done ✅ (Privacy, Terms, Contact only)

## 2. Contact Us Page (/contact)
- [ ] Full contact page with form (name, email, subject, message)
- [ ] Saves to Supabase `contact_messages` table
- [ ] Shows confirmation after submit
- [ ] Admin can view all messages in admin portal

## 3. Report Issue Widget (floating button, every page)
- [ ] Small "Report Issue" button fixed at bottom-right of every page
- [ ] Clicking opens a small modal: describe issue + screenshot option
- [ ] Saves to Supabase `issue_reports` table with page URL, user email, timestamp
- [ ] Admin portal: new "Reports" tab showing all reported issues with status (open/resolved)

## 4. Review/Testimonial System
- [ ] After analysis, prompt user to rate (1-5 stars) + short review
- [ ] Saves to Supabase `reviews` table
- [ ] Admin portal: new "Reviews" tab to approve/reject/feature reviews
- [ ] Approved reviews shown on landing page testimonials section
- [ ] Admin can mark reviews as "featured" to show on landing page

## 5. Admin Portal Updates
- [ ] New tab: "Messages" — view contact form submissions
- [ ] New tab: "Reports" — view issue reports, mark as resolved
- [ ] New tab: "Reviews" — approve/reject reviews, feature them

## Implementation Order
1. Create Supabase tables (contact_messages, issue_reports, reviews)
2. Build Contact page
3. Build Report Issue widget (global component)
4. Build Review system
5. Update Admin portal with 3 new tabs
6. Rebuild landing page sections to look unique
7. Push to GitHub → auto-deploy
