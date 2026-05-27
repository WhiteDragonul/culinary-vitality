import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://gbeewcuyzneyliuhyzts.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Xz80qycHi--llEFPRi2Geg_igikXBT1";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// DATABASE TYPES
// ==========================================

export interface DBProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_initials: string;
  avatar_color: string;
  created_at: string;
}

export interface DBFriendRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  // Joined from profiles
  from_profile?: DBProfile;
}

export interface DBNotification {
  id: string;
  user_id: string;
  type: "friend_request" | "system";
  read: boolean;
  created_at: string;
  friend_request_id?: string;
  message?: string;
}
