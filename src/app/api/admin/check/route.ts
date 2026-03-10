import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/admin';

export const runtime = 'edge';

/** GET /api/admin/check — returns whether the current user is an admin */
export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ isAdmin: false });
    }

    return NextResponse.json({ isAdmin: isAdminEmail(user.email) });
  } catch {
    return NextResponse.json({ isAdmin: false });
  }
}
