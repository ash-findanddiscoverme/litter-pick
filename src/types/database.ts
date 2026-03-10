// Database types matching Supabase schema

export type ReportSeverity = 'low' | 'medium' | 'bad';
export type ReportStatus = 'pending' | 'confirmed' | 'spam' | 'cleaned';
export type HotspotStatus = 'needs_attention' | 'cleanup_forming' | 'recently_improved' | 'cleaned';
export type VolunteerType = 'solo' | 'group' | 'organise';
export type InterestType = 'help' | 'join' | 'organise';
export type CleanupStatus = 'forming' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type PhotoType = 'before' | 'after';

export interface Report {
  id: string;
  user_id: string | null;
  image_url: string | null;
  latitude: number;
  longitude: number;
  severity: ReportSeverity;
  note: string | null;
  submitted_at: string;
  source: string;
  hotspot_id: string | null;
  status: ReportStatus;
}

export interface Hotspot {
  id: string;
  centroid_latitude: number;
  centroid_longitude: number;
  score: number;
  status: HotspotStatus;
  created_at: string;
  updated_at: string;
  latest_before_image_url: string | null;
  latest_after_image_url: string | null;
  report_count: number;
  volunteer_interest_count: number;
  area_name: string | null;
}

export interface User {
  id: string;
  first_name: string;
  email: string;
  phone: string | null;
  postcode_or_town: string;
  volunteer_type: VolunteerType;
  avatar_url: string | null;
  volunteer_lat: number | null;
  volunteer_lng: number | null;
  volunteer_radius_km: number | null;
  created_at: string;
}

export interface VolunteerInterest {
  id: string;
  user_id: string;
  hotspot_id: string;
  interest_type: InterestType;
  created_at: string;
}

export interface Cleanup {
  id: string;
  hotspot_id: string;
  organiser_user_id: string | null;
  status: CleanupStatus;
  proposed_time: string | null;
  completed_at: string | null;
  volunteer_count: number;
  bags_collected: number | null;
  notes: string | null;
  council_notified?: boolean | null;
  council_collection_confirmed?: boolean | null;
}

export interface CleanupPhoto {
  id: string;
  cleanup_id: string;
  photo_type: PhotoType;
  image_url: string;
  uploaded_by_user_id: string | null;
  created_at: string;
}

// API request/response types
export interface ReportInput {
  image: File | null;
  latitude: number;
  longitude: number;
  severity: ReportSeverity;
  note?: string;
}

export interface VolunteerSignupInput {
  first_name: string;
  email: string;
  password: string;
  phone?: string;
  postcode_or_town: string;
  volunteer_type: VolunteerType;
}

export interface PickWithDetails {
  id: string;
  hotspot_id: string;
  hotspot_name: string | null;
  hotspot_lat: number;
  hotspot_lng: number;
  organiser_id: string;
  organiser_name: string;
  organiser_avatar: string | null;
  proposed_time: string;
  volunteer_count: number;
  notes: string | null;
  status: CleanupStatus;
  council_notified?: boolean | null;
  council_collection_confirmed?: boolean | null;
}

export interface CleanupCompletionInput {
  cleanup_id: string;
  after_image: File;
  status: 'improved' | 'mostly_cleared' | 'fully_cleaned';
  bags_collected?: number;
  volunteer_count?: number;
}
