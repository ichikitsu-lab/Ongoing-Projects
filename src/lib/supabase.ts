import { createClient } from '@supabase/supabase-js';

export interface Database {
  public: {
    Tables: {
      members: {
        Row: {
          id: string;
          name: string;
          team: string;
          qualifications: string[];
          available_hours_start: string;
          available_hours_end: string;
          available_areas: string[];
          notes: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          team: string;
          qualifications?: string[];
          available_hours_start?: string;
          available_hours_end?: string;
          available_areas?: string[];
          notes?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          team?: string;
          qualifications?: string[];
          available_hours_start?: string;
          available_hours_end?: string;
          available_areas?: string[];
          notes?: string;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      external_partners: {
        Row: {
          id: string;
          name: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          date: string;
          work_time_start: string;
          work_time_end: string;
          location: string;
          work_content: string;
          required_members: number;
          notes: string;
          lead_member_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          date: string;
          work_time_start: string;
          work_time_end: string;
          location: string;
          work_content?: string;
          required_members?: number;
          notes?: string;
          lead_member_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          date?: string;
          work_time_start?: string;
          work_time_end?: string;
          location?: string;
          work_content?: string;
          required_members?: number;
          notes?: string;
          lead_member_id?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      project_member_assignments: {
        Row: {
          id: string;
          project_id: string;
          member_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          member_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          member_id?: string;
        };
      };
      project_external_partner_assignments: {
        Row: {
          id: string;
          project_id: string;
          partner_id: string;
          member_count: number;
          representative_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          partner_id: string;
          member_count?: number;
          representative_name?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          partner_id?: string;
          member_count?: number;
          representative_name?: string;
        };
      };
    };
  };
}

let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

export const getSupabaseClient = () => {
  const url = localStorage.getItem('supabase_url');
  const key = localStorage.getItem('supabase_key');
  
  if (!url || !key) {
    return null;
  }
  
  if (!supabaseClient) {
    supabaseClient = createClient<Database>(url, key);
  }
  
  return supabaseClient;
};

export const resetSupabaseClient = () => {
  supabaseClient = null;
};

// 設定変更時にクライアントをリセット
if (typeof window !== 'undefined') {
  window.addEventListener('supabaseConfigChanged', () => {
    resetSupabaseClient();
  });
}