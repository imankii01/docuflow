/*
  # Fix RLS Policy Infinite Recursion

  1. Problem
    - The current RLS policies have circular dependencies causing infinite recursion
    - Documents table policy references document_shares table
    - Document_shares table policy references documents table
    - This creates a loop during policy evaluation

  2. Solution
    - Simplify policies to avoid circular references
    - Use direct user ID checks instead of complex subqueries
    - Ensure policies are self-contained and don't reference other tables with RLS
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read documents they own or have access to" ON documents;
DROP POLICY IF EXISTS "Users can read shares for their documents" ON document_shares;
DROP POLICY IF EXISTS "Document owners can manage shares" ON document_shares;

-- Create simplified, non-recursive policies for documents table
CREATE POLICY "Users can read own documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can read public documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (is_public = true);

-- Create simplified policies for document_shares table
CREATE POLICY "Users can read their own shares"
  ON document_shares
  FOR SELECT
  TO authenticated
  USING (shared_with = auth.uid() OR shared_by = auth.uid());

CREATE POLICY "Document owners can manage shares"
  ON document_shares
  FOR ALL
  TO authenticated
  USING (shared_by = auth.uid())
  WITH CHECK (shared_by = auth.uid());

-- Update other policies that might have similar issues
DROP POLICY IF EXISTS "Users can read versions of accessible documents" ON document_versions;
CREATE POLICY "Users can read versions of own documents"
  ON document_versions
  FOR SELECT
  TO authenticated
  USING (
    document_id IN (
      SELECT id FROM documents WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can read versions of public documents"
  ON document_versions
  FOR SELECT
  TO authenticated
  USING (
    document_id IN (
      SELECT id FROM documents WHERE is_public = true
    )
  );

DROP POLICY IF EXISTS "Users can create versions for accessible documents" ON document_versions;
CREATE POLICY "Users can create versions for own documents"
  ON document_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    document_id IN (
      SELECT id FROM documents WHERE created_by = auth.uid()
    ) AND uploaded_by = auth.uid()
  );

-- Fix comments policies
DROP POLICY IF EXISTS "Users can read comments on accessible documents" ON comments;
CREATE POLICY "Users can read comments on own documents"
  ON comments
  FOR SELECT
  TO authenticated
  USING (
    document_id IN (
      SELECT id FROM documents WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can read comments on public documents"
  ON comments
  FOR SELECT
  TO authenticated
  USING (
    document_id IN (
      SELECT id FROM documents WHERE is_public = true
    )
  );

DROP POLICY IF EXISTS "Users can create comments on accessible documents" ON comments;
CREATE POLICY "Users can create comments on own documents"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    document_id IN (
      SELECT id FROM documents WHERE created_by = auth.uid()
    ) AND created_by = auth.uid()
  );

-- Fix approvals policies
DROP POLICY IF EXISTS "Users can read approvals for accessible documents" ON approvals;
CREATE POLICY "Users can read approvals for own documents"
  ON approvals
  FOR SELECT
  TO authenticated
  USING (
    document_id IN (
      SELECT id FROM documents WHERE created_by = auth.uid()
    ) OR assigned_to = auth.uid()
  );

DROP POLICY IF EXISTS "Users can create approval requests" ON approvals;
CREATE POLICY "Users can create approval requests for own documents"
  ON approvals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    document_id IN (
      SELECT id FROM documents WHERE created_by = auth.uid()
    ) AND requested_by = auth.uid()
  );

-- Fix activity logs policies
DROP POLICY IF EXISTS "Users can read activity logs for accessible documents" ON activity_logs;
CREATE POLICY "Users can read activity logs for own documents"
  ON activity_logs
  FOR SELECT
  TO authenticated
  USING (
    document_id IN (
      SELECT id FROM documents WHERE created_by = auth.uid()
    )
  );