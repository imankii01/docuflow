/*
  # DocuFlow Database Schema

  1. New Tables
    - `documents`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text, optional)
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `is_public` (boolean, default false)

    - `document_versions`
      - `id` (uuid, primary key)
      - `document_id` (uuid, references documents)
      - `version_number` (integer)
      - `file_path` (text, Supabase Storage path)
      - `file_name` (text)
      - `file_size` (bigint)
      - `mime_type` (text)
      - `uploaded_by` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `notes` (text, optional)

    - `comments`
      - `id` (uuid, primary key)
      - `document_id` (uuid, references documents)
      - `version_id` (uuid, references document_versions)
      - `content` (text)
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `parent_id` (uuid, references comments for threading)

    - `approvals`
      - `id` (uuid, primary key)
      - `document_id` (uuid, references documents)
      - `version_id` (uuid, references document_versions)
      - `requested_by` (uuid, references auth.users)
      - `assigned_to` (uuid, references auth.users)
      - `status` (text, default 'pending')
      - `notes` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `activity_logs`
      - `id` (uuid, primary key)
      - `document_id` (uuid, references documents)
      - `user_id` (uuid, references auth.users)
      - `action` (text)
      - `details` (jsonb)
      - `created_at` (timestamp)

    - `document_shares`
      - `id` (uuid, primary key)
      - `document_id` (uuid, references documents)
      - `shared_with` (uuid, references auth.users)
      - `permission` (text, default 'view')
      - `shared_by` (uuid, references auth.users)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their documents
    - Add policies for shared document access
    - Add policies for collaboration features
*/

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_public boolean DEFAULT false
);

-- Create document_versions table
CREATE TABLE IF NOT EXISTS document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  version_number integer NOT NULL,
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  notes text,
  UNIQUE(document_id, version_number)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  version_id uuid REFERENCES document_versions(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE
);

-- Create approvals table
CREATE TABLE IF NOT EXISTS approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  version_id uuid REFERENCES document_versions(id) ON DELETE CASCADE,
  requested_by uuid REFERENCES auth.users(id) NOT NULL,
  assigned_to uuid REFERENCES auth.users(id) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  action text NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create document_shares table
CREATE TABLE IF NOT EXISTS document_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  shared_with uuid REFERENCES auth.users(id) NOT NULL,
  permission text DEFAULT 'view' CHECK (permission IN ('view', 'comment', 'edit')),
  shared_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(document_id, shared_with)
);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;

-- Documents policies
CREATE POLICY "Users can read documents they own or have access to"
  ON documents FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    is_public = true OR
    id IN (
      SELECT document_id FROM document_shares 
      WHERE shared_with = auth.uid()
    )
  );

CREATE POLICY "Users can create documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete their own documents"
  ON documents FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Document versions policies
CREATE POLICY "Users can read versions of accessible documents"
  ON document_versions FOR SELECT
  TO authenticated
  USING (
    document_id IN (
      SELECT id FROM documents 
      WHERE created_by = auth.uid() OR is_public = true OR
      id IN (SELECT document_id FROM document_shares WHERE shared_with = auth.uid())
    )
  );

CREATE POLICY "Users can create versions for accessible documents"
  ON document_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    document_id IN (
      SELECT id FROM documents 
      WHERE created_by = auth.uid() OR
      id IN (SELECT document_id FROM document_shares WHERE shared_with = auth.uid() AND permission IN ('edit'))
    ) AND uploaded_by = auth.uid()
  );

-- Comments policies
CREATE POLICY "Users can read comments on accessible documents"
  ON comments FOR SELECT
  TO authenticated
  USING (
    document_id IN (
      SELECT id FROM documents 
      WHERE created_by = auth.uid() OR is_public = true OR
      id IN (SELECT document_id FROM document_shares WHERE shared_with = auth.uid())
    )
  );

CREATE POLICY "Users can create comments on accessible documents"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    document_id IN (
      SELECT id FROM documents 
      WHERE created_by = auth.uid() OR
      id IN (SELECT document_id FROM document_shares WHERE shared_with = auth.uid() AND permission IN ('comment', 'edit'))
    ) AND created_by = auth.uid()
  );

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Approvals policies
CREATE POLICY "Users can read approvals for accessible documents"
  ON approvals FOR SELECT
  TO authenticated
  USING (
    document_id IN (
      SELECT id FROM documents 
      WHERE created_by = auth.uid() OR
      id IN (SELECT document_id FROM document_shares WHERE shared_with = auth.uid())
    ) OR assigned_to = auth.uid()
  );

CREATE POLICY "Users can create approval requests"
  ON approvals FOR INSERT
  TO authenticated
  WITH CHECK (
    document_id IN (
      SELECT id FROM documents 
      WHERE created_by = auth.uid() OR
      id IN (SELECT document_id FROM document_shares WHERE shared_with = auth.uid() AND permission IN ('edit'))
    ) AND requested_by = auth.uid()
  );

CREATE POLICY "Assigned users can update approval status"
  ON approvals FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

-- Activity logs policies
CREATE POLICY "Users can read activity logs for accessible documents"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (
    document_id IN (
      SELECT id FROM documents 
      WHERE created_by = auth.uid() OR
      id IN (SELECT document_id FROM document_shares WHERE shared_with = auth.uid())
    )
  );

CREATE POLICY "Users can create activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Document shares policies
CREATE POLICY "Users can read shares for their documents"
  ON document_shares FOR SELECT
  TO authenticated
  USING (
    document_id IN (
      SELECT id FROM documents WHERE created_by = auth.uid()
    ) OR shared_with = auth.uid()
  );

CREATE POLICY "Document owners can manage shares"
  ON document_shares FOR ALL
  TO authenticated
  USING (
    document_id IN (
      SELECT id FROM documents WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    document_id IN (
      SELECT id FROM documents WHERE created_by = auth.uid()
    ) AND shared_by = auth.uid()
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_created_by ON documents(created_by);
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_comments_document_id ON comments(document_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_document_id ON activity_logs(document_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_document_id ON document_shares(document_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_shared_with ON document_shares(shared_with);

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy
CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Users can read their accessible documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM documents 
      WHERE created_by = auth.uid() OR is_public = true OR
      id IN (SELECT document_id FROM document_shares WHERE shared_with = auth.uid())
    )
  );