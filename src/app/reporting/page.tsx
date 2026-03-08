import LegalPage from '@/components/layout/LegalPage';
import Link from 'next/link';

export const metadata = {
  title: 'Reporting & Takedown Policy — Litter Pick',
  description: 'How to report content and how we handle reports, takedowns, and appeals.',
};

export default function ReportingPage() {
  return (
    <LegalPage title="Reporting &amp; Takedown Policy" lastUpdated="March 2026">
      <p>
        We want Litter Pick to be a safe and useful platform. If you see content that
        you believe breaks our{' '}
        <Link href="/community-guidelines" className="text-brand-500 underline underline-offset-2 hover:text-brand-600">
          Community Guidelines
        </Link>, infringes your rights, or poses a risk to safety, you can report it
        using the process described below.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">1. How to report content or accounts</h2>
      <p>
        You can report content or an account by emailing{' '}
        <a href="mailto:safety@litterpick.org" className="text-brand-500 underline underline-offset-2 hover:text-brand-600">
          safety@litterpick.org
        </a>.
        {/* [PLACEHOLDER: Add in-app reporting mechanism when built — e.g. "or by tapping the report button on any content"] */}
      </p>
      <p>Please include as much of the following as you can:</p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>A description of the content or behaviour you are reporting</li>
        <li>A link to the content (URL) or the username of the account, if available</li>
        <li>The reason for your report (see categories below)</li>
        <li>Any supporting evidence, such as screenshots</li>
        <li>Your contact email address, so we can follow up if needed</li>
      </ul>

      <h2 className="text-xl font-semibold text-loam pt-4">2. What you can report</h2>
      <p>Reports can be made about any of the following:</p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li><span className="font-medium text-loam">Abuse or harassment</span> — hateful, threatening, or abusive content directed at individuals or groups</li>
        <li><span className="font-medium text-loam">Impersonation</span> — accounts pretending to be someone they are not</li>
        <li><span className="font-medium text-loam">Privacy concerns</span> — content that shares someone&apos;s personal information without consent, including identifiable photos</li>
        <li><span className="font-medium text-loam">Copyright infringement</span> — content that uses someone else&apos;s work without permission (see section 7 below)</li>
        <li><span className="font-medium text-loam">Illegal content</span> — content that appears to be illegal under English law</li>
        <li><span className="font-medium text-loam">Safety concerns</span> — content that poses a risk to physical safety, encourages self-harm, or involves the exploitation of children</li>
        <li><span className="font-medium text-loam">Spam or misleading content</span> — fake reports, scams, or deliberately misleading information</li>
      </ul>

      <h2 className="text-xl font-semibold text-loam pt-4">3. How we review reports</h2>
      <p>
        All reports are reviewed by our team. We aim to acknowledge receipt within
        48 hours and to take action within 7 working days, though complex cases
        may take longer.
        {/* [PLACEHOLDER: Update response times once operational capacity is known] */}
      </p>
      <p>
        We assess each report against our{' '}
        <Link href="/community-guidelines" className="text-brand-500 underline underline-offset-2 hover:text-brand-600">
          Community Guidelines
        </Link>{' '}
        and{' '}
        <Link href="/terms" className="text-brand-500 underline underline-offset-2 hover:text-brand-600">
          Terms of Use
        </Link>. We may contact the reporter or the person whose content was reported
        for additional information.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">4. Urgent safety matters</h2>
      <p>
        Reports involving immediate risks to safety — such as illegal content, threats
        of violence, content involving the exploitation of children, or non-consensual
        intimate imagery — will be prioritised and may be escalated to law enforcement.
      </p>
      <p>
        If someone is in immediate danger, please contact the police directly on 999.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">5. Possible outcomes</h2>
      <p>After reviewing a report, we may take one or more of the following actions:</p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li><span className="font-medium text-loam">No action</span> — if the content does not breach our policies</li>
        <li><span className="font-medium text-loam">Content removal</span> — the specific content is taken down</li>
        <li><span className="font-medium text-loam">Warning</span> — the account holder is notified and warned</li>
        <li><span className="font-medium text-loam">Account restriction</span> — certain features are temporarily limited</li>
        <li><span className="font-medium text-loam">Temporary suspension</span> — the account is suspended for a set period</li>
        <li><span className="font-medium text-loam">Permanent suspension</span> — the account is permanently removed</li>
        <li><span className="font-medium text-loam">Referral to authorities</span> — where we believe a crime has been committed</li>
      </ul>
      <p>
        We will aim to notify the affected user of the outcome, unless doing so would
        compromise safety, an investigation, or a legal requirement.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">6. Appeals</h2>
      <p>
        If your content was removed or your account was restricted or suspended, and you
        believe this was done in error, you may appeal by emailing{' '}
        <a href="mailto:appeals@litterpick.org" className="text-brand-500 underline underline-offset-2 hover:text-brand-600">
          appeals@litterpick.org
        </a>{' '}
        within 14 days of the action. Please include:
      </p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Your username or account email</li>
        <li>A description of the action taken</li>
        <li>Why you believe the decision was incorrect</li>
      </ul>
      <p>
        We will review your appeal and respond within 14 working days. The decision
        on appeal is final.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">7. Repeat violations</h2>
      <p>
        Users who repeatedly violate our policies will face escalating consequences.
        We maintain records of previous violations. Multiple confirmed breaches —
        even if individually minor — may result in permanent suspension.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">8. Copyright complaints</h2>
      <p>
        If you believe content on Litter Pick infringes your copyright, please send a
        written notice to{' '}
        <a href="mailto:copyright@litterpick.org" className="text-brand-500 underline underline-offset-2 hover:text-brand-600">
          copyright@litterpick.org
        </a>{' '}
        including:
      </p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Your name and contact details</li>
        <li>Identification of the copyrighted work you believe has been infringed</li>
        <li>A link to the infringing content on Litter Pick</li>
        <li>A statement that you have a good faith belief the use is not authorised by the copyright owner, its agent, or the law</li>
        <li>A statement that the information in the notice is accurate and that you are the copyright owner or authorised to act on their behalf</li>
      </ul>
      <p>
        We will review valid copyright complaints promptly and remove or disable
        access to infringing content where appropriate. Counter-notices may be
        submitted if you believe a takedown was made in error.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">9. Privacy and personality rights complaints</h2>
      <p>
        If a photo or profile on Litter Pick includes your image, personal information,
        or otherwise infringes your privacy or personality rights without your consent,
        please contact us at{' '}
        <a href="mailto:privacy@litterpick.org" className="text-brand-500 underline underline-offset-2 hover:text-brand-600">
          privacy@litterpick.org
        </a>{' '}
        with:
      </p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Your name and contact details</li>
        <li>A link to the content in question</li>
        <li>An explanation of how the content affects your rights</li>
        <li>Any supporting evidence (e.g. proof of identity, if the complaint relates to your image)</li>
      </ul>
      <p>
        We will review these complaints on a case-by-case basis. Where we are satisfied
        that the content infringes your rights, we will remove or obscure it. We may
        also contact the uploader to seek their perspective before taking action, unless
        the matter is urgent.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">10. Contact</h2>
      <p>
        For any questions about this policy, please contact{' '}
        <a href="mailto:safety@litterpick.org" className="text-brand-500 underline underline-offset-2 hover:text-brand-600">
          safety@litterpick.org
        </a>.
      </p>
    </LegalPage>
  );
}
