import Nav from '@/components/Nav';

export const metadata = {
  title: 'Privacy Policy - DEALWISE',
  description: 'How DEALWISE handles your data and protects your privacy.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />

      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-gray-400">
            Last updated: March 2026
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-gray-600">
            At DEALWISE, we take your privacy seriously. This Privacy Policy explains what information we collect,
            how we use it, and what rights you have in relation to it. By using our service, you agree to the
            collection and use of information in accordance with this policy.
          </p>
        </header>

        <div className="space-y-10 text-[15px] leading-relaxed text-gray-600">
          {/* Section 1 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              1. Information We Collect
            </h2>
            <p className="mb-3">
              We collect and process the following categories of information:
            </p>
            <ul className="ml-5 list-disc space-y-2">
              <li>
                <strong className="text-gray-800">Contract Text for Analysis.</strong>{' '}
                When you submit a contract for analysis, we process the text you provide. This text is sent to our
                AI analysis engine for processing and is <strong className="text-gray-800">not stored</strong> on
                our servers after the analysis is complete.
              </li>
              <li>
                <strong className="text-gray-800">Account Information.</strong>{' '}
                If you create an account, we collect and store your email address and a hashed version of your
                password. We use this information solely for authentication and account management purposes.
              </li>
              <li>
                <strong className="text-gray-800">Usage Analytics.</strong>{' '}
                We collect anonymized usage data such as page views, feature usage frequency, and general
                interaction patterns. This data is used to improve the service and does not include any
                contract content or personally identifiable information.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              2. How We Use Your Data
            </h2>
            <ul className="ml-5 list-disc space-y-2">
              <li>
                <strong className="text-gray-800">Contract Analysis.</strong>{' '}
                Contract text you submit is processed in real time by our AI analysis engine. The text is analyzed,
                results are returned to you, and the contract text is then discarded. We do not store, log, or
                retain your contract content on our servers.
              </li>
              <li>
                <strong className="text-gray-800">Authentication.</strong>{' '}
                Your email and password are used to authenticate you and manage your account. We never share your
                credentials with third parties.
              </li>
              <li>
                <strong className="text-gray-800">Service Improvement.</strong>{' '}
                Anonymized usage analytics help us understand how the service is used and identify areas for
                improvement. These analytics never contain contract text or personal information.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              3. Third-Party Services
            </h2>
            <p className="mb-3">
              DEALWISE relies on the following third-party services to deliver its functionality:
            </p>
            <ul className="ml-5 list-disc space-y-2">
              <li>
                <strong className="text-gray-800">OpenAI API.</strong>{' '}
                We use OpenAI&apos;s API to power our AI-based contract analysis. When you submit a contract for
                analysis, the contract text is sent to OpenAI for processing. OpenAI&apos;s use of this data is
                governed by their own{' '}
                <a
                  href="https://openai.com/policies/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-900 underline decoration-gray-300 underline-offset-2 transition-colors hover:decoration-gray-900"
                >
                  privacy policy
                </a>
                . We use the API in a configuration that does not allow OpenAI to use your data for model training.
              </li>
              <li>
                <strong className="text-gray-800">NextAuth.js.</strong>{' '}
                We use NextAuth.js to manage user authentication. NextAuth handles session management and
                credential verification on our behalf.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              4. Cookies
            </h2>
            <p>
              DEALWISE uses cookies strictly for authentication and session management. When you sign in, a
              session cookie is set to keep you authenticated across page visits. We do <strong className="text-gray-800">not</strong> use
              tracking cookies, advertising cookies, or any third-party cookies for analytics or behavioral
              profiling. You can configure your browser to refuse cookies, but doing so may prevent you from
              using authenticated features of the service.
            </p>
            <p className="mt-3">
              For more details, see our{' '}
              <a
                href="/cookies"
                className="text-gray-900 underline decoration-gray-300 underline-offset-2 transition-colors hover:decoration-gray-900"
              >
                Cookie Policy
              </a>
              .
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              5. Data Retention
            </h2>
            <ul className="ml-5 list-disc space-y-2">
              <li>
                <strong className="text-gray-800">Contract Text.</strong>{' '}
                Not retained. Contract text is processed in memory during analysis and discarded immediately
                after the analysis is complete. No contract content is stored on our servers at any time.
              </li>
              <li>
                <strong className="text-gray-800">Account Data.</strong>{' '}
                Your email address and hashed password are retained for as long as your account exists. You may
                request deletion of your account at any time (see Section 6).
              </li>
              <li>
                <strong className="text-gray-800">Analysis History.</strong>{' '}
                Your analysis history is stored exclusively in your browser&apos;s localStorage. This data never
                leaves your device and is not transmitted to or stored on our servers. You can clear this data
                at any time through your browser settings or through the DEALWISE settings page.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              6. Your Rights
            </h2>
            <p className="mb-3">
              You have the following rights regarding your personal data:
            </p>
            <ul className="ml-5 list-disc space-y-2">
              <li>
                <strong className="text-gray-800">Right of Access.</strong>{' '}
                You may request a copy of the personal data we hold about you at any time.
              </li>
              <li>
                <strong className="text-gray-800">Right to Deletion.</strong>{' '}
                You may request that we delete your account and all associated personal data. Upon receiving
                such a request, we will delete your data within 30 days, except where retention is required
                by law.
              </li>
              <li>
                <strong className="text-gray-800">Right to Data Portability.</strong>{' '}
                You may request an export of your personal data in a structured, commonly used, and
                machine-readable format.
              </li>
              <li>
                <strong className="text-gray-800">Right to Rectification.</strong>{' '}
                You may request correction of any inaccurate personal data we hold about you.
              </li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact us at{' '}
              <a
                href="mailto:support@dealwise.app"
                className="text-gray-900 underline decoration-gray-300 underline-offset-2 transition-colors hover:decoration-gray-900"
              >
                support@dealwise.app
              </a>
              .
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              7. GDPR Compliance
            </h2>
            <p className="mb-3">
              If you are located in the European Economic Area (EEA), the United Kingdom, or Switzerland, the
              following additional provisions apply:
            </p>
            <ul className="ml-5 list-disc space-y-2">
              <li>
                <strong className="text-gray-800">Lawful Basis for Processing.</strong>{' '}
                We process your personal data on the following legal bases: (a) your consent, where you have
                provided it; (b) the performance of a contract with you (i.e., providing the service you
                requested); and (c) our legitimate interests in operating and improving the service, provided
                those interests do not override your fundamental rights and freedoms.
              </li>
              <li>
                <strong className="text-gray-800">Data Subject Rights.</strong>{' '}
                In addition to the rights listed in Section 6, you have the right to restrict processing,
                the right to object to processing, and the right to lodge a complaint with your local
                supervisory authority.
              </li>
              <li>
                <strong className="text-gray-800">International Data Transfers.</strong>{' '}
                When contract text is sent to OpenAI for analysis, it may be processed in the United States.
                We rely on appropriate safeguards, including standard contractual clauses, to ensure your data
                is protected in accordance with GDPR requirements.
              </li>
              <li>
                <strong className="text-gray-800">Data Protection Officer.</strong>{' '}
                For GDPR-related inquiries, you may contact our Data Protection Officer at{' '}
                <a
                  href="mailto:support@dealwise.app"
                  className="text-gray-900 underline decoration-gray-300 underline-offset-2 transition-colors hover:decoration-gray-900"
                >
                  support@dealwise.app
                </a>
                .
              </li>
            </ul>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              8. CCPA Compliance
            </h2>
            <p className="mb-3">
              If you are a resident of California, the California Consumer Privacy Act (CCPA) provides you
              with the following additional rights:
            </p>
            <ul className="ml-5 list-disc space-y-2">
              <li>
                <strong className="text-gray-800">Right to Know.</strong>{' '}
                You have the right to request disclosure of the categories and specific pieces of personal
                information we have collected about you in the preceding 12 months.
              </li>
              <li>
                <strong className="text-gray-800">Right to Delete.</strong>{' '}
                You have the right to request that we delete any personal information we have collected about
                you, subject to certain exceptions.
              </li>
              <li>
                <strong className="text-gray-800">Right to Non-Discrimination.</strong>{' '}
                We will not discriminate against you for exercising any of your CCPA rights. We will not deny
                you service, charge different prices, or provide a different quality of service because you
                exercised your rights.
              </li>
              <li>
                <strong className="text-gray-800">Sale of Personal Information.</strong>{' '}
                DEALWISE does not sell your personal information to third parties. We do not and will not sell
                personal information.
              </li>
            </ul>
            <p className="mt-3">
              To submit a CCPA request, please contact us at{' '}
              <a
                href="mailto:support@dealwise.app"
                className="text-gray-900 underline decoration-gray-300 underline-offset-2 transition-colors hover:decoration-gray-900"
              >
                support@dealwise.app
              </a>
              .
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              9. Data Security
            </h2>
            <p>
              We implement industry-standard security measures to protect your personal data. All data
              transmitted between your browser and our servers is encrypted using TLS (HTTPS). Passwords are
              hashed using secure, one-way hashing algorithms and are never stored in plain text. Since contract
              text is not stored on our servers, there is minimal risk of a data breach affecting your contract
              content.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              10. Children&apos;s Privacy
            </h2>
            <p>
              DEALWISE is not intended for use by individuals under the age of 16. We do not knowingly collect
              personal information from children under 16. If we become aware that we have collected personal
              data from a child under 16, we will take steps to delete that information promptly. If you believe
              that we may have collected information from a child under 16, please contact us at{' '}
              <a
                href="mailto:support@dealwise.app"
                className="text-gray-900 underline decoration-gray-300 underline-offset-2 transition-colors hover:decoration-gray-900"
              >
                support@dealwise.app
              </a>
              .
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              11. Changes to This Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices,
              technology, legal requirements, or other factors. When we make material changes, we will notify
              you by updating the &ldquo;Last updated&rdquo; date at the top of this page and, where appropriate,
              by providing additional notice (such as an in-app notification or email). Your continued use of
              the service after any changes constitutes your acceptance of the updated Privacy Policy.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              12. Contact Us
            </h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data
              practices, please contact us at:
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
