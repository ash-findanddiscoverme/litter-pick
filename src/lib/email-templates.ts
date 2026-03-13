/**
 * Email templates for Litter Pick.
 *
 * All templates return { subject, html, text } and use inline styles
 * for maximum email client compatibility.
 */

const BRAND_GREEN = '#4AA853';
const LOAM = '#3D2E1F';
const WEATHERED = '#8C7B6B';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://litter-pick.com';

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f4;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e7e5e4;">
        <!-- Header -->
        <tr>
          <td style="background-color:${BRAND_GREEN};padding:24px 32px;text-align:center;">
            <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">Litter Pick</span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #e7e5e4;text-align:center;">
            <p style="margin:0;font-size:12px;color:${WEATHERED};">
              Litter Pick &mdash; Care for your corner.<br>
              <a href="${APP_URL}" style="color:${BRAND_GREEN};text-decoration:none;">litter-pick.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function welcomeEmail(firstName: string) {
  const subject = `Welcome to Litter Pick, ${firstName}!`;

  const html = layout(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${LOAM};">Welcome aboard, ${firstName}!</h1>
    <p style="margin:0 0 20px;font-size:15px;color:${WEATHERED};line-height:1.6;">
      Thanks for signing up to Litter Pick. You're now part of a growing community helping to keep the UK clean.
    </p>

    <p style="margin:0 0 8px;font-size:15px;font-weight:600;color:${LOAM};">Here's how to get started:</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f5f5f4;">
          <span style="display:inline-block;width:24px;height:24px;line-height:24px;text-align:center;background-color:${BRAND_GREEN};color:#fff;border-radius:50%;font-size:13px;font-weight:700;margin-right:12px;vertical-align:middle;">1</span>
          <span style="font-size:14px;color:${LOAM};vertical-align:middle;">
            <a href="${APP_URL}/report" style="color:${BRAND_GREEN};text-decoration:none;font-weight:600;">Report litter</a> &mdash; snap a photo and drop a pin
          </span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f5f5f4;">
          <span style="display:inline-block;width:24px;height:24px;line-height:24px;text-align:center;background-color:${BRAND_GREEN};color:#fff;border-radius:50%;font-size:13px;font-weight:700;margin-right:12px;vertical-align:middle;">2</span>
          <span style="font-size:14px;color:${LOAM};vertical-align:middle;">
            <a href="${APP_URL}/map" style="color:${BRAND_GREEN};text-decoration:none;font-weight:600;">Explore the map</a> &mdash; see hotspots near you
          </span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0;">
          <span style="display:inline-block;width:24px;height:24px;line-height:24px;text-align:center;background-color:${BRAND_GREEN};color:#fff;border-radius:50%;font-size:13px;font-weight:700;margin-right:12px;vertical-align:middle;">3</span>
          <span style="font-size:14px;color:${LOAM};vertical-align:middle;">
            <a href="${APP_URL}/picks" style="color:${BRAND_GREEN};text-decoration:none;font-weight:600;">Join a pick</a> &mdash; team up with local volunteers
          </span>
        </td>
      </tr>
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr>
        <td style="background-color:${BRAND_GREEN};border-radius:12px;">
          <a href="${APP_URL}/profile" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
            View your profile
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:24px 0 0;font-size:14px;color:${WEATHERED};line-height:1.6;text-align:center;">
      Spot it. Pick it. Clear it.
    </p>
  `);

  const text = `Welcome aboard, ${firstName}!

Thanks for signing up to Litter Pick. You're now part of a growing community helping to keep the UK clean.

Here's how to get started:

1. Report litter — snap a photo and drop a pin: ${APP_URL}/report
2. Explore the map — see hotspots near you: ${APP_URL}/map
3. Join a pick — team up with local volunteers: ${APP_URL}/picks

View your profile: ${APP_URL}/profile

Spot it. Pick it. Clear it.

—
Litter Pick — Care for your corner.
${APP_URL}`;

  return { subject, html, text };
}
