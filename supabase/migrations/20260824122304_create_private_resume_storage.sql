/*
# Create private resume storage

Adds the protected storage location needed for recruiter resume uploads.

1. New Storage Bucket
- `resumes`
  - Private bucket for PDF and DOCX resume files.
  - Maximum file size is 10 MB.
  - Allowed MIME types are application/pdf and the DOCX MIME type.

2. Storage Access Rules
- Authenticated users may create, read, update, and delete files only inside
  their own first-level user-id folder.
- The bucket is private, so files are not exposed through permanent public URLs.
- The frontend uses the signed-in user's id as the first folder in each path.

3. Important Notes
- Storage policies are separate from table RLS and are explicitly defined here.
- Upload validation is enforced by the bucket configuration as well as the UI.
- Re-running this migration is safe: the bucket and policies are idempotent.
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  false,
  10485760,
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']::text[]
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "resume_files_select_own_folder" ON storage.objects;
CREATE POLICY "resume_files_select_own_folder" ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "resume_files_insert_own_folder" ON storage.objects;
CREATE POLICY "resume_files_insert_own_folder" ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "resume_files_update_own_folder" ON storage.objects;
CREATE POLICY "resume_files_update_own_folder" ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resumes'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'resumes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "resume_files_delete_own_folder" ON storage.objects;
CREATE POLICY "resume_files_delete_own_folder" ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'resumes'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
