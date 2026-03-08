import LegalPage from '@/components/layout/LegalPage';
import Link from 'next/link';

export const metadata = {
  title: 'Community Guidelines — Litter Pick',
  description: 'The rules and expectations for the Litter Pick community.',
};

export default function CommunityGuidelinesPage() {
  return (
    <LegalPage title="Community Guidelines" lastUpdated="March 2026">
      <h2 className="text-xl font-semibold text-loam pt-4">The kind of community we want</h2>
      <p>
        Litter Pick exists to help people look after the places they live. It works
        because ordinary people take a few minutes to report a problem or lend a hand.
        We want this to be a practical, welcoming space — free from hostility, spam,
        and content that has nothing to do with keeping our neighbourhoods clean.
      </p>
      <p>
        These guidelines apply to everything you post, upload, or share on Litter Pick,
        including litter reports, photos, volunteer profiles, and any messages or
        comments.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">What is not allowed</h2>

      <p className="font-medium text-loam">Illegal content</p>
      <p>
        Do not upload or share anything that is illegal under English law. This
        includes but is not limited to content that promotes violence, terrorism,
        or the exploitation of children.
      </p>

      <p className="font-medium text-loam">Hateful, abusive, threatening, or harassing content</p>
      <p>
        Do not target individuals or groups with abuse, threats, intimidation, or
        harassment based on any characteristic including race, ethnicity, religion,
        gender, sexual orientation, disability, or age. Disagreements happen — handle
        them respectfully.
      </p>

      <p className="font-medium text-loam">Impersonation</p>
      <p>
        Do not pretend to be someone you are not, including other users, public
        figures, organisations, or Litter Pick staff. Parody or fan accounts are
        not appropriate on this platform.
      </p>

      <p className="font-medium text-loam">Copyright infringement</p>
      <p>
        Only upload content you own or have permission to use. Do not upload photos,
        text, or other material belonging to someone else without their consent. See
        our{' '}
        <Link href="/reporting" className="text-brand-500 underline underline-offset-2 hover:text-brand-600">
          Reporting &amp; Takedown Policy
        </Link>{' '}
        for how to report copyright concerns.
      </p>

      <p className="font-medium text-loam">Non-consensual intimate imagery</p>
      <p>
        Do not share intimate or sexual images of anyone without their explicit
        consent. This is taken extremely seriously and may result in immediate
        permanent suspension and referral to law enforcement.
      </p>

      <p className="font-medium text-loam">Sharing other people&apos;s personal information</p>
      <p>
        Do not share someone else&apos;s personal details — such as their home address,
        phone number, email, or workplace — without their permission. This applies
        even if the information is publicly available elsewhere.
      </p>

      <p className="font-medium text-loam">Scams, spam, and misleading content</p>
      <p>
        Do not use Litter Pick to promote scams, post spam, or spread deliberately
        misleading information. This includes submitting fake litter reports or
        artificially inflating hotspot data.
      </p>

      <p className="font-medium text-loam">Harmful or unsafe content</p>
      <p>
        Do not upload content that encourages self-harm, dangerous activities, or
        poses a risk to public safety. If you encounter hazardous waste (e.g.
        needles, chemicals, asbestos), report it to your local council rather than
        attempting to handle it yourself.
      </p>

      <p className="font-medium text-loam">Malware and malicious uploads</p>
      <p>
        Do not upload files designed to damage, disrupt, or gain unauthorised access
        to other people&apos;s devices or the Service itself.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">What happens if you break the rules</h2>
      <p>
        We take a proportionate approach. What happens depends on the nature and
        severity of the issue:
      </p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>
          <span className="font-medium text-loam">Warning</span> — for minor or
          first-time issues, we may remove the content and let you know why.
        </li>
        <li>
          <span className="font-medium text-loam">Content removal</span> — content
          that violates these guidelines will be removed.
        </li>
        <li>
          <span className="font-medium text-loam">Temporary suspension</span> — for
          repeated or more serious violations, your account may be temporarily
          restricted.
        </li>
        <li>
          <span className="font-medium text-loam">Permanent suspension</span> — for
          severe violations (such as sharing illegal content or non-consensual
          intimate imagery), your account may be permanently removed.
        </li>
      </ul>
      <p>
        We reserve the right to investigate any reported content and to take any
        action we consider appropriate, including removing content, restricting
        accounts, and reporting illegal activity to the relevant authorities.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">How to report a problem</h2>
      <p>
        If you see something on Litter Pick that you believe breaks these guidelines,
        please report it. You can find full details on how to do this in our{' '}
        <Link href="/reporting" className="text-brand-500 underline underline-offset-2 hover:text-brand-600">
          Reporting &amp; Takedown Policy
        </Link>, or email us directly at{' '}
        <a href="mailto:safety@litterpick.org" className="text-brand-500 underline underline-offset-2 hover:text-brand-600">
          safety@litterpick.org
        </a>.
      </p>

      <h2 className="text-xl font-semibold text-loam pt-4">Changes to these guidelines</h2>
      <p>
        We may update these guidelines as the platform grows. Material changes will
        be communicated through the Service. Your continued use of Litter Pick after
        changes take effect constitutes acceptance.
      </p>
    </LegalPage>
  );
}
