# Founder Notes — Legal Pages

Internal reference document for the Litter Pick legal pages. Read this before publishing.

---

## Placeholders to complete before publishing

The draft legal pages contain several placeholders (marked with HTML comments in the code) that need to be filled in before going live:

### Privacy Notice
- **Company details**: Insert your registered company name, company number, and registered address once incorporated. This is required under UK GDPR — you need to identify who the data controller is.
- **Supabase hosting region**: Confirm where Supabase hosts your data (likely US or EU) and ensure the international transfers section reflects this accurately.
- **Analytics provider**: If/when you add analytics (e.g. Plausible, PostHog), name the provider and update both the Privacy Notice and Cookie Policy.
- **Post-deletion retention period**: Decide how long you keep account data after deletion (30 days, 90 days, etc.) and state it explicitly.
- **Technical data retention**: Confirm how long server logs and analytics data are kept.

### Reporting & Takedown Policy
- **In-app reporting**: The current process is email-only. When you build an in-app report button, update the reporting instructions.
- **Response times**: "48 hours to acknowledge, 7 working days to act" is a reasonable starting commitment. Update once you know your actual capacity.

### Cookie Policy
- **Cookie consent tool**: You'll need a consent banner/preference centre before setting non-essential cookies. Tools like CookieYes, Osano, or a custom solution work.
- **Cookie audit**: Before launch, do a full audit of what cookies the site actually sets and update the tables. The Supabase auth cookie name and any MapTiler cookies should be verified.
- **Analytics cookies**: Left blank for now. Fill in when you choose a provider.

### Terms of Use
- No major placeholders, but review the age restriction (13+) — this is standard for UK platforms but confirm it aligns with your risk appetite and any future features.

---

## Sections a UK solicitor should review

While these drafts are designed to be usable first-draft copy, the following sections carry the most legal risk and should be reviewed by a qualified UK solicitor before going live:

1. **Terms of Use — Liability and Indemnity (sections 9–10)**: These clauses limit your exposure to claims. A solicitor should check they're enforceable under English consumer law, particularly the Consumer Rights Act 2015.

2. **Terms of Use — Content licence (section 5)**: The licence you take over user content needs to be broad enough to operate the service but not overreaching. A solicitor should confirm the scope is appropriate.

3. **Privacy Notice — Lawful bases (section 3)**: Getting lawful bases right under UK GDPR is critical. A solicitor or data protection advisor should confirm these are correctly applied to each processing activity.

4. **Privacy Notice — International transfers (section 5)**: If data leaves the UK (e.g. Supabase US hosting), you need appropriate safeguards. A solicitor should advise on whether standard contractual clauses are sufficient and whether a transfer impact assessment is needed.

5. **Reporting & Takedown — Copyright section (section 8)**: This is modelled on a general notice-and-takedown process. If you want DMCA-style safe harbour protections (relevant if you have US users), a solicitor should advise.

6. **All pages — Age restrictions**: The 13+ minimum is standard but carries implications for children's data under UK GDPR and the Age Appropriate Design Code. If children under 18 will realistically use the service, a solicitor should review your compliance posture.

7. **All pages — Governing law**: Currently set to England and Wales. If you plan to operate beyond the UK, check whether additional jurisdictions need to be addressed.

---

## Operational processes needed behind the scenes

These legal pages make commitments. For them to be true in practice, you need the following processes in place:

### Moderation
- Someone needs to actually review reported content and act on it. At minimum, check the safety@litterpick.org inbox daily.
- Document moderation decisions (what was reported, what was reviewed, what action was taken, when). Keep a simple log — a spreadsheet is fine initially.
- Have a clear internal escalation path for serious content (illegal material, CSAM, threats of violence). Know when to contact the police.

### Data subject requests
- Be ready to handle requests to privacy@litterpick.org within one month (UK GDPR requirement).
- You need to be able to: export a user's data, delete a user's account and data, and correct inaccurate data.
- Build a simple internal process for verifying the requester's identity before handing over data.

### Email addresses
- Set up and actively monitor these inboxes:
  - **support@litterpick.org** — general support and account issues
  - **safety@litterpick.org** — content reports and safety concerns
  - **privacy@litterpick.org** — data protection queries and rights requests
  - **copyright@litterpick.org** — copyright complaints
  - **appeals@litterpick.org** — appeals against moderation decisions
  - **legal@litterpick.org** — terms-related queries
  - **hello@litterpick.org** — general contact (About page)
- These can all route to the same inbox initially, but they need to exist.

### Cookie compliance
- Before setting any non-essential cookies, implement a consent mechanism (banner + preference centre).
- Audit your actual cookies regularly — new dependencies can introduce cookies you didn't expect.

### Record keeping
- Keep records of: moderation actions, data subject requests and responses, copyright complaints and outcomes, account suspensions and appeals.
- Under UK GDPR Article 30, you need a Record of Processing Activities (ROPA). This doesn't need to be complex for a small platform, but it needs to exist.

### Incident response
- If you suffer a data breach, you have 72 hours to report it to the ICO (if it poses a risk to individuals). Have a basic plan for who does what.

---

## Summary

These pages give you a solid first-draft legal foundation for a UK-based community platform that handles user-generated content including photos and location data. They are not a substitute for professional legal advice. Before your public launch:

1. Complete all placeholders
2. Get a UK solicitor to review the flagged sections
3. Set up the operational processes listed above
4. Do a cookie audit
5. Set up all email addresses

After that, you're in a strong position to launch with confidence.
