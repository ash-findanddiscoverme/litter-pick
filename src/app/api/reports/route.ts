import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient();
    const formData = await request.formData();

    const latitude = parseFloat(formData.get('latitude') as string);
    const longitude = parseFloat(formData.get('longitude') as string);
    const severity = formData.get('severity') as string;
    const note = formData.get('note') as string | null;
    const image = formData.get('image') as File | null;

    if (!latitude || !longitude || !severity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let image_url: string | null = null;

    // Upload image if provided
    if (image) {
      const fileName = `reports/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      const buffer = Buffer.from(await image.arrayBuffer());

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, buffer, {
          contentType: image.type || 'image/jpeg',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
      } else {
        const { data: publicUrl } = supabase.storage
          .from('photos')
          .getPublicUrl(uploadData.path);
        image_url = publicUrl.publicUrl;
      }
    }

    // Insert report
    const { data: report, error: insertError } = await supabase
      .from('reports')
      .insert({
        latitude,
        longitude,
        severity,
        note: note || null,
        image_url,
        source: 'web',
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to save report' }, { status: 500 });
    }

    // Trigger hotspot recalculation asynchronously
    // Using an edge function or a simple proximity check
    try {
      await recalculateHotspots(supabase, latitude, longitude);
    } catch (err) {
      console.error('Hotspot recalc error:', err);
      // Non-blocking — report still saved
    }

    return NextResponse.json({ report }, { status: 201 });
  } catch (err) {
    console.error('Report submission error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Simple hotspot recalculation:
 * Find nearby reports within HOTSPOT_RADIUS, and if enough exist,
 * create or update a hotspot.
 */
async function recalculateHotspots(
  supabase: ReturnType<typeof createServiceRoleClient>,
  lat: number,
  lng: number
) {
  const RADIUS_KM = 0.3;
  const MIN_REPORTS = 2;
  const RECENCY_DAYS = 30;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RECENCY_DAYS);

  // Find nearby recent reports using PostGIS ST_DWithin
  // Falls back to basic lat/lng box if PostGIS is not available
  const { data: nearbyReports, error } = await supabase
    .rpc('find_nearby_reports', {
      target_lat: lat,
      target_lng: lng,
      radius_km: RADIUS_KM,
      since: cutoffDate.toISOString(),
    });

  if (error || !nearbyReports || nearbyReports.length < MIN_REPORTS) {
    return;
  }

  // Calculate weighted score
  const severityWeights: Record<string, number> = { low: 1, medium: 2, bad: 3 };
  let score = 0;
  let sumLat = 0;
  let sumLng = 0;

  for (const r of nearbyReports) {
    score += severityWeights[r.severity] || 1;
    sumLat += r.latitude;
    sumLng += r.longitude;
  }

  const centroidLat = sumLat / nearbyReports.length;
  const centroidLng = sumLng / nearbyReports.length;

  // Check if there's already a hotspot near this centroid
  const { data: existingHotspots } = await supabase
    .rpc('find_nearby_hotspots', {
      target_lat: centroidLat,
      target_lng: centroidLng,
      radius_km: RADIUS_KM,
    });

  const latestBeforeImage = nearbyReports.find((r: { image_url: string | null }) => r.image_url)?.image_url || null;

  if (existingHotspots && existingHotspots.length > 0) {
    // Update existing hotspot
    const hotspot = existingHotspots[0];
    await supabase
      .from('hotspots')
      .update({
        score: Math.max(hotspot.score, score),
        report_count: nearbyReports.length,
        centroid_latitude: centroidLat,
        centroid_longitude: centroidLng,
        latest_before_image_url: latestBeforeImage || hotspot.latest_before_image_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', hotspot.id);

    // Link unlinked reports to this hotspot
    const reportIds = nearbyReports
      .filter((r: { hotspot_id: string | null }) => !r.hotspot_id)
      .map((r: { id: string }) => r.id);
    if (reportIds.length > 0) {
      await supabase
        .from('reports')
        .update({ hotspot_id: hotspot.id })
        .in('id', reportIds);
    }
  } else {
    // Create new hotspot
    const { data: newHotspot } = await supabase
      .from('hotspots')
      .insert({
        centroid_latitude: centroidLat,
        centroid_longitude: centroidLng,
        score,
        status: 'needs_attention',
        report_count: nearbyReports.length,
        volunteer_interest_count: 0,
        latest_before_image_url: latestBeforeImage,
      })
      .select()
      .single();

    if (newHotspot) {
      // Link reports to this hotspot
      const reportIds = nearbyReports.map((r: { id: string }) => r.id);
      await supabase
        .from('reports')
        .update({ hotspot_id: newHotspot.id })
        .in('id', reportIds);
    }
  }
}

export async function GET() {
  try {
    const supabase = createServiceRoleClient();

    const { data: reports, error } = await supabase
      .from('reports')
      .select('*')
      .order('submitted_at', { ascending: false })
      .limit(200);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }

    return NextResponse.json({ reports });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
