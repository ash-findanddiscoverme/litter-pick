// Database types matching Supabase schema

export type ReportSeverity = 'low' | 'medium' | 'bad';
export type ReportStatus = 'pending' | 'confirmed' | 'spam' | 'cleaned';
export type HotspotStatus = 'needs_attention' | 'cleanup_forming' | 'recently_improved' | 'cleaned';
export type VolunteerType = 'solo' | 'group' | 'organise';
export type InterestType = 'help' | 'join' | 'organise';
export type CleanupStatus = 'forming' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type PhotoType = 'before' | 'after';
export type EquipmentStatus = 'own' | 'dont_need' | 'borrow';
export type UserStatus = 'active' | 'warned' | 'banned';

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
  county: string | null;
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
  equipment_bags: EquipmentStatus | null;
  equipment_bag_hoop: EquipmentStatus | null;
  equipment_gloves: EquipmentStatus | null;
  equipment_litter_picker: EquipmentStatus | null;
  status: UserStatus;
  warn_reason: string | null;
  ban_reason: string | null;
  warned_at: string | null;
  banned_at: string | null;
  created_at: string;
}

export interface VolunteerInterest {
  id: string;
  user_id: string;
  hotspot_id: string;
  interest_type: InterestType;
  created_at: string;
}

export type EquipmentProvision = 'volunteers' | 'organiser';

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
  equipment_provision?: EquipmentProvision | null;
  equipment_bags_confirmed?: number | null;
  equipment_hoops_confirmed?: number | null;
  equipment_gloves_confirmed?: number | null;
  equipment_pickers_confirmed?: number | null;
  event_confirmed?: boolean | null;
  after_photos?: string[] | null;
  meet_lat?: number | null;
  meet_lng?: number | null;
  meet_instructions?: string | null;
}

export interface EquipmentRequest {
  id: string;
  cleanup_id: string;
  user_id: string;
  item_type: 'bags' | 'hoops' | 'gloves' | 'pickers';
  status: 'requested' | 'confirmed' | 'declined';
  created_at: string;
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
  hotspot_county: string | null;
  hotspot_lat: number;
  hotspot_lng: number;
  hotspot_image: string | null;
  has_council: boolean;
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

export interface CleanupQuestion {
  id: string;
  cleanup_id: string;
  user_id: string;
  question: string;
  created_at: string;
  is_hidden: boolean;
}

export interface CleanupAnswer {
  id: string;
  question_id: string;
  user_id: string;
  answer: string;
  created_at: string;
  is_hidden: boolean;
}

export interface QuestionWithAnswers extends CleanupQuestion {
  user: {
    id: string;
    first_name: string;
    avatar_url: string | null;
  };
  answers: Array<CleanupAnswer & {
    user: {
      id: string;
      first_name: string;
      avatar_url: string | null;
    };
  }>;
}

export type FeedbackStatus = 'new' | 'reviewed' | 'actioned' | 'archived';

export interface Feedback {
  id: string;
  user_id: string | null;
  page_url: string;
  message: string;
  email: string | null;
  status: FeedbackStatus;
  created_at: string;
  reviewed_at: string | null;
  admin_notes: string | null;
}
