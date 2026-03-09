import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const serviceClient = createServiceRoleClient();
    const formData = await request.formData();
    const file = formData.get('avatar') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (max 2MB — already compressed client-side)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 2MB)' }, { status: 400 });
    }

    const buffer = new Uint8Array(await file.arrayBuffer());
    const fileName = `avatars/${user.id}.webp`;

    // Upload to Supabase Storage (overwrite existing)
    const { error: uploadError } = await serviceClient.storage
      .from('photos')
      .upload(fileName, buffer, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (uploadError) {
      console.error('Avatar upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 });
    }

    // Get public URL
    const { data: publicUrl } = serviceClient.storage
      .from('photos')
      .getPublicUrl(fileName);

    // Add cache-busting param so browsers pick up the new image
    const avatarUrl = `${publicUrl.publicUrl}?v=${Date.now()}`;

    // Update user profile in the users table
    const { error: updateError } = await serviceClient
      .from('users')
      .update({ avatar_url: avatarUrl })
      .eq('id', user.id);

    if (updateError) {
      console.error('Profile table update error:', updateError);
    }

    // Also store in auth user metadata so it persists even without a profile row
    const { error: metaError } = await serviceClient.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, avatar_url: avatarUrl },
    });

    if (metaError) {
      console.error('User metadata update error:', metaError);
    }

    return NextResponse.json({ avatar_url: avatarUrl });
  } catch (err) {
    console.error('Avatar error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
