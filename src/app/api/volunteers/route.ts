import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email';
import { welcomeEmail } from '@/lib/email-templates';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient();
    const body = await request.json();

    const { first_name, email, password, phone, postcode_or_town, volunteer_type } = body;

    if (!first_name || !email || !password || !postcode_or_town) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for MVP
      user_metadata: { first_name },
    });

    if (authError) {
      console.error('Auth error:', authError);
      if (authError.message?.includes('already')) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        first_name,
        email,
        phone: phone || null,
        postcode_or_town,
        volunteer_type: volunteer_type || 'group',
      });

    if (profileError) {
      console.error('Profile error:', profileError);
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
    }

    // Send welcome email (fire-and-forget — don't block signup on email delivery)
    const welcome = welcomeEmail(first_name);
    sendEmail({ to: email, ...welcome }).catch((err) =>
      console.error('[volunteers] Welcome email failed:', err)
    );

    // Client will sign in separately after receiving success
    return NextResponse.json({ user: { id: authData.user.id, email } }, { status: 201 });
  } catch (err) {
    console.error('Volunteer signup error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
