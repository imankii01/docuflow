import { supabase } from './supabase';
import type { Database } from './supabase';
import { v4 as uuidv4 } from 'uuid';

type Document = Database['public']['Tables']['documents']['Row'];
type DocumentVersion = Database['public']['Tables']['document_versions']['Row'];
type Comment = Database['public']['Tables']['comments']['Row'];
type Approval = Database['public']['Tables']['approvals']['Row'];
type ActivityLog = Database['public']['Tables']['activity_logs']['Row'];

export const createDocument = async (title: string, description?: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('documents')
    .insert({
      title,
      description,
      created_by: user.id,
    })
    .select()
    .single();

  if (!error && data) {
    await logActivity(data.id, 'document_created', { title });
  }

  return { data, error };
};

export const uploadDocumentVersion = async (
  documentId: string,
  file: File,
  notes?: string
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get the next version number
  const { data: versions } = await supabase
    .from('document_versions')
    .select('version_number')
    .eq('document_id', documentId)
    .order('version_number', { ascending: false })
    .limit(1);

  const nextVersion = versions && versions.length > 0 ? versions[0].version_number + 1 : 1;

  // Upload file to Supabase Storage
  const fileExt = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `${documentId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file);

  if (uploadError) {
    return { data: null, error: uploadError };
  }

  // Create version record
  const { data, error } = await supabase
    .from('document_versions')
    .insert({
      document_id: documentId,
      version_number: nextVersion,
      file_path: filePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: user.id,
      notes,
    })
    .select()
    .single();

  if (!error && data) {
    await logActivity(documentId, 'version_uploaded', { 
      version: nextVersion, 
      fileName: file.name 
    });
  }

  return { data, error };
};

export const getDocuments = async () => {
  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      document_versions (
        id,
        version_number,
        file_name,
        created_at
      )
    `)
    .order('updated_at', { ascending: false });

  return { data, error };
};

export const getDocument = async (documentId: string) => {
  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      document_versions (
        id,
        version_number,
        file_name,
        file_size,
        mime_type,
        created_at,
        notes,
        uploaded_by
      )
    `)
    .eq('id', documentId)
    .single();

  return { data, error };
};

export const getDocumentVersions = async (documentId: string) => {
  const { data, error } = await supabase
    .from('document_versions')
    .select('*')
    .eq('document_id', documentId)
    .order('version_number', { ascending: false });

  return { data, error };
};

export const downloadDocumentVersion = async (filePath: string) => {
  const { data, error } = await supabase.storage
    .from('documents')
    .download(filePath);

  return { data, error };
};

export const addComment = async (
  documentId: string,
  content: string,
  versionId?: string,
  parentId?: string
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('comments')
    .insert({
      document_id: documentId,
      version_id: versionId,
      content,
      created_by: user.id,
      parent_id: parentId,
    })
    .select()
    .single();

  if (!error && data) {
    await logActivity(documentId, 'comment_added', { content: content.substring(0, 50) });
  }

  return { data, error };
};

export const getComments = async (documentId: string, versionId?: string) => {
  let query = supabase
    .from('comments')
    .select('*')
    .eq('document_id', documentId);

  if (versionId) {
    query = query.eq('version_id', versionId);
  }

  const { data, error } = await query
    .order('created_at', { ascending: true });

  return { data, error };
};

export const requestApproval = async (
  documentId: string,
  assignedTo: string,
  versionId?: string,
  notes?: string
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('approvals')
    .insert({
      document_id: documentId,
      version_id: versionId,
      requested_by: user.id,
      assigned_to: assignedTo,
      notes,
    })
    .select()
    .single();

  if (!error && data) {
    await logActivity(documentId, 'approval_requested', { assignedTo });
  }

  return { data, error };
};

export const updateApprovalStatus = async (
  approvalId: string,
  status: 'approved' | 'rejected',
  notes?: string
) => {
  const { data, error } = await supabase
    .from('approvals')
    .update({
      status,
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', approvalId)
    .select()
    .single();

  if (!error && data) {
    await logActivity(data.document_id, 'approval_updated', { status });
  }

  return { data, error };
};

export const getApprovals = async (documentId: string) => {
  const { data, error } = await supabase
    .from('approvals')
    .select('*')
    .eq('document_id', documentId)
    .order('created_at', { ascending: false });

  return { data, error };
};

export const logActivity = async (
  documentId: string,
  action: string,
  details?: any
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('activity_logs')
    .insert({
      document_id: documentId,
      user_id: user.id,
      action,
      details,
    });
};

export const getActivityLog = async (documentId: string) => {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('document_id', documentId)
    .order('created_at', { ascending: false })
    .limit(50);

  return { data, error };
};

export const shareDocument = async (
  documentId: string,
  sharedWith: string,
  permission: 'view' | 'comment' | 'edit'
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('document_shares')
    .upsert({
      document_id: documentId,
      shared_with: sharedWith,
      permission,
      shared_by: user.id,
    })
    .select()
    .single();

  if (!error && data) {
    await logActivity(documentId, 'document_shared', { 
      sharedWith, 
      permission 
    });
  }

  return { data, error };
};