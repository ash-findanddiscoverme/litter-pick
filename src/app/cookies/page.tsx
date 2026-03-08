import LegalPage from '@/components/layout/LegalPage';
import Link from 'next/link';

export const metadata = {
  title: 'Cookie Policy — Litter Pick',
  description: 'How Litter Pick uses cookies and similar technologies.',
};

export default function CookiePolicyPage() {
  return (
    <LegalPage title="Cookie Policy" lastUpdated="March 2026">
      <p>
        This policy explains how Litter Pick uses cookies and similar technologies
        when you use our website and service.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">1. What are cookies?</h2>
      <p>
        Cookies are small text files placed on your device by websites you visit.
        They are widely used to make websites work, remember your preferences, and
        provide information to site owners. Similar technologies include local
        storage, session storage, and pixels.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">2. How we use cookies</h2>
      <p>
        Litter Pick uses a minimal number of cookies. We categorise them as follows:
      </p>

      <h3 className="text-lg font-medium text-loam pt-2">Strictly necessary cookies</h3>
      <p>
        These cookies are essential for the Service to function. They include session
        cookies used for authentication (keeping you logged in) and security cookies
        that help protect against cross-site request forgery. These cookies do not
        require your consent as the Service cannot operate without them.
      </p>
      <div className="bg-stone-50 rounded-xl p-4 text-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-stone-200">
              <th className="pb-2 font-medium text-loam">Cookie</th>
              <th className="pb-2 font-medium text-loam">Purpose</th>
              <th className="pb-2 font-medium text-loam">Duration</th>
            </tr>
          </thead>
          <tbody className="text-weathered">
            <tr className="border-b border-stone-100">
              <td className="py-2">sb-*-auth-token</td>
              <td className="py-2">Supabase authentication session</td>
              <td className="py-2">Session / 1 year</td>
            </tr>
            {/* [PLACEHOLDER: Add any other strictly necessary cookies as they are implemented] */}
          </tbody>
        </table>
      </div>

      <h3 className="text-lg font-medium text-loam pt-2">Analytics cookies</h3>
      <p>
        We may use analytics cookies to understand how visitors use the Service, which
        pages are most popular, and where users encounter problems. Analytics data
        helps us improve Litter Pick.
      </p>
      <p>
        If we introduce analytics cookies, we will only set them with your consent.
        We will update this table with specific cookie names and providers at that time.
        {/* [PLACEHOLDER: Add analytics cookie details when analytics provider is chosen, e.g. Plausible, PostHog, etc.] */}
      </p>

      <h3 className="text-lg font-medium text-loam pt-2">Functionality cookies</h3>
      <p>
        These cookies remember choices you make (such as your preferred map view or
        whether you dismissed a banner) to provide a more personalised experience.
        Where these are non-essential, we will ask for your consent before setting them.
      </p>
      <div className="bg-stone-50 rounded-xl p-4 text-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-stone-200">
              <th className="pb-2 font-medium text-loam">Cookie</th>
              <th className="pb-2 font-medium text-loam">Purpose</th>
              <th className="pb-2 font-medium text-loam">Duration</th>
            </tr>
          </thead>
          <tbody className="text-weathered">
            <tr className="border-b border-stone-100">
              <td className="py-2">banner_dismissed</td>
              <td className="py-2">Remembers if you dismissed the early-adopter banner</td>
              <td className="py-2">30 days</td>
            </tr>
            {/* [PLACEHOLDER: Add other functionality cookies as features are built] */}
          </tbody>
        </table>
      </div>

      <h3 className="text-lg font-medium text-loam pt-2">Advertising cookies</h3>
      <p>
        Litter Pick does not currently use any advertising cookies. If this changes in
        the future, we will update this policy and obtain your consent before setting
        any advertising cookies.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">3. Consent</h2>
      <p>
        Where cookies are not strictly necessary for the Service to function, we will
        ask for your consent before setting them. You can withdraw your consent at any
        time by adjusting your cookie preferences.
        {/* [PLACEHOLDER: Add link to cookie consent tool / preference centre when implemented] */}
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">4. Managing cookies in your browser</h2>
      <p>
        Most browsers allow you to control cookies through their settings. You can
        typically choose to block all cookies, accept all cookies, or be notified when
        a cookie is set. Please note that blocking strictly necessary cookies may
        prevent parts of the Service from working properly.
      </p>
      <p>
        For instructions on managing cookies in your browser, visit your browser&apos;s
        help documentation.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">5. Third-party cookies</h2>
      <p>
        Some of our service providers may set their own cookies on your device. We do
        not control these cookies. The main third-party services we use are:
      </p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>
          <span className="font-medium text-loam">Supabase</span> — for authentication.
          May set session-related cookies.
        </li>
        <li>
          <span className="font-medium text-loam">MapTiler</span> — for map tiles.
          May set cookies for performance and caching purposes.
        </li>
        {/* [PLACEHOLDER: Add any other third-party services that set cookies] */}
      </ul>
      <p>
        Please refer to these providers&apos; own cookie and privacy policies for more
        information about how they use cookies.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">6. Changes to this policy</h2>
      <p>
        We may update this cookie policy from time to time, particularly as we add
        new features or services. Material changes will be communicated through the
        Service. The &quot;last updated&quot; date at the top of this page shows when
        this policy was last revised.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">7. Contact</h2>
      <p>
        If you have questions about our use of cookies, please contact us at{' '}
        <a href="mailto:privacy@litterpick.org" className="text-brand-500 underline underline-offset-2 hover:text-brand-600">
          privacy@litterpick.org
        </a>. For broader privacy questions, see our{' '}
        <Link href="/privacy" className="text-brand-500 underline underline-offset-2 hover:text-brand-600">
          Privacy Notice
        </Link>.
      </p>
    </LegalPage>
  );
}
