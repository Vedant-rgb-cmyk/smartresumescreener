/*
# Add parse_status column to candidates

1. Modified Tables
- `candidates`
  - New column `parse_status` (text, not null, default 'processing')
  - Tracks the AI resume parsing state for each candidate.
  - Allowed values: 'processing', 'completed', 'failed'.

2. Security
- No policy changes. The existing owner-scoped RLS policies on candidates
  already cover UPDATE, so the new column is writable by the owning recruiter.

3. Important Notes
- Idempotent: uses DO $$ block to check before adding.
- Existing rows get the default 'processing' value, which the UI treats as
  "still processing" — they can be retried from the Job Detail page.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'parse_status'
  ) THEN
    ALTER TABLE candidates ADD COLUMN parse_status text NOT NULL DEFAULT 'processing';
  END IF;
END $$;
