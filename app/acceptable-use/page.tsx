import Nav from '@/components/Nav';

export const metadata = {
  title: 'Acceptable Use Policy - DEALWISE',
  description: 'Acceptable use guidelines for DEALWISE.',
};

export default function AcceptableUsePage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />

      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Acceptable Use Policy
          </h1>
          <p className="mt-3 text-sm text-gray-400">
            Last updated: March 2026
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-gray-600">
            This Acceptable Use Policy outlines the rules and guidelines for using DEALWISE. By accessing
            or using the service, you agree to comply with this policy. Violation of this policy may result
            in suspension or termination of your account.
          </p>
        </header>

        <div className="space-y-10 text-[15px] leading-relaxed text-gray-600">
          {/* Section 1 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              1. Permitted Use
            </h2>
            <p className="mb-3">
              DEALWISE is designed for freelancers and professionals to analyze contracts. You may use the
              service to:
            </p>
            <ul className="ml-5 list-disc space-y-2">
              <li>
                Analyze contracts that you are a <strong className="text-gray-800">party to</strong> (i.e.,
                contracts you have signed or are considering signing).
              </li>
              <li>
                Analyze contracts that you have been <strong className="text-gray-800">authorized to review</strong> by
                the relevant parties.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              2. Prohibited Use
            </h2>
            <p className="mb-3">
              You must not use DEALWISE for any of the following purposes:
            </p>
            <ul className="ml-5 list-disc space-y-2">
              <li>
                <strong className="text-gray-800">Scraping or Data Harvesting.</strong>{' '}
                Using automated tools, bots, or scripts to scrape, crawl, or extract data from the service.
              </li>
              <li>
                <strong className="text-gray-800">Reverse Engineering.</strong>{' '}
                Attempting to reverse-engineer, decompile, disassemble, or otherwise derive the source code,
                algorithms, or underlying technology of the service.
              </li>
              <li>
                <strong className="text-gray-800">Circumventing Limits.</strong>{' '}
                Attempting to bypass, circumvent, or manipulate usage limits, rate limits, credit systems,
                or any other restrictions imposed by the service.
              </li>
              <li>
                <strong className="text-gray-800">Reselling.</strong>{' '}
                Reselling, redistributing, or sublicensing access to the service or its analysis output
                without prior written consent from DEALWISE.
              </li>
              <li>
                <strong className="text-gray-800">Illegal Content.</strong>{' '}
                Submitting contracts or content that is illegal, fraudulent, defamatory, obscene, threatening,
                or otherwise unlawful in any jurisdiction.
              </li>
              <li>
                <strong className="text-gray-800">Automated Abuse.</strong>{' '}
                Using automated scripts, bots, or other programmatic means to interact with the service in
                a manner that degrades performance, disrupts availability, or interferes with other users.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              3. Fair Use Limits
            </h2>
            <p>
              To ensure the service remains available and performant for all users, DEALWISE enforces a
              fair use rate limit of <strong className="text-gray-800">10 requests per minute</strong> per
              user. Exceeding this limit may result in temporary throttling or temporary suspension of
              access. If you have a legitimate need for higher usage limits, please contact us to discuss
              enterprise options.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              4. Enforcement
            </h2>
            <p className="mb-3">
              DEALWISE reserves the right to enforce this Acceptable Use Policy at its sole discretion.
              Enforcement actions may include, but are not limited to:
            </p>
            <ul className="ml-5 list-disc space-y-2">
              <li>Issuing a warning to the user.</li>
              <li>Temporarily suspending access to the service.</li>
              <li>Permanently terminating the user&apos;s account.</li>
              <li>Pursuing legal remedies where appropriate.</li>
            </ul>
            <p className="mt-3">
              We will make reasonable efforts to notify you before taking enforcement action, except where
              immediate action is necessary to protect the service or other users.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              5. Reporting Abuse
            </h2>
            <p>
              If you become aware of any misuse of the service or violation of this Acceptable Use Policy,
              please report it to us at:
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
