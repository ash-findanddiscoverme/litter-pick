import LegalPage from '@/components/layout/LegalPage';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Use — Litter Pick',
  description: 'Terms and conditions for using Litter Pick.',
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" lastUpdated="March 2026">
      <p>
        These terms govern your use of the Litter Pick website and service
        (&quot;Litter Pick&quot;, &quot;the Service&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;).
        By accessing or using Litter Pick, you agree to be bound by these terms.
        If you do not agree, please do not use the Service.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">1. What Litter Pick is</h2>
      <p>
        Litter Pick is a community platform for reporting litter, identifying local
        hotspots, and coordinating volunteer picks. It is designed for individuals,
        community groups, and local organisations who want to help keep their
        neighbourhoods clean. The Service is available across the United Kingdom,
        though we may expand in the future.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">2. Accounts</h2>
      <p>
        Some features of Litter Pick (such as submitting a litter report) do not require
        an account. Other features (such as volunteering for picks or viewing your
        report history) require you to register.
      </p>
      <p>
        When you create an account, you must provide accurate information and keep your
        login credentials secure. You are responsible for all activity that occurs under
        your account. If you believe your account has been compromised, please contact us
        immediately at{' '}
        <a href="mailto:support@litterpick.org" className="text-brand-500 underline underline-offset-2 hover:text-brand-600">
          support@litterpick.org
        </a>.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">3. Age restrictions</h2>
      <p>
        You must be at least 13 years old to use Litter Pick. If you are under 18, you
        should have permission from a parent or guardian before creating an account or
        uploading content. We do not knowingly collect personal data from children under 13.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">4. Acceptable use</h2>
      <p>
        You agree to use Litter Pick lawfully and in accordance with these terms and
        our{' '}
        <Link href="/community-guidelines" className="text-brand-500 underline underline-offset-2 hover:text-brand-600">
          Community Guidelines
        </Link>. In particular, you must not:
      </p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Upload content that is illegal, abusive, threatening, defamatory, obscene, or otherwise objectionable</li>
        <li>Impersonate another person or misrepresent your affiliation with any person or organisation</li>
        <li>Upload content that infringes someone else&apos;s intellectual property or privacy rights</li>
        <li>Share non-consensual intimate imagery</li>
        <li>Share other people&apos;s personal information without their consent</li>
        <li>Use the Service to distribute spam, scams, malware, or misleading content</li>
        <li>Attempt to interfere with the operation of the Service, including by circumventing security measures</li>
        <li>Submit false or deliberately misleading litter reports</li>
        <li>Use the Service for any commercial purpose without our prior written consent</li>
      </ul>

      <h2 className="text-xl font-semibold text-loam pt-4">5. Your content</h2>
      <p>
        &quot;Your Content&quot; means any photos, text, location data, or other material you
        upload or submit to Litter Pick.
      </p>
      <p>
        You retain ownership of Your Content. However, by uploading or submitting
        content to the Service, you grant Litter Pick a worldwide, non-exclusive,
        royalty-free, transferable licence to host, store, process, display, copy,
        resize, compress, and moderate Your Content for the purposes of operating,
        improving, and promoting the Service. This licence continues for as long as
        Your Content remains on the platform, and ends when you delete it (subject
        to reasonable backup and caching periods).
      </p>
      <p>
        You promise that you either own the content you upload or have the necessary
        rights and permissions to upload it and grant us this licence. You are
        responsible for ensuring your uploads do not infringe anyone else&apos;s rights.
      </p>
      <p>
        Litter reports, including photos and location data, may be visible to other
        users of the Service and may appear on the public map. Volunteer profiles
        may be visible to other volunteers in the same area. Please do not upload
        anything you would not want to be seen publicly.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">6. Moderation</h2>
      <p>
        We reserve the right (but are not obligated) to review, edit, or remove any
        content that we believe violates these terms, our{' '}
        <Link href="/community-guidelines" className="text-brand-500 underline underline-offset-2 hover:text-brand-600">
          Community Guidelines
        </Link>, or applicable law. We may also suspend or terminate accounts that
        repeatedly or seriously breach these terms.
      </p>
      <p>
        We take a proportionate approach. Minor first-time issues will typically
        result in a warning or content removal. Repeated or serious violations may
        lead to temporary or permanent suspension. We will aim to explain the reason
        for any action taken, and you may appeal via our{' '}
        <Link href="/reporting" className="text-brand-500 underline underline-offset-2 hover:text-brand-600">
          Reporting &amp; Takedown Policy
        </Link>.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">7. Repeat infringers</h2>
      <p>
        Litter Pick maintains a policy of terminating the accounts of users who are
        repeat infringers of intellectual property rights, in accordance with applicable
        law. If we receive multiple valid complaints about a user&apos;s content, that
        user&apos;s account may be suspended or permanently removed.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">8. Service availability</h2>
      <p>
        Litter Pick is provided &quot;as is&quot; and &quot;as available&quot;. We do our best to
        keep the Service running smoothly, but we do not guarantee that it will be
        uninterrupted, error-free, or available at all times. We may need to carry out
        maintenance, make changes, or temporarily suspend the Service without notice.
      </p>
      <p>
        We do not guarantee the accuracy, completeness, or reliability of any content
        submitted by users, including litter reports, hotspot data, or volunteer
        information. You should not rely on the Service for any purpose where
        inaccurate data could cause harm.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">9. Liability</h2>
      <p>
        To the fullest extent permitted by law, Litter Pick (including its founders,
        team members, and contributors) shall not be liable for any indirect,
        incidental, special, consequential, or punitive damages, or any loss of
        profits, data, use, or goodwill arising from your use of the Service.
      </p>
      <p>
        Our total liability to you for any claim arising from these terms or your use
        of the Service shall not exceed the amount you have paid us in the twelve
        months preceding the claim (if any). Nothing in these terms excludes or limits
        our liability for death or personal injury caused by our negligence, for fraud
        or fraudulent misrepresentation, or for any other matter that cannot be
        excluded or limited under English law.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">10. Indemnity</h2>
      <p>
        You agree to indemnify and hold harmless Litter Pick and its founders, team
        members, and contributors from any claims, losses, damages, liabilities, and
        expenses (including reasonable legal fees) arising out of or related to:
        (a) your use of the Service; (b) Your Content; (c) your breach of these terms;
        or (d) your violation of any third party&apos;s rights. This indemnity is
        proportionate and does not require you to cover losses caused by our own
        negligence or wilful misconduct.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">11. Termination</h2>
      <p>
        You may stop using the Service at any time. You can delete your account by
        contacting us at{' '}
        <a href="mailto:support@litterpick.org" className="text-brand-500 underline underline-offset-2 hover:text-brand-600">
          support@litterpick.org
        </a>.
      </p>
      <p>
        We may suspend or terminate your account at any time if we reasonably believe
        you have breached these terms, with or without notice depending on the severity
        of the breach. Where possible, we will explain the reason and give you an
        opportunity to address the issue before termination.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">12. Changes to these terms</h2>
      <p>
        We may update these terms from time to time. If we make material changes, we
        will notify you by posting a notice on the Service or by email (if you have an
        account). Your continued use of Litter Pick after changes take effect constitutes
        acceptance of the updated terms.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">13. Changes to the Service</h2>
      <p>
        We may modify, suspend, or discontinue any part of the Service at any time.
        We are a small project and things may change as we grow. We will try to give
        reasonable notice of significant changes where possible.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">14. Governing law and jurisdiction</h2>
      <p>
        These terms are governed by the laws of England and Wales. Any disputes arising
        from these terms or your use of the Service shall be subject to the exclusive
        jurisdiction of the courts of England and Wales. If you are a consumer, you
        may also have rights under the laws of your country of residence.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">15. Contact</h2>
      <p>
        If you have any questions about these terms, please contact us at{' '}
        <a href="mailto:legal@litterpick.org" className="text-brand-500 underline underline-offset-2 hover:text-brand-600">
          legal@litterpick.org
        </a>.
      </p>
    </LegalPage>
  );
}
