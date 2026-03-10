/**
 * Admin utilities.
 *
 * Admin emails are stored in the ADMIN_EMAILS environment variable
 * as a comma-separated list. Falls back to a hardcoded list so the
 * app works even without the env var configured.
 */

const FALLBACK_ADMIN_EMAILS = ['ashnew1291@gmail.com'];

export function getAdminEmails(): string[] {
  const envVal = process.env.ADMIN_EMAILS;
  if (envVal) {
    return envVal.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  }
  return FALLBACK_ADMIN_EMAILS;
}

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}
