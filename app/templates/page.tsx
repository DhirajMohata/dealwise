'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  Search,
  Code,
  Palette,
  Briefcase,
  PenTool,
  Smartphone,
  FileCheck,
  Filter,
} from 'lucide-react';
import Nav from '@/components/Nav';
import ProtectedRoute from '@/components/ProtectedRoute';

/* ------------------------------------------------------------------ */
/*  Template Data                                                      */
/* ------------------------------------------------------------------ */

type Category = 'All' | 'Web Development' | 'Design' | 'Consulting' | 'Marketing' | 'General';

interface Template {
  id: string;
  name: string;
  category: Category;
  description: string;
  icon: typeof FileText;
  content: string;
}

const TEMPLATES: Template[] = [
  {
    id: 'web-dev',
    name: 'Web Development Agreement',
    category: 'Web Development',
    description: 'Comprehensive contract for web development projects including front-end, back-end, and full-stack work with clear milestone-based deliverables.',
    icon: Code,
    content: `WEB DEVELOPMENT SERVICES AGREEMENT

This Web Development Services Agreement ("Agreement") is entered into as of [DATE] ("Effective Date") by and between:

CLIENT: [Client Name], located at [Client Address] ("Client")
DEVELOPER: [Your Name / Business Name], located at [Your Address] ("Developer")

Collectively referred to as the "Parties."

1. SCOPE OF WORK

1.1 The Developer agrees to design, develop, and deliver the following web development services ("Project"):
- [Detailed description of the website/web application]
- Technology stack: [e.g., React, Next.js, Node.js, PostgreSQL]
- Pages/screens to be developed: [List specific pages]
- Features and functionality: [List specific features]

1.2 The Project scope is limited to the deliverables explicitly described in this Section and any attached Statement of Work ("SOW"). Any work not described herein is considered out of scope and will require a separate written agreement or change order.

1.3 The Developer will provide the Client with a staging/development URL for review purposes during the development phase.

2. PROJECT TIMELINE

2.1 The estimated project timeline is [X] weeks from the Effective Date, broken into the following milestones:

Milestone 1 - Discovery & Wireframes: [Date] - [Date]
Milestone 2 - Design Mockups: [Date] - [Date]
Milestone 3 - Front-End Development: [Date] - [Date]
Milestone 4 - Back-End Development & Integration: [Date] - [Date]
Milestone 5 - Testing & QA: [Date] - [Date]
Milestone 6 - Launch & Handover: [Date] - [Date]

2.2 Timelines are estimates and may be adjusted due to factors outside the Developer's control, including but not limited to: delayed feedback from Client, scope changes, or third-party service issues. The Developer will communicate any delays promptly.

2.3 Client delays in providing content, feedback, or approvals exceeding 5 business days will automatically extend the project timeline by the duration of the delay.

3. PAYMENT TERMS

3.1 Total Project Fee: [CURRENCY] [AMOUNT]

3.2 Payment Schedule:
- 40% deposit upon signing this Agreement: [CURRENCY] [AMOUNT]
- 30% upon completion of Milestone 3 (Front-End Development): [CURRENCY] [AMOUNT]
- 30% upon final delivery and launch: [CURRENCY] [AMOUNT]

3.3 Invoices are due within 15 days of receipt. All payments shall be made via [payment method: bank transfer, PayPal, etc.].

3.4 LATE PAYMENT: Overdue invoices will accrue interest at a rate of 1.5% per month (18% annually) from the due date until paid in full. The Developer reserves the right to suspend work on overdue accounts and retain all deliverables until payment is received.

3.5 The Client is responsible for all applicable taxes, duties, and fees related to this Agreement.

4. REVISIONS AND CHANGE ORDERS

4.1 This Agreement includes up to TWO (2) rounds of revisions per milestone deliverable. A "revision" is defined as a modification to approved work that does not alter the fundamental scope, structure, or functionality.

4.2 Additional revisions beyond the included rounds will be billed at [CURRENCY] [AMOUNT] per hour, with a minimum of 1 hour per revision request.

4.3 Requests that alter the project scope, add new features, or change approved architecture constitute a "Change Order" and require a separate written agreement specifying the additional cost, timeline, and deliverables. The Developer will provide a Change Order estimate within 3 business days of receiving such a request.

4.4 The Developer is not obligated to begin work on any Change Order until the Client provides written approval and any required additional deposit.

5. INTELLECTUAL PROPERTY

5.1 UPON FULL PAYMENT of all fees due under this Agreement, the Developer assigns to the Client all rights, title, and interest in the custom code, designs, and content created specifically for this Project ("Client IP").

5.2 PRE-EXISTING IP: The Developer retains all rights to pre-existing code, frameworks, libraries, tools, and methodologies used in the Project ("Developer Tools"). The Developer grants the Client a non-exclusive, perpetual, royalty-free license to use the Developer Tools solely as integrated into the delivered Project.

5.3 OPEN-SOURCE: Any open-source software used in the Project is subject to its respective license terms. The Developer will provide a list of open-source dependencies upon request.

5.4 PORTFOLIO RIGHTS: The Developer retains the right to display the completed Project in their portfolio, website, and marketing materials, including screenshots, descriptions, and case studies, unless the Client provides written objection within 30 days of project completion.

5.5 No IP rights transfer until all payments are received in full. Until that time, the Developer retains all ownership rights.

6. CONFIDENTIALITY

6.1 Each Party agrees to keep confidential all non-public information disclosed by the other Party in connection with this Agreement ("Confidential Information") for a period of TWO (2) years from the date of disclosure.

6.2 Confidential Information does not include information that: (a) is or becomes publicly available through no fault of the receiving Party; (b) was known to the receiving Party prior to disclosure; (c) is independently developed without reference to the Confidential Information; or (d) is required to be disclosed by law.

7. TERMINATION

7.1 Either Party may terminate this Agreement with 14 days' written notice.

7.2 TERMINATION BY CLIENT: If the Client terminates without cause, the Client shall pay for all work completed to date plus a kill fee equal to 25% of the remaining unpaid contract value.

7.3 TERMINATION BY DEVELOPER: If the Developer terminates without cause, the Developer shall deliver all completed work to date and refund any prepaid fees for undelivered work.

7.4 TERMINATION FOR CAUSE: Either Party may terminate immediately if the other Party materially breaches this Agreement and fails to cure the breach within 10 business days of written notice.

7.5 Upon termination, Sections 5, 6, 8, and 9 survive.

8. WARRANTIES AND LIABILITY

8.1 The Developer warrants that: (a) the work will be performed in a professional manner consistent with industry standards; (b) the deliverables will substantially conform to the specifications in the SOW; and (c) the Developer has the right to enter into this Agreement.

8.2 The Developer provides a 30-day warranty period after final delivery during which bugs and defects in the delivered code will be fixed at no additional charge. This warranty does not cover issues caused by Client modifications, third-party services, or hosting environment changes.

8.3 LIMITATION OF LIABILITY: The Developer's total liability under this Agreement shall not exceed the total fees paid by the Client under this Agreement. In no event shall either Party be liable for indirect, incidental, consequential, or punitive damages.

9. INDEPENDENT CONTRACTOR

9.1 The Developer is an independent contractor, not an employee, partner, or agent of the Client. The Developer is solely responsible for their own taxes, insurance, and benefits.

9.2 The Developer retains the right to determine the manner and means of performing the services, including work hours, tools, and subcontractors (subject to confidentiality obligations).

10. DISPUTE RESOLUTION

10.1 Any disputes arising under this Agreement shall first be resolved through good-faith negotiation. If negotiation fails, the Parties agree to binding arbitration under the rules of [Arbitration Body] in [Jurisdiction].

10.2 This Agreement shall be governed by and construed in accordance with the laws of [State/Country].

11. GENERAL PROVISIONS

11.1 This Agreement constitutes the entire agreement between the Parties and supersedes all prior agreements.
11.2 This Agreement may only be amended in writing signed by both Parties.
11.3 If any provision is found unenforceable, the remaining provisions remain in full force.
11.4 Neither Party may assign this Agreement without the other Party's written consent.

IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date.

CLIENT:
Name: ___________________________
Signature: ______________________
Date: ___________________________

DEVELOPER:
Name: ___________________________
Signature: ______________________
Date: ___________________________`,
  },
  {
    id: 'graphic-design',
    name: 'Graphic Design Contract',
    category: 'Design',
    description: 'Professional design contract covering brand identity, marketing materials, UI/UX design work with revision caps and usage rights.',
    icon: Palette,
    content: `GRAPHIC DESIGN SERVICES AGREEMENT

This Graphic Design Services Agreement ("Agreement") is entered into as of [DATE] ("Effective Date") by and between:

CLIENT: [Client Name], located at [Client Address] ("Client")
DESIGNER: [Your Name / Business Name], located at [Your Address] ("Designer")

1. SCOPE OF SERVICES

1.1 The Designer agrees to provide the following design services ("Services"):
- [Describe deliverables: logo design, brand identity, marketing collateral, etc.]
- File formats to be delivered: [e.g., AI, PSD, PNG, SVG, PDF]
- Number of initial concepts: [e.g., 3 unique concepts]

1.2 The scope is strictly limited to the deliverables listed above. Additional design work, new deliverables, or modifications to the approved scope will require a written Change Order with additional fees.

1.3 The Client will provide all necessary content, brand guidelines, copy, and reference materials within [X] business days of the Effective Date. Delays in providing materials will extend the project timeline accordingly.

2. CREATIVE PROCESS

2.1 The design process follows these stages:
- Stage 1: Discovery & Creative Brief (Client provides direction, references, and preferences)
- Stage 2: Initial Concepts (Designer presents [X] unique concepts)
- Stage 3: Revision Rounds (refine the selected concept)
- Stage 4: Final Delivery (production-ready files)

2.2 The Client will select ONE concept to move forward with after Stage 2. Developing additional concepts beyond the initial presentation is subject to additional fees.

3. PAYMENT TERMS

3.1 Total Design Fee: [CURRENCY] [AMOUNT]

3.2 Payment Schedule:
- 50% deposit upon signing: [CURRENCY] [AMOUNT] (non-refundable)
- 50% upon final delivery: [CURRENCY] [AMOUNT]

3.3 For projects exceeding [CURRENCY] [THRESHOLD], payments will be structured in three installments: 40% deposit, 30% at concept approval, 30% at final delivery.

3.4 All invoices are due within 15 days of receipt. Late payments incur a 1.5% monthly interest charge.

3.5 Work will not commence until the deposit is received. Final deliverable files will not be released until full payment is received.

4. REVISIONS

4.1 This Agreement includes TWO (2) rounds of revisions on the selected concept. A "revision" means a modification that does not fundamentally change the approved design direction.

4.2 Additional revision rounds: [CURRENCY] [AMOUNT] per round.

4.3 Requests that constitute a new direction, new concept, or fundamental redesign are NOT revisions and will be quoted separately.

4.4 Revision requests must be consolidated into a single, written communication per round. The Designer is not obligated to address piecemeal feedback delivered across multiple emails or conversations.

5. INTELLECTUAL PROPERTY AND USAGE RIGHTS

5.1 UPON FULL PAYMENT, the Designer assigns to the Client all rights to the final approved design deliverables for the purposes specified in this Agreement.

5.2 The Designer retains all rights to preliminary concepts, sketches, and unused designs. These remain the property of the Designer and may not be used by the Client.

5.3 PORTFOLIO RIGHTS: The Designer retains the right to showcase the completed work in their portfolio, website, social media, and award submissions. The Client may request a 6-month embargo on portfolio display for confidential projects, communicated in writing before project start.

5.4 The Designer retains the right to be credited as the creator of the design work. Attribution is appreciated but not required for commercial use.

5.5 SOURCE FILES: Original editable source files (AI, PSD, Figma) are included in the deliverables unless otherwise specified. If excluded, source files may be purchased separately for [CURRENCY] [AMOUNT].

5.6 No IP transfers until all fees are paid in full.

6. CLIENT RESPONSIBILITIES

6.1 The Client is responsible for: (a) providing accurate and complete content and direction; (b) reviewing deliverables promptly within 5 business days; (c) obtaining any necessary licenses for Client-provided content (photos, fonts, copy); (d) ensuring the requested designs do not infringe on third-party rights.

6.2 The Designer is not liable for any claims arising from Client-provided content.

7. CONFIDENTIALITY

7.1 Both Parties agree to maintain the confidentiality of proprietary information shared during this engagement for a period of TWO (2) years following project completion.

7.2 The Designer will not share Client business strategies, unreleased products, or proprietary data with any third party.

8. TERMINATION

8.1 Either Party may terminate this Agreement with 14 days' written notice.

8.2 If the Client terminates: The deposit is non-refundable. The Client pays for all completed work at the Designer's hourly rate of [CURRENCY] [RATE]/hour, plus a kill fee of 20% of the remaining contract value.

8.3 If the Designer terminates: The Designer delivers all completed work and refunds prepaid fees for undelivered work.

8.4 Upon termination, the Client receives rights only to fully paid-for, completed deliverables.

9. WARRANTIES AND LIABILITY

9.1 The Designer warrants that all work is original and does not knowingly infringe on any third-party intellectual property rights.

9.2 The Designer does not warrant that the designs will achieve any specific business result.

9.3 LIABILITY CAP: The Designer's total liability shall not exceed the total fees paid under this Agreement. Neither Party shall be liable for consequential, incidental, or punitive damages.

10. INDEPENDENT CONTRACTOR

10.1 The Designer is an independent contractor. Nothing in this Agreement creates an employment, partnership, or agency relationship.

10.2 The Designer is responsible for their own taxes, insurance, equipment, and workspace.

11. DISPUTE RESOLUTION

11.1 Disputes shall be resolved first through good-faith negotiation, then through binding arbitration in [Jurisdiction] under [Arbitration Rules].

11.2 This Agreement is governed by the laws of [State/Country].

12. GENERAL

12.1 This Agreement constitutes the entire agreement between the Parties.
12.2 Amendments require written consent of both Parties.
12.3 If any provision is unenforceable, remaining provisions stay in effect.

SIGNATURES:

CLIENT:
Name: ___________________________
Signature: ______________________
Date: ___________________________

DESIGNER:
Name: ___________________________
Signature: ______________________
Date: ___________________________`,
  },
  {
    id: 'consulting',
    name: 'Consulting Agreement',
    category: 'Consulting',
    description: 'Professional consulting engagement contract with retainer options, deliverable specifications, and advisory liability protections.',
    icon: Briefcase,
    content: `CONSULTING SERVICES AGREEMENT

This Consulting Services Agreement ("Agreement") is entered into as of [DATE] ("Effective Date") by and between:

CLIENT: [Client Name / Company], located at [Address] ("Client")
CONSULTANT: [Your Name / Business Name], located at [Address] ("Consultant")

1. ENGAGEMENT AND SCOPE

1.1 The Client engages the Consultant to provide the following consulting services ("Services"):
- [Description of consulting services]
- [Specific deliverables, reports, recommendations]
- [Advisory areas: strategy, operations, technology, marketing, etc.]

1.2 The Consultant will provide Services in accordance with the Statement of Work attached as Exhibit A, which details specific deliverables, timelines, and success criteria.

1.3 The Consultant's role is advisory. The Client retains full decision-making authority regarding the implementation of any recommendations. The Consultant is not responsible for outcomes resulting from the Client's implementation decisions.

2. TERM

2.1 This Agreement begins on the Effective Date and continues for [X] months, unless terminated earlier per Section 8.

2.2 The Agreement may be renewed for additional terms upon mutual written agreement.

3. PAYMENT TERMS

3.1 Compensation Structure (select one):

OPTION A - Fixed Fee:
Total Fee: [CURRENCY] [AMOUNT]
Payment: 35% upon signing, 35% at midpoint, 30% upon completion.

OPTION B - Monthly Retainer:
Monthly Retainer: [CURRENCY] [AMOUNT]/month
Includes up to [X] hours of consulting per month. Additional hours billed at [CURRENCY] [RATE]/hour.
Retainer is due on the 1st of each month.

OPTION C - Hourly:
Hourly Rate: [CURRENCY] [RATE]/hour
Billed in 15-minute increments. Monthly invoices with detailed time logs.

3.2 A non-refundable deposit of [CURRENCY] [AMOUNT] is due upon signing to secure the engagement.

3.3 Invoices are payable within 15 days. Late payments accrue interest at 1.5% per month.

3.4 EXPENSES: Pre-approved travel, accommodation, and out-of-pocket expenses will be reimbursed at cost with receipts. Expenses exceeding [CURRENCY] [AMOUNT] require prior written approval.

3.5 The Consultant reserves the right to suspend Services if any invoice remains unpaid for more than 30 days.

4. DELIVERABLES

4.1 The Consultant shall deliver the following:
- [Deliverable 1: e.g., Market Analysis Report]
- [Deliverable 2: e.g., Strategic Recommendations Document]
- [Deliverable 3: e.g., Implementation Roadmap]
- [Deliverable 4: e.g., Monthly Progress Reports]

4.2 Deliverables will be provided in [format: PDF, PowerPoint, Google Docs, etc.].

4.3 The Client shall review deliverables within 7 business days and provide consolidated feedback. Failure to respond within this period constitutes acceptance.

5. INTELLECTUAL PROPERTY

5.1 CLIENT DELIVERABLES: Upon full payment, the Client owns all rights to custom reports, analyses, and recommendations created specifically for this engagement ("Work Product").

5.2 CONSULTANT'S TOOLS: The Consultant retains all rights to pre-existing methodologies, frameworks, templates, tools, and general knowledge ("Consultant IP"). The Client receives a non-exclusive license to use Consultant IP as incorporated into the Work Product.

5.3 The Consultant may use anonymized, aggregated insights from this engagement for their own research, publications, and future consulting work, provided no Confidential Information is disclosed.

5.4 PORTFOLIO: The Consultant may reference the Client by name and describe the nature of the engagement in marketing materials, unless the Client provides written objection.

6. CONFIDENTIALITY

6.1 Both Parties agree to maintain strict confidentiality of all proprietary and non-public information ("Confidential Information") for THREE (3) years from the date of disclosure.

6.2 Confidential Information includes but is not limited to: business strategies, financial data, customer lists, trade secrets, internal processes, and any information marked as confidential.

6.3 Exceptions: Information that is (a) publicly available, (b) independently developed, (c) received from a third party without restriction, or (d) required by law to be disclosed.

6.4 The Consultant may engage subcontractors subject to equivalent confidentiality obligations, with prior Client approval.

7. NON-SOLICITATION

7.1 During the term and for 12 months after, neither Party shall directly solicit the other Party's employees for employment. This does not restrict hiring through general public job postings.

8. TERMINATION

8.1 Either Party may terminate with 30 days' written notice.

8.2 CLIENT TERMINATION: The Client pays for all work completed to date plus a kill fee of 25% of remaining contract value (fixed fee) or one month's retainer (retainer arrangement).

8.3 CONSULTANT TERMINATION: The Consultant delivers all completed work and refunds prepaid fees for undelivered services.

8.4 IMMEDIATE TERMINATION: Either Party may terminate immediately for material breach, insolvency, or illegal activity.

8.5 Post-termination, Sections 5, 6, 7, and 9 survive.

9. LIABILITY AND INDEMNIFICATION

9.1 ADVISORY NATURE: The Consultant provides advice and recommendations. The Client acknowledges that consulting outcomes depend on numerous factors beyond the Consultant's control, including market conditions, Client decisions, and implementation quality.

9.2 LIABILITY CAP: The Consultant's total aggregate liability shall not exceed the total fees paid under this Agreement during the 12-month period preceding the claim.

9.3 EXCLUSION: Neither Party shall be liable for indirect, incidental, consequential, punitive, or lost profit damages.

9.4 Each Party shall indemnify the other against claims arising from their own negligence or breach of this Agreement.

10. INDEPENDENT CONTRACTOR

10.1 The Consultant is an independent contractor. This Agreement does not create employment, agency, or partnership.

10.2 The Consultant controls their own schedule, methods, and workplace. The Client may not direct the manner of performance, only the desired outcomes.

10.3 The Consultant is responsible for their own taxes, insurance, benefits, and business expenses.

11. FORCE MAJEURE

11.1 Neither Party is liable for delays caused by events beyond reasonable control, including natural disasters, pandemics, government actions, or infrastructure failures.

12. GOVERNING LAW AND DISPUTES

12.1 This Agreement is governed by the laws of [State/Country].
12.2 Disputes will be resolved through negotiation, then mediation, then binding arbitration.

13. ENTIRE AGREEMENT

13.1 This Agreement, including any attached SOW, constitutes the entire agreement.
13.2 Amendments require written consent of both Parties.

SIGNATURES:

CLIENT:
Name: ___________________________
Title: ___________________________
Signature: ______________________
Date: ___________________________

CONSULTANT:
Name: ___________________________
Signature: ______________________
Date: ___________________________`,
  },
  {
    id: 'content-writing',
    name: 'Content Writing Contract',
    category: 'Marketing',
    description: 'Contract for writers and copywriters covering blog posts, website copy, and content marketing with clear word counts and revision terms.',
    icon: PenTool,
    content: `CONTENT WRITING SERVICES AGREEMENT

This Content Writing Services Agreement ("Agreement") is entered into as of [DATE] ("Effective Date") by and between:

CLIENT: [Client Name / Company], located at [Address] ("Client")
WRITER: [Your Name / Business Name], located at [Address] ("Writer")

1. SCOPE OF SERVICES

1.1 The Writer agrees to create the following written content ("Content"):
- [Type of content: blog posts, website copy, email sequences, whitepapers, etc.]
- [Number of pieces: e.g., 8 blog posts, 5 landing pages]
- [Word count per piece: e.g., 1,500-2,000 words per blog post]
- [Topics/subject areas: e.g., SaaS marketing, fintech, health & wellness]

1.2 Content specifications:
- Tone and voice: [e.g., professional, conversational, authoritative]
- Target audience: [e.g., B2B decision-makers, consumers aged 25-40]
- SEO requirements: [e.g., primary keyword, secondary keywords, meta descriptions]
- Format: [e.g., Google Docs with suggested headings and formatting]

1.3 The Client will provide: brand guidelines, topic briefs, target keywords, reference materials, and access to any necessary resources within 5 business days of the Effective Date.

2. DELIVERY SCHEDULE

2.1 Content will be delivered according to the following schedule:
- [X] pieces per week/month
- First draft delivery: within [X] business days of receiving the brief
- Final delivery (after revisions): within [X] business days of receiving feedback

2.2 Rush orders (less than 48 hours turnaround) are subject to a 50% rush fee surcharge.

2.3 The Writer will notify the Client promptly if any delivery will be delayed.

3. PAYMENT TERMS

3.1 Compensation:

OPTION A - Per Piece: [CURRENCY] [AMOUNT] per piece of content
OPTION B - Per Word: [CURRENCY] [AMOUNT] per word
OPTION C - Monthly Retainer: [CURRENCY] [AMOUNT]/month for [X] pieces

3.2 Payment Schedule:
- 50% deposit upon signing this Agreement
- 50% upon delivery of each batch/monthly invoice

3.3 Invoices are due within 15 days of receipt. Late payments incur a 1.5% monthly interest charge.

3.4 KILL FEE: Content assignments that are cancelled after the Writer has begun work will be paid at 50% of the agreed rate for that piece.

3.5 Work will not commence until the deposit is received.

4. REVISIONS

4.1 Each content piece includes TWO (2) rounds of revisions at no additional cost.

4.2 Revision requests must be submitted within 7 business days of delivery. After 7 business days, the content is deemed accepted.

4.3 A "revision" is a change that aligns with the original brief. Requests that change the topic, angle, audience, or fundamentally alter the approved direction constitute a rewrite and will be billed as a new piece.

4.4 Additional revision rounds: [CURRENCY] [AMOUNT] per round per piece.

5. INTELLECTUAL PROPERTY

5.1 UPON FULL PAYMENT, the Writer assigns all rights to the delivered Content to the Client, including the right to publish, modify, and distribute the Content under the Client's name.

5.2 GHOSTWRITING: Unless otherwise agreed, the Content is produced as ghostwritten work. The Client may publish under any byline.

5.3 PORTFOLIO RIGHTS: The Writer retains the right to use the Content (or excerpts) in their portfolio as writing samples. If the Content is ghostwritten or confidential, the Writer may display it in a password-protected portfolio or describe the work without disclosing the Client's identity.

5.4 PRE-EXISTING WORK: If the Writer incorporates any pre-existing material, the Writer grants the Client a perpetual license to use that material as part of the Content.

5.5 No rights transfer until full payment is received.

6. ORIGINALITY AND ACCURACY

6.1 The Writer warrants that all Content is original and does not plagiarize or infringe upon any third-party intellectual property rights.

6.2 The Writer will conduct reasonable research to ensure factual accuracy but is not liable for errors in Client-provided information or rapidly changing data.

6.3 The Client is responsible for final fact-checking and legal review before publication.

6.4 The Writer will not use AI-generated content as final copy unless explicitly agreed. Research assistance tools may be used for brainstorming and research, with all final writing done by the Writer.

7. CONFIDENTIALITY

7.1 The Writer agrees to keep all Client information, strategies, unpublished content, and business data confidential for TWO (2) years following the end of this Agreement.

7.2 The Writer will not disclose the Client relationship without permission, except for portfolio purposes as described in Section 5.3.

8. TERMINATION

8.1 Either Party may terminate this Agreement with 14 days' written notice.

8.2 Upon termination by Client: The Client pays for all completed Content plus the kill fee (Section 3.4) for any content in progress.

8.3 Upon termination by Writer: The Writer delivers all completed Content and refunds prepaid fees for undelivered work.

8.4 The Client receives rights only to Content that has been fully paid for.

9. LIABILITY

9.1 The Writer's total liability under this Agreement shall not exceed the total fees paid during the 6-month period preceding any claim.

9.2 The Writer is not liable for any business outcomes, SEO rankings, conversion rates, or marketing results arising from the Content.

9.3 Neither Party shall be liable for indirect, consequential, or punitive damages.

10. INDEPENDENT CONTRACTOR

10.1 The Writer is an independent contractor, not an employee of the Client.

10.2 The Writer is responsible for their own taxes, insurance, and business expenses.

10.3 The Writer may take on other clients during this engagement, provided there is no conflict of interest with the Client's business.

11. EXCLUSIVITY AND NON-COMPETE

11.1 This Agreement is NON-EXCLUSIVE unless otherwise agreed in writing.

11.2 The Writer is free to provide similar services to other clients, including clients in the same industry, unless a separate exclusivity agreement is executed with additional compensation.

12. GOVERNING LAW

12.1 This Agreement is governed by the laws of [State/Country].
12.2 Disputes shall be resolved through good-faith negotiation, followed by mediation, then binding arbitration.

13. ENTIRE AGREEMENT

13.1 This Agreement constitutes the complete agreement between the Parties.
13.2 Amendments must be in writing and signed by both Parties.

SIGNATURES:

CLIENT:
Name: ___________________________
Signature: ______________________
Date: ___________________________

WRITER:
Name: ___________________________
Signature: ______________________
Date: ___________________________`,
  },
  {
    id: 'mobile-app',
    name: 'Mobile App Development',
    category: 'Web Development',
    description: 'Contract for iOS and Android app development projects with platform-specific deliverables, app store submission terms, and maintenance periods.',
    icon: Smartphone,
    content: `MOBILE APPLICATION DEVELOPMENT AGREEMENT

This Mobile Application Development Agreement ("Agreement") is entered into as of [DATE] ("Effective Date") by and between:

CLIENT: [Client Name / Company], located at [Address] ("Client")
DEVELOPER: [Your Name / Business Name], located at [Address] ("Developer")

1. SCOPE OF WORK

1.1 The Developer agrees to design, develop, test, and deliver a mobile application ("App") with the following specifications:
- App Name: [App Name]
- Platforms: [iOS / Android / Both (Cross-Platform)]
- Technology: [e.g., React Native, Flutter, Swift, Kotlin]
- Target Devices: [e.g., iPhone 12+, Android 10+]
- Key Features: [List core features and functionality]

1.2 Detailed specifications are set forth in the attached Product Requirements Document (PRD) / Statement of Work (SOW), which is incorporated by reference.

1.3 The scope includes:
- UI/UX design for all screens
- Front-end development
- Back-end API development (if applicable)
- Integration with third-party services: [e.g., payment gateways, analytics, push notifications]
- Testing on [X] devices per platform
- App Store / Google Play submission (first submission only)

1.4 The scope EXCLUDES:
- Ongoing maintenance after the warranty period
- Server/hosting costs (Client responsibility)
- Third-party API subscription fees
- App Store / Google Play developer account fees
- Marketing and ASO (App Store Optimization)
- Content creation (copy, images, videos)

2. PROJECT PHASES AND TIMELINE

2.1 Estimated total timeline: [X] weeks/months

Phase 1 - Discovery & Planning: [X] weeks
Phase 2 - UI/UX Design: [X] weeks
Phase 3 - Development Sprint 1 (Core Features): [X] weeks
Phase 4 - Development Sprint 2 (Secondary Features): [X] weeks
Phase 5 - QA Testing & Bug Fixes: [X] weeks
Phase 6 - App Store Submission & Launch: [X] weeks

2.2 Each phase requires Client sign-off before proceeding. Client must provide feedback within 5 business days.

2.3 The Developer will provide access to a beta/test version via TestFlight (iOS) or internal testing (Android) during Phase 5.

3. PAYMENT TERMS

3.1 Total Project Fee: [CURRENCY] [AMOUNT]

3.2 Payment Schedule:
- 30% deposit upon signing: [CURRENCY] [AMOUNT]
- 25% upon design approval (Phase 2 completion): [CURRENCY] [AMOUNT]
- 25% upon development completion (Phase 4 completion): [CURRENCY] [AMOUNT]
- 20% upon app store submission and launch: [CURRENCY] [AMOUNT]

3.3 All invoices are due within 15 days of receipt.

3.4 LATE PAYMENT: Overdue invoices accrue 1.5% monthly interest. The Developer may suspend work and access to staging environments after 15 days of non-payment.

3.5 APP STORE REJECTIONS: If the App is rejected by Apple or Google for reasons related to the Developer's work, the Developer will address the rejection at no additional cost (up to 2 resubmissions). Rejections due to Client content, policy violations outside the Developer's control, or Client-requested features that violate store policies are the Client's responsibility.

4. REVISIONS AND CHANGES

4.1 Design Phase: TWO (2) rounds of revisions per screen/flow.
4.2 Development Phase: Bug fixes are unlimited during development. Feature changes require a Change Order.

4.3 CHANGE ORDERS: Any modification to the approved specifications that adds features, alters functionality, or changes the technical architecture requires a written Change Order specifying scope, cost, and timeline impact. The Developer will provide estimates within 5 business days.

4.4 Feature Creep Protection: The Developer reserves the right to decline changes that would compromise app stability, security, or the agreed timeline without adequate schedule adjustment.

5. INTELLECTUAL PROPERTY

5.1 UPON FULL PAYMENT, the Developer assigns to the Client all rights to the custom App code, UI designs, and assets created specifically for this Project.

5.2 DEVELOPER TOOLS: The Developer retains ownership of reusable components, libraries, and development tools. A perpetual, non-exclusive license is granted to the Client for these components as used within the App.

5.3 THIRD-PARTY COMPONENTS: Open-source libraries and third-party SDKs are subject to their respective licenses. The Developer will provide a complete dependency list.

5.4 APP STORE ACCOUNTS: The App will be published under the Client's developer account. The Client is responsible for maintaining the account and paying annual fees.

5.5 PORTFOLIO: The Developer may showcase the App in their portfolio with screenshots, descriptions, and case studies.

5.6 SOURCE CODE: Full source code repository access will be transferred to the Client upon final payment, including documentation and setup instructions.

5.7 No IP rights transfer until all payments are received in full.

6. WARRANTIES AND MAINTENANCE

6.1 WARRANTY PERIOD: The Developer provides a 60-day warranty following App Store approval during which bugs and defects will be fixed at no additional cost.

6.2 The warranty covers defects in the Developer's code. It does NOT cover:
- Issues caused by OS updates released after launch
- Third-party API or service changes
- Client modifications to the codebase
- New feature requests
- Performance issues caused by Client's hosting/server infrastructure

6.3 POST-WARRANTY MAINTENANCE: Ongoing maintenance and support are available under a separate Maintenance Agreement at [CURRENCY] [AMOUNT]/month, covering bug fixes, minor updates, and OS compatibility updates.

7. CONFIDENTIALITY

7.1 Both Parties agree to maintain confidentiality of all proprietary information for THREE (3) years from the Effective Date.

7.2 The Developer will not disclose the App concept, business model, or proprietary features to third parties.

8. TERMINATION

8.1 Either Party may terminate with 21 days' written notice.

8.2 CLIENT TERMINATION: Client pays for all completed work plus a kill fee of 25% of remaining contract value. Upon payment, Client receives all completed work and source code.

8.3 DEVELOPER TERMINATION: Developer delivers all completed work and source code, refunds prepaid fees for undelivered phases.

8.4 Sections 5, 6, 7, and 9 survive termination.

9. LIABILITY

9.1 LIABILITY CAP: The Developer's total liability shall not exceed the fees paid under this Agreement.

9.2 The Developer is not liable for: App Store policy changes, third-party service outages, data breaches caused by Client infrastructure, or revenue/user acquisition targets.

9.3 Neither Party is liable for indirect, consequential, or punitive damages.

10. INDEPENDENT CONTRACTOR

10.1 The Developer is an independent contractor, not an employee or agent of the Client.
10.2 The Developer is responsible for their own taxes, insurance, and equipment.

11. GOVERNING LAW

11.1 This Agreement is governed by the laws of [State/Country].
11.2 Disputes: Negotiation, then mediation, then binding arbitration in [Jurisdiction].

SIGNATURES:

CLIENT:
Name: ___________________________
Title: ___________________________
Signature: ______________________
Date: ___________________________

DEVELOPER:
Name: ___________________________
Signature: ______________________
Date: ___________________________`,
  },
  {
    id: 'general-freelance',
    name: 'General Freelance Agreement',
    category: 'General',
    description: 'A versatile catch-all freelance contract template adaptable to any type of freelance engagement with comprehensive protective clauses.',
    icon: FileCheck,
    content: `GENERAL FREELANCE SERVICES AGREEMENT

This Freelance Services Agreement ("Agreement") is entered into as of [DATE] ("Effective Date") by and between:

CLIENT: [Client Name / Company], located at [Address] ("Client")
FREELANCER: [Your Name / Business Name], located at [Address] ("Freelancer")

RECITALS: The Client wishes to engage the Freelancer to provide certain professional services, and the Freelancer agrees to perform such services under the terms and conditions set forth in this Agreement.

1. SERVICES

1.1 The Freelancer agrees to provide the following services ("Services"):
- [Describe the services to be provided]
- [List specific deliverables]
- [Define measurable outcomes where applicable]

1.2 A detailed description of Services, deliverables, milestones, and acceptance criteria is provided in the attached Statement of Work (SOW), Exhibit A.

1.3 SCOPE BOUNDARIES: The Freelancer's obligations are limited to the Services described in this Agreement and any attached SOW. Work outside this scope requires a written Change Order signed by both Parties, specifying additional fees and timeline adjustments.

1.4 The Client will provide all necessary information, access, materials, and feedback within the timelines specified in the SOW. Delays by the Client will extend project deadlines by the equivalent duration.

2. TERM

2.1 This Agreement is effective from the Effective Date and continues until completion of the Services, or until terminated per Section 8, whichever occurs first.

2.2 For ongoing engagements, the initial term is [X] months, automatically renewing for successive [X]-month periods unless either Party provides 30 days' written notice before the end of the current term.

3. PAYMENT

3.1 Compensation:
Total Fee: [CURRENCY] [AMOUNT]
OR
Hourly Rate: [CURRENCY] [AMOUNT]/hour (billed in 15-minute increments)
OR
Monthly Retainer: [CURRENCY] [AMOUNT]/month

3.2 DEPOSIT: A non-refundable deposit of [PERCENTAGE]% ([CURRENCY] [AMOUNT]) is due upon signing before any work commences.

3.3 PAYMENT SCHEDULE:
- For fixed-fee projects: payments tied to milestones as defined in the SOW
- For hourly engagements: bi-weekly or monthly invoices with detailed time logs
- For retainers: due on the 1st of each month, in advance

3.4 PAYMENT METHOD: [Bank transfer / PayPal / Wise / Stripe / Check]

3.5 DUE DATE: All invoices are payable within 15 days of receipt.

3.6 LATE PAYMENT PENALTIES:
- 1-15 days overdue: 1.5% interest charge
- 16-30 days overdue: Work suspension notice sent; 1.5% monthly interest continues
- 31+ days overdue: Work suspended; Freelancer retains all deliverables; all outstanding fees plus interest become immediately due

3.7 The Client is responsible for all applicable taxes, bank fees, and currency conversion costs.

3.8 The Freelancer reserves the right to adjust rates with 30 days' written notice for ongoing engagements.

4. REVISIONS AND APPROVALS

4.1 This Agreement includes [TWO/THREE] ([2/3]) rounds of revisions per deliverable, at no additional cost.

4.2 Revision requests must be submitted in writing within 7 business days of deliverable submission. After 7 business days without feedback, the deliverable is deemed approved.

4.3 Each revision round must be submitted as a consolidated, single communication. The Freelancer is not obligated to act on piecemeal feedback.

4.4 Additional revisions: [CURRENCY] [AMOUNT] per hour, billed in 1-hour minimums.

4.5 SCOPE CHANGES vs. REVISIONS: A revision modifies existing approved work within the original brief. A scope change adds new requirements, features, or deliverables. Scope changes require a Change Order.

5. INTELLECTUAL PROPERTY

5.1 ASSIGNMENT: Upon receipt of full payment for the applicable deliverable, the Freelancer assigns to the Client all rights, title, and interest in the custom work created specifically for the Client ("Work Product").

5.2 PRIOR TO FULL PAYMENT: The Freelancer retains all rights to the Work Product. The Client may not use, publish, or distribute any deliverables until all associated fees are paid.

5.3 PRE-EXISTING IP: The Freelancer retains all rights to tools, methodologies, templates, code libraries, and materials that existed before or were developed independently of this engagement ("Freelancer IP"). The Client receives a non-exclusive, perpetual license to use Freelancer IP solely as incorporated into the Work Product.

5.4 PORTFOLIO RIGHTS: The Freelancer retains the irrevocable right to display completed work in their professional portfolio, website, case studies, social media, and award submissions, including describing the nature of the engagement and showing visual samples.

5.5 ATTRIBUTION: The Freelancer may include a small credit or link in the delivered work (e.g., "Designed by [Name]") unless the Client requests removal in writing.

5.6 THIRD-PARTY MATERIALS: Any stock photos, fonts, plugins, or third-party assets used will be properly licensed. License fees, if any, are the Client's responsibility unless otherwise agreed.

6. CONFIDENTIALITY

6.1 Both Parties agree to keep confidential all non-public information exchanged during this engagement ("Confidential Information") for TWO (2) years following the termination or completion of this Agreement.

6.2 Confidential Information includes: business plans, customer data, financial information, trade secrets, unreleased product details, and any information marked or reasonably understood to be confidential.

6.3 EXCEPTIONS: This obligation does not apply to information that is: (a) publicly available; (b) independently developed; (c) received from a third party without restriction; (d) already known before disclosure; or (e) required by law or court order (with prompt notice to the disclosing Party).

6.4 The Freelancer may disclose the existence of the Client relationship for marketing purposes, unless the Client objects in writing.

7. INDEPENDENT CONTRACTOR STATUS

7.1 The Freelancer is an independent contractor. Nothing in this Agreement creates an employer-employee, partnership, joint venture, or agency relationship.

7.2 The Freelancer:
- Controls their own schedule, methods, tools, and work environment
- May hire subcontractors (bound by equivalent confidentiality obligations)
- Is responsible for their own taxes, insurance, retirement, and benefits
- May work for other clients simultaneously, including competitors (unless a separate exclusivity agreement exists)

7.3 The Client shall not:
- Provide the Freelancer with employee benefits
- Withhold taxes from payments
- Require the Freelancer to work specific hours or from specific locations
- Restrict the Freelancer from taking on other work

8. TERMINATION

8.1 Either Party may terminate this Agreement with 14 days' written notice for any reason.

8.2 TERMINATION BY CLIENT WITHOUT CAUSE:
- All completed work must be paid for in full
- Kill fee: 25% of remaining unpaid contract value
- All invoices become immediately due
- Upon payment, Client receives rights to completed work only

8.3 TERMINATION BY FREELANCER WITHOUT CAUSE:
- Freelancer delivers all completed work
- Freelancer refunds prepaid fees for undelivered work
- Freelancer provides reasonable transition support (up to 5 hours)

8.4 TERMINATION FOR CAUSE:
- Either Party may terminate immediately upon material breach
- The breaching Party must be given 10 business days to cure after written notice
- Non-payment for 30+ days constitutes material breach by the Client

8.5 SURVIVAL: Sections 5, 6, 9, and 10 survive termination.

9. LIABILITY AND WARRANTIES

9.1 The Freelancer warrants that: (a) Services will be performed professionally; (b) Work Product will be original; (c) the Freelancer has the right to enter this Agreement.

9.2 THE FREELANCER DOES NOT WARRANT specific business results, revenue, traffic, rankings, or outcomes from the work.

9.3 LIABILITY CAP: The Freelancer's total aggregate liability shall not exceed the total fees paid by the Client under this Agreement during the 12-month period preceding the claim.

9.4 EXCLUSION: Neither Party shall be liable for indirect, incidental, consequential, special, or punitive damages, including lost profits or business opportunities.

9.5 INDEMNIFICATION: Each Party indemnifies the other against third-party claims arising from their own negligence, breach, or willful misconduct.

10. DISPUTE RESOLUTION

10.1 INFORMAL RESOLUTION: The Parties will attempt to resolve disputes through good-faith negotiation within 30 days.

10.2 MEDIATION: If negotiation fails, the Parties agree to non-binding mediation.

10.3 ARBITRATION: If mediation fails, disputes will be resolved through binding arbitration in [Jurisdiction/City] under [Arbitration Rules].

10.4 GOVERNING LAW: This Agreement is governed by the laws of [State/Country].

10.5 PREVAILING PARTY: The prevailing Party in any dispute is entitled to recover reasonable attorney fees and costs.

11. FORCE MAJEURE

11.1 Neither Party is liable for delays or failure to perform due to circumstances beyond reasonable control, including natural disasters, pandemics, war, government actions, internet outages, or power failures.

12. GENERAL PROVISIONS

12.1 ENTIRE AGREEMENT: This Agreement, including any SOW, constitutes the complete agreement and supersedes all prior discussions.
12.2 AMENDMENTS: Changes require written agreement signed by both Parties.
12.3 SEVERABILITY: If any provision is unenforceable, the remainder stays in effect.
12.4 ASSIGNMENT: Neither Party may assign without written consent.
12.5 NOTICES: All notices must be in writing via email to the addresses listed above.
12.6 WAIVER: Failure to enforce any right is not a waiver of future enforcement.

IN WITNESS WHEREOF, the Parties execute this Agreement as of the Effective Date.

CLIENT:
Name: ___________________________
Title: ___________________________
Company: ________________________
Email: ___________________________
Signature: ______________________
Date: ___________________________

FREELANCER:
Name: ___________________________
Business: _______________________
Email: ___________________________
Signature: ______________________
Date: ___________________________`,
  },
];

const CATEGORIES: Category[] = ['All', 'Web Development', 'Design', 'Consulting', 'Marketing', 'General'];

const CATEGORY_COLORS: Record<string, string> = {
  'Web Development': 'bg-blue-50 text-blue-700',
  Design: 'bg-pink-50 text-pink-700',
  Consulting: 'bg-amber-50 text-amber-700',
  Marketing: 'bg-green-50 text-green-700',
  General: 'bg-purple-50 text-purple-700',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function TemplatesPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = TEMPLATES;
    if (activeCategory !== 'All') {
      result = result.filter((t) => t.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [activeCategory, search]);

  const copyTemplate = async (template: Template) => {
    try {
      await navigator.clipboard.writeText(template.content);
      setCopiedId(template.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = template.content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedId(template.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const analyzeTemplate = (template: Template) => {
    // Store template in localStorage for the analyze page to pick up
    localStorage.setItem('dealwise_template_text', template.content);
    router.push('/analyze?source=template');
  };

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-white">
      <Nav />

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Contract Templates
            </h1>
            <p className="mt-2 max-w-2xl text-base text-gray-500">
              Freelancer-friendly templates you can use and customize. Each template includes
              comprehensive clauses that protect your interests.
            </p>
          </motion.div>
        </div>

        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="mr-1 h-4 w-4 text-gray-400" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-200 hover:text-gray-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 sm:w-64"
            />
          </div>
        </motion.div>

        {/* Template Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FileText className="mb-4 h-12 w-12 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">No templates found</p>
            <p className="text-sm text-gray-400">Try a different category or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((template, i) => {
                const Icon = template.icon;
                const catColor = CATEGORY_COLORS[template.category] || 'bg-gray-50 text-gray-700';

                return (
                  <motion.div
                    key={template.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${catColor}`}>
                        {template.category}
                      </span>
                    </div>

                    <h3 className="mb-2 text-lg font-semibold text-gray-900">{template.name}</h3>
                    <p className="mb-6 flex-1 text-sm leading-relaxed text-gray-500">
                      {template.description}
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => copyTemplate(template)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900"
                      >
                        {copiedId === template.id ? (
                          <>
                            <Check className="h-4 w-4 text-emerald-500" />
                            <span className="text-emerald-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Use Template
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => analyzeTemplate(template)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
                      >
                        <ArrowRight className="h-4 w-4" />
                        Analyze
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 rounded-2xl border border-gray-200 bg-indigo-50 p-8 text-center"
        >
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Have your own contract?
          </h3>
          <p className="mb-5 text-sm text-gray-500">
            Paste any contract into our analyzer to get a detailed score and negotiation recommendations.
          </p>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg"
          >
            Analyze a Contract
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </main>
    </div>
    </ProtectedRoute>
  );
}
