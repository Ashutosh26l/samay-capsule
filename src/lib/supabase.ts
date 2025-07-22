import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      capsules: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          file_url: string | null;
          file_type: string | null;
          release_date: string;
          created_at: string;
          ai_summary: string | null;
          ai_future_reply: string | null;
          is_public: boolean;
          is_unlocked: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          file_url?: string | null;
          file_type?: string | null;
          release_date: string;
          created_at?: string;
          ai_summary?: string | null;
          ai_future_reply?: string | null;
          is_public?: boolean;
          is_unlocked?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          file_url?: string | null;
          file_type?: string | null;
          release_date?: string;
          created_at?: string;
          ai_summary?: string | null;
          ai_future_reply?: string | null;
          is_public?: boolean;
          is_unlocked?: boolean;
        };
      };
    };
  };
};

export type Capsule = Database['public']['Tables']['capsules']['Row'];