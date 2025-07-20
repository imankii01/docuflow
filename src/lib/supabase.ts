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
      documents: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
          is_public: boolean;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          is_public?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          is_public?: boolean;
        };
      };
      document_versions: {
        Row: {
          id: string;
          document_id: string;
          version_number: number;
          file_path: string;
          file_name: string;
          file_size: number;
          mime_type: string;
          uploaded_by: string;
          created_at: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          document_id: string;
          version_number: number;
          file_path: string;
          file_name: string;
          file_size: number;
          mime_type: string;
          uploaded_by: string;
          created_at?: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          document_id?: string;
          version_number?: number;
          file_path?: string;
          file_name?: string;
          file_size?: number;
          mime_type?: string;
          uploaded_by?: string;
          created_at?: string;
          notes?: string | null;
        };
      };
      comments: {
        Row: {
          id: string;
          document_id: string;
          version_id: string | null;
          content: string;
          created_by: string;
          created_at: string;
          updated_at: string;
          parent_id: string | null;
        };
        Insert: {
          id?: string;
          document_id: string;
          version_id?: string | null;
          content: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          parent_id?: string | null;
        };
        Update: {
          id?: string;
          document_id?: string;
          version_id?: string | null;
          content?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          parent_id?: string | null;
        };
      };
      approvals: {
        Row: {
          id: string;
          document_id: string;
          version_id: string | null;
          requested_by: string;
          assigned_to: string;
          status: 'pending' | 'approved' | 'rejected';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          version_id?: string | null;
          requested_by: string;
          assigned_to: string;
          status?: 'pending' | 'approved' | 'rejected';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          version_id?: string | null;
          requested_by?: string;
          assigned_to?: string;
          status?: 'pending' | 'approved' | 'rejected';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          document_id: string;
          user_id: string;
          action: string;
          details: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          user_id: string;
          action: string;
          details?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          user_id?: string;
          action?: string;
          details?: any;
          created_at?: string;
        };
      };
      document_shares: {
        Row: {
          id: string;
          document_id: string;
          shared_with: string;
          permission: 'view' | 'comment' | 'edit';
          shared_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          shared_with: string;
          permission?: 'view' | 'comment' | 'edit';
          shared_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          shared_with?: string;
          permission?: 'view' | 'comment' | 'edit';
          shared_by?: string;
          created_at?: string;
        };
      };
    };
  };
};