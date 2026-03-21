import Nav from '@/components/Nav';

export const metadata = {
  title: 'Terms of Service - DEALWISE',
  description: 'Terms and conditions for using DEALWISE.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />

      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-gray-400">
            Effective date: March 2026
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-gray-600">
            Please read these Terms of Service (&ldquo;Terms&rdquo;) carefully before using DEALWISE.
            These Terms govern your access to and use of the service. By accessing or using DEALWISE,
            you agree to be bound by these Terms.
          </p>
        </header>

        <div className="space-y-10 text-[15px] leading-relaxed text-gray-600">
          {/* Section 1 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using DEALWISE (the &ldquo;Service&rdquo;), you acknowledge that you have read,
              understood, and agree to be bound by these Terms of Service and our{' '}
              <a
                href="/privacy"
                className="text-gray-900 underline decoration-gray-300 underline-offset-2 transition-colors hover:decoration-gray-900"
              >
                Privacy Policy
              </a>
              . If you do not agree to these Terms, you must not access or use the Service. If you are using
              the Service on behalf of an organization, you represent and warrant that you have the authority
              to bind that organization to these Terms.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              2. Description of Service
            </h2>
            <p>
              DEALWISE is an AI-powered contract analysis tool designed for freelancers and independent
              professionals. The Service analyzes contract text to identify potential red flags, missing
              protections, scope creep risks, unfavorable clauses, and calculates effective hourly rates.
              The Service uses artificial intelligence, including third-party AI models, to perform its analysis.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              3. Important Disclaimer: Not Legal Advice
            </h2>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4">
              <p className="font-semibold text-amber-900">
                DEALWISE IS NOT A LAW FIRM AND DOES NOT PROVIDE LEGAL ADVICE.
              </p>
              <p className="mt-2 text-amber-800">
                The analysis, scores, recommendations, and any other output provided by DEALWISE are for
                informational purposes only and do not constitute legal advice, legal opinions, or legal
                recommendations. The Service is <strong>not a substitute for professional legal counsel</strong>.
                You should always consult with a qualified attorney licensed in your jurisdiction before making
                any legal decisions, signing contracts, or taking action based on the information provided by
                the Service. DEALWISE does not guarantee the accuracy, completeness, or reliability of its
                analysis. Reliance on the Service&apos;s output is at your own risk.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              4. User Responsibilities
            </h2>
            <p className="mb-3">
              By using the Service, you agree to the following:
            </p>
            <ul className="ml-5 list-disc space-y-2">
              <li>
                You will not submit any contract text or other content that is illegal, fraudulent, defamatory,
                obscene, or otherwise objectionable.
              </li>
              <li>
                You represent and warrant that you have the legal right to submit any contract text you upload
                for analysis. You must either be a party to the contract or have obtained appropriate authorization
                from the relevant parties to share the contract content.
              </li>
              <li>
                You will not attempt to reverse-engineer, decompile, disassemble, or otherwise attempt to derive
                the source code or underlying algorithms of the Service.
              </li>
              <li>
                You will not use the Service to process contracts for any unlawful purpose or in violation of
                any applicable laws or regulations.
              </li>
              <li>
                You will not use automated scripts, bots, or other automated means to access or interact with
                the Service without our prior written consent.
              </li>
              <li>
                You are solely responsible for any decisions you make based on the Service&apos;s analysis output.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              5. Account Terms
            </h2>
            <ul className="ml-5 list-disc space-y-2">
              <li>
                To access certain features of the Service, you may be required to create an account using a
                valid email address and password.
              </li>
              <li>
                You agree to provide accurate, current, and complete information during the registration
                process and to keep your account information updated.
              </li>
              <li>
                You are responsible for maintaining the confidentiality of your account credentials and for
                all activities that occur under your account.
              </li>
              <li>
                You must notify us immediately at{' '}
                <a
                  href="mailto:support@dealwise.app"
                  className="text-gray-900 underline decoration-gray-300 underline-offset-2 transition-colors hover:decoration-gray-900"
                >
                  support@dealwise.app
                </a>{' '}
                if you suspect any unauthorized use of your account.
              </li>
              <li>
                We reserve the right to suspend or terminate accounts that violate these Terms or that have
                been inactive for an extended period.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              6. Intellectual Property
            </h2>
            <ul className="ml-5 list-disc space-y-2">
              <li>
                <strong className="text-gray-800">Our Service.</strong>{' '}
                The Service, including its design, features, code, algorithms, documentation, trademarks, and
                all related intellectual property, is and remains the exclusive property of DEALWISE and its
                licensors. These Terms do not grant you any right, title, or interest in the Service beyond
                the limited right to use it in accordance with these Terms.
              </li>
              <li>
                <strong className="text-gray-800">Your Content.</strong>{' '}
                You retain all rights to the contract text and other content you submit to the Service. By
                submitting content, you grant us a limited, non-exclusive, temporary license to process that
                content solely for the purpose of providing the analysis you requested. This license terminates
                immediately upon completion of the analysis.
              </li>
              <li>
                <strong className="text-gray-800">Analysis Output.</strong>{' '}
                The analysis results generated by the Service are provided to you for your personal or
                internal business use. You may not redistribute, resell, or publicly display the analysis
                output in a manner that competes with the Service.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              7. Limitation of Liability
            </h2>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-5 py-4">
              <p className="mb-3">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, DEALWISE AND ITS OFFICERS, DIRECTORS,
                EMPLOYEES, AGENTS, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
                CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA,
                BUSINESS OPPORTUNITIES, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF OR
                INABILITY TO USE THE SERVICE.
              </p>
              <p className="mb-3">
                Without limiting the foregoing, DEALWISE shall not be liable for any decisions you make,
                contracts you sign, or actions you take based on the analysis, scores, recommendations, or
                any other output provided by the Service. The Service&apos;s analysis is informational only
                and should not be the sole basis for any contractual, financial, or legal decision.
              </p>
              <p>
                IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATING TO
                THESE TERMS OR THE SERVICE EXCEED THE AMOUNT YOU HAVE PAID US IN THE TWELVE (12) MONTHS
                PRECEDING THE EVENT GIVING RISE TO THE LIABILITY, OR ONE HUNDRED U.S. DOLLARS (USD $100),
                WHICHEVER IS GREATER.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              8. Disclaimer of Warranties
            </h2>
            <p>
              THE SERVICE IS PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS WITHOUT
              WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES
              OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, AND NON-INFRINGEMENT. WE DO NOT
              WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE OF VIRUSES OR OTHER
              HARMFUL COMPONENTS. WE MAKE NO WARRANTIES REGARDING THE ACCURACY OR COMPLETENESS OF ANY ANALYSIS
              PROVIDED BY THE SERVICE.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              9. Indemnification
            </h2>
            <p>
              You agree to indemnify, defend, and hold harmless DEALWISE and its officers, directors, employees,
              agents, and affiliates from and against any and all claims, liabilities, damages, losses, costs,
              and expenses (including reasonable attorneys&apos; fees) arising out of or related to: (a) your
              use of the Service; (b) your violation of these Terms; (c) your violation of any rights of any
              third party, including intellectual property rights; or (d) any content you submit to the Service.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              10. Termination
            </h2>
            <ul className="ml-5 list-disc space-y-2">
              <li>
                <strong className="text-gray-800">Termination by Us.</strong>{' '}
                We reserve the right to suspend or terminate your access to the Service at any time, with or
                without cause, and with or without notice. Grounds for termination include, but are not limited
                to, violation of these Terms, fraudulent or illegal activity, or conduct that we determine is
                harmful to other users or the integrity of the Service.
              </li>
              <li>
                <strong className="text-gray-800">Termination by You.</strong>{' '}
                You may delete your account at any time through the settings page or by contacting us at{' '}
                <a
                  href="mailto:support@dealwise.app"
                  className="text-gray-900 underline decoration-gray-300 underline-offset-2 transition-colors hover:decoration-gray-900"
                >
                  support@dealwise.app
                </a>
                . Upon account deletion, we will delete your personal data in accordance with our Privacy Policy.
              </li>
              <li>
                <strong className="text-gray-800">Effect of Termination.</strong>{' '}
                Upon termination, your right to use the Service will cease immediately. Sections 3, 6, 7, 8,
                9, 11, and 12 of these Terms shall survive termination.
              </li>
            </ul>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              11. Governing Law and Dispute Resolution
            </h2>
            <ul className="ml-5 list-disc space-y-2">
              <li>
                <strong className="text-gray-800">Governing Law.</strong>{' '}
                These Terms shall be governed by and construed in accordance with the laws of the State of
                Delaware, United States, without regard to its conflict of law principles.
              </li>
              <li>
                <strong className="text-gray-800">Dispute Resolution.</strong>{' '}
                Any dispute arising out of or relating to these Terms or the Service shall first be attempted
                to be resolved through good-faith negotiation between the parties. If the dispute cannot be
                resolved through negotiation within thirty (30) days, either party may submit the dispute to
                binding arbitration administered by a mutually agreed-upon arbitration provider. The arbitration
                shall take place in the State of Delaware.
              </li>
              <li>
                <strong className="text-gray-800">Class Action Waiver.</strong>{' '}
                You agree that any dispute resolution proceedings will be conducted only on an individual basis
                and not in a class, consolidated, or representative action.
              </li>
            </ul>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              12. General Provisions
            </h2>
            <ul className="ml-5 list-disc space-y-2">
              <li>
                <strong className="text-gray-800">Entire Agreement.</strong>{' '}
                These Terms, together with the Privacy Policy, constitute the entire agreement between you
                and DEALWISE regarding the Service and supersede all prior agreements and understandings.
              </li>
              <li>
                <strong className="text-gray-800">Severability.</strong>{' '}
                If any provision of these Terms is found to be invalid or unenforceable, the remaining
                provisions will continue in full force and effect.
              </li>
              <li>
                <strong className="text-gray-800">Waiver.</strong>{' '}
                Our failure to enforce any right or provision of these Terms shall not constitute a waiver of
                that right or provision.
              </li>
              <li>
                <strong className="text-gray-800">Assignment.</strong>{' '}
                You may not assign or transfer these Terms or your rights under them without our prior written
                consent. We may assign these Terms without restriction.
              </li>
            </ul>
          </section>

          {/* Section 13 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              13. Changes to These Terms
            </h2>
            <p>
              We reserve the right to modify these Terms at any time. When we make material changes, we will
              update the &ldquo;Effective date&rdquo; at the top of this page and, where appropriate, provide
              additional notice. Your continued use of the Service after the revised Terms take effect
              constitutes your acceptance of the updated Terms. If you do not agree to the revised Terms,
              you must stop using the Service.
            </p>
          </section>

          {/* Section 14 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              14. Contact Us
            </h2>
            <p>
              If you have any questions or concerns about these Terms of Service, please contact us at:
            </p>
            <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 px-5 py-4">
              <p className="font-medium text-gray-900">DEALWISE</p>
              <p className="mt-1">
                Email:{' '}
                <a
                  href="mailto:support@dealwise.app"
                  className="text-gray-900 underline decoration-gray-300 underline-offset-2 transition-colors hover:decoration-gray-900"
                >
                  support@dealwise.app
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
