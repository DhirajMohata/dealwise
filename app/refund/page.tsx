import Nav from '@/components/Nav';

export const metadata = {
  title: 'Refund Policy - DEALWISE',
  description: 'Refund and credit policy for DEALWISE.',
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />

      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Refund Policy
          </h1>
          <p className="mt-3 text-sm text-gray-400">
            Last updated: March 2026
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-gray-600">
            This Refund Policy outlines the terms under which refunds and credit adjustments are handled
            at DEALWISE. By purchasing credits or using our service, you agree to the terms below.
          </p>
        </header>

        <div className="space-y-10 text-[15px] leading-relaxed text-gray-600">
          {/* Section 1 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              1. Non-Refundable Credits
            </h2>
            <p>
              All credits purchased on DEALWISE are <strong className="text-gray-800">non-refundable</strong> once
              the purchase is complete. Credits are digital goods that are delivered instantly upon purchase, and as
              such, they are not eligible for refunds under standard circumstances.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              2. System Errors
            </h2>
            <p>
              If a credit is consumed due to a system error&mdash;for example, if an analysis fails to complete
              because of a server-side issue or a technical malfunction&mdash;the credit will be{' '}
              <strong className="text-gray-800">automatically refunded</strong> to your account. You do not need
              to take any action in this case; the system will detect the error and restore the credit.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              3. Billing Errors
            </h2>
            <p>
              If you believe you have been charged incorrectly&mdash;for example, a duplicate charge or an
              unauthorized transaction&mdash;please contact us at{' '}
              <a
                href="mailto:support@dealwise.app"
                className="text-gray-900 underline decoration-gray-300 underline-offset-2 transition-colors hover:decoration-gray-900"
              >
                support@dealwise.app
              </a>{' '}
              within <strong className="text-gray-800">30 days</strong> of the charge. We will investigate
              the issue and, if the error is confirmed, issue a correction or refund as appropriate.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              4. Free Tier
            </h2>
            <p>
              If you are using DEALWISE on the free tier, no payment has been made and therefore{' '}
              <strong className="text-gray-800">no refund is applicable</strong>. Free-tier usage is provided
              at no cost and is subject to the usage limits described on our pricing page.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              5. Processing Time
            </h2>
            <p>
              Where a refund or credit adjustment is approved, processing will take{' '}
              <strong className="text-gray-800">5&ndash;10 business days</strong>. Refunds will be issued to
              the original payment method used for the purchase. Credit adjustments will be reflected in your
              account balance immediately upon approval.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              6. Contact Us
            </h2>
            <p>
              If you have any questions about this Refund Policy or need to report a billing issue,
              please contact us at:
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
