import Nav from '@/components/Nav';

export const metadata = {
  title: 'Cookie Policy - DEALWISE',
  description: 'How DEALWISE uses cookies and session management.',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />

      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <header className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Cookie Policy
          </h1>
          <p className="mt-3 text-sm text-gray-400">
            Last updated: March 2026
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-gray-600">
            This Cookie Policy explains how DEALWISE uses cookies. Our use of cookies is minimal and
            limited strictly to what is necessary for authentication and session management. This policy
            is consistent with Section 4 of our{' '}
            <a
              href="/privacy"
              className="text-gray-900 underline decoration-gray-300 underline-offset-2 transition-colors hover:decoration-gray-900"
            >
              Privacy Policy
            </a>
            .
          </p>
        </header>

        <div className="space-y-10 text-[15px] leading-relaxed text-gray-600">
          {/* Section 1 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              1. Session Cookies Only
            </h2>
            <p>
              DEALWISE uses <strong className="text-gray-800">session cookies only</strong>, managed
              by NextAuth.js, our authentication provider. These cookies are essential for the service
              to function and are set only when you sign in. They are automatically deleted when your
              session ends or when you sign out.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              2. No Tracking or Third-Party Cookies
            </h2>
            <p>
              DEALWISE does <strong className="text-gray-800">not</strong> use tracking cookies,
              advertising cookies, or any third-party cookies. We do not engage in behavioral profiling,
              cross-site tracking, or cookie-based analytics. Your browsing activity is not monitored
              or shared with third parties through cookies.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              3. Cookies We Use
            </h2>
            <p className="mb-4">
              The following table describes the cookies set by DEALWISE:
            </p>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-900">Cookie Name</th>
                    <th className="px-4 py-3 font-semibold text-gray-900">Purpose</th>
                    <th className="px-4 py-3 font-semibold text-gray-900">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">next-auth.session-token</td>
                    <td className="px-4 py-3">Authenticates your session and keeps you signed in across page visits.</td>
                    <td className="px-4 py-3">Session duration</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">next-auth.csrf-token</td>
                    <td className="px-4 py-3">Provides CSRF (Cross-Site Request Forgery) protection for authentication requests.</td>
                    <td className="px-4 py-3">Session</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">next-auth.callback-url</td>
                    <td className="px-4 py-3">Stores the redirect URL to return you to the correct page after authentication.</td>
                    <td className="px-4 py-3">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              4. Managing Cookies in Your Browser
            </h2>
            <p className="mb-3">
              You can control and manage cookies through your browser settings. Most browsers allow you to:
            </p>
            <ul className="ml-5 list-disc space-y-2">
              <li>View and delete existing cookies.</li>
              <li>Block all cookies or only third-party cookies.</li>
              <li>Set preferences for specific websites.</li>
              <li>Configure your browser to notify you when a cookie is being set.</li>
            </ul>
            <p className="mt-3">
              Please note that if you choose to block or delete cookies used by DEALWISE, you may not be
              able to use authenticated features of the service, such as signing in or accessing your
              account dashboard.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              5. Contact Us
            </h2>
            <p>
              If you have any questions about our use of cookies, please contact us at:
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
