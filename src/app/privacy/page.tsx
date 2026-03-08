import LegalPage from '@/components/layout/LegalPage';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Notice — Litter Pick',
  description: 'How Litter Pick collects, uses, and protects your personal data.',
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Notice" lastUpdated="March 2026">
      <p>
        This privacy notice explains how Litter Pick (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;)
        collects, uses, and protects your personal data when you use our website and
        service. We are committed to handling your data responsibly and transparently.
      </p>
      <p>
        Litter Pick is the data controller for the personal data described in this notice.
        {/* [PLACEHOLDER: Insert registered company name, number, and registered address once incorporated] */}
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">1. What personal data we collect</h2>

      <p className="font-medium text-loam">Account data</p>
      <p>
        If you create an account: your email address and a securely hashed password.
        We never store passwords in plain text.
      </p>

      <p className="font-medium text-loam">Profile data</p>
      <p>
        If you sign up as a volunteer: your name, email address, and postcode area.
        Your name and general area may be visible to other volunteers and clean-up
        organisers in the same locality.
      </p>

      <p className="font-medium text-loam">Litter report data</p>
      <p>
        Location (latitude and longitude), optional photo, severity rating, optional
        description, and a timestamp. Reports do not require an account. Report
        locations and photos are visible on the public map and hotspot pages.
      </p>

      <p className="font-medium text-loam">Uploaded image data</p>
      <p>
        Photos you upload as part of litter reports or clean-up logs. These may be
        resized, compressed, and displayed publicly on the Service. Please do not
        include identifiable individuals in photos unless you have their permission.
      </p>

      <p className="font-medium text-loam">Technical data</p>
      <p>
        IP address, browser type and version, device type, operating system, and
        referring URL. This data is collected automatically when you use the Service.
      </p>

      <p className="font-medium text-loam">Analytics data</p>
      <p>
        We may collect anonymised usage data such as pages visited, features used,
        and session duration to help us understand how the Service is used and improve
        it. {/* [PLACEHOLDER: Specify analytics provider if/when added, e.g. Plausible, PostHog] */}
      </p>

      <p className="font-medium text-loam">Moderation and reporting data</p>
      <p>
        If you report content or another user, or if your content or account is the
        subject of a report, we store details of the report, any investigation, and
        the outcome. This may include correspondence between you and our team.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">2. How we use your data</h2>
      <p>We use your personal data to:</p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Provide and operate the Service, including displaying reports on the map</li>
        <li>Create and manage your account</li>
        <li>Connect volunteers with clean-ups in their area</li>
        <li>Process, moderate, and display uploaded content</li>
        <li>Respond to reports, complaints, and support requests</li>
        <li>Detect and prevent misuse, fraud, and security threats</li>
        <li>Improve and develop the Service</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2 className="text-xl font-semibold text-loam pt-4">3. Lawful bases</h2>
      <p>
        Under UK GDPR, we rely on the following lawful bases for processing your
        personal data:
      </p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>
          <span className="font-medium text-loam">Contract</span> — processing
          necessary to provide the Service to you (e.g. account management, displaying
          reports)
        </li>
        <li>
          <span className="font-medium text-loam">Legitimate interests</span> — improving
          the Service, preventing misuse, and ensuring security, where these interests
          are not overridden by your rights
        </li>
        <li>
          <span className="font-medium text-loam">Consent</span> — where you have given
          specific consent, for example for non-essential cookies (see our{' '}
          <Link href="/cookies" className="text-brand-500 underline underline-offset-2 hover:text-brand-600">
            Cookie Policy
          </Link>)
        </li>
        <li>
          <span className="font-medium text-loam">Legal obligation</span> — where we
          need to process data to comply with the law
        </li>
      </ul>

      <h2 className="text-xl font-semibold text-loam pt-4">4. Who we share data with</h2>
      <p>We share personal data with the following categories of recipients:</p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>
          <span className="font-medium text-loam">Other users</span> — litter reports
          (including photos and locations) are visible on the public map. Volunteer
          names and general areas may be visible to other volunteers and clean-up
          organisers.
        </li>
        <li>
          <span className="font-medium text-loam">Service providers</span> — we use
          Supabase (authentication and database hosting) and MapTiler (map tiles).
          These providers process data on our behalf under appropriate agreements.
        </li>
        <li>
          <span className="font-medium text-loam">Law enforcement or regulators</span> — if
          required by law, court order, or to protect the safety of our users.
        </li>
      </ul>
      <p>
        We do not sell your personal data. We do not share it with advertisers or
        data brokers.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">5. International transfers</h2>
      <p>
        Some of our service providers may process data outside the United Kingdom.
        Where this happens, we ensure appropriate safeguards are in place, such as
        standard contractual clauses approved by the UK Information Commissioner&apos;s
        Office (ICO) or adequacy decisions.
        {/* [PLACEHOLDER: Confirm Supabase hosting region and any other providers with non-UK processing] */}
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">6. How long we keep data</h2>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>
          <span className="font-medium text-loam">Account data</span> — retained for
          as long as your account is active, plus a reasonable period after deletion
          for backup and legal purposes.
          {/* [PLACEHOLDER: Specify exact post-deletion retention, e.g. 30 days, 90 days] */}
        </li>
        <li>
          <span className="font-medium text-loam">Litter reports</span> — retained
          indefinitely to maintain the historical map record, unless you request
          deletion.
        </li>
        <li>
          <span className="font-medium text-loam">Uploaded photos</span> — retained
          for as long as the associated report or clean-up log exists on the platform.
        </li>
        <li>
          <span className="font-medium text-loam">Technical and analytics data</span> —
          retained for up to 12 months.
          {/* [PLACEHOLDER: Confirm actual retention for logs/analytics] */}
        </li>
        <li>
          <span className="font-medium text-loam">Moderation records</span> — retained
          for as long as necessary to enforce our policies and handle disputes.
        </li>
      </ul>

      <h2 className="text-xl font-semibold text-loam pt-4">7. Your rights</h2>
      <p>
        Under UK GDPR, you have the right to:
      </p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Access the personal data we hold about you</li>
        <li>Rectify inaccurate or incomplete data</li>
        <li>Erase your data (subject to certain exceptions)</li>
        <li>Restrict or object to processing in certain circumstances</li>
        <li>Data portability — receive your data in a structured, machine-readable format</li>
        <li>Withdraw consent at any time (where consent is our lawful basis)</li>
      </ul>
      <p>
        To exercise any of these rights, please email{' '}
        <a href="mailto:privacy@litterpick.org" className="text-brand-500 underline underline-offset-2 hover:text-brand-600">
          privacy@litterpick.org
        </a>. We will respond within one month.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">8. Children</h2>
      <p>
        Litter Pick is not intended for children under 13. We do not knowingly
        collect personal data from children under 13. If you believe a child under
        13 has provided us with personal data, please contact us and we will take
        steps to delete it. Users aged 13–17 should have parental or guardian
        permission before creating an account or uploading content.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">9. Complaints</h2>
      <p>
        If you are unhappy with how we have handled your personal data, please
        contact us first at{' '}
        <a href="mailto:privacy@litterpick.org" className="text-brand-500 underline underline-offset-2 hover:text-brand-600">
          privacy@litterpick.org
        </a>{' '}
        so we can try to resolve your concern.
      </p>
      <p>
        You also have the right to lodge a complaint with the Information
        Commissioner&apos;s Office (ICO), the UK&apos;s data protection authority:
      </p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Website: <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-brand-500 underline underline-offset-2 hover:text-brand-600">ico.org.uk</a></li>
        <li>Helpline: 0303 123 1113</li>
      </ul>

      <h2 className="text-xl font-semibold text-loam pt-4">10. Contact</h2>
      <p>
        For any privacy-related questions, please contact us at{' '}
        <a href="mailto:privacy@litterpick.org" className="text-brand-500 underline underline-offset-2 hover:text-brand-600">
          privacy@litterpick.org
        </a>.
      </p>
    </LegalPage>
  );
}
