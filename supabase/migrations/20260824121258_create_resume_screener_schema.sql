/*
# Smart Resume Screener - Initial Schema

Creates the four core tables for the Smart Resume Screener MVP and their
row-level security policies. This is a multi-user app (sign-in required), so
all tables are owner-scoped via user_id / job ownership checks.

1. New Tables
- `profiles`
  - id (uuid, PK, references auth.users)
  - full_name (text)
  - email (text)
  - created_at (timestamptz)
  One row per authenticated user, created on signup.
- `jobs`
  - id (uuid, PK)
  - user_id (uuid, FK -> auth.users, defaults to auth.uid())
  - title, department, required_skills (text[]), experience_required (text),
    description (text), created_at
  A recruiting job posting owned by a recruiter.
- `candidates`
  - id (uuid, PK)
  - job_id (uuid, FK -> jobs, cascade delete)
  - name, email, phone, skills (text[]), experience (text), education (text),
    resume_text (text), resume_file_path (text), created_at
  A candidate attached to a job. Ownership derived from the job's owner.
- `scores`
  - id (uuid, PK)
  - candidate_id (uuid, FK -> candidates, cascade delete)
  - overall_score, skill_score, experience_score, relevance_score (numeric)
  - matched_skills, missing_skills (text[])
  - ai_summary (text), created_at
  Score record for a candidate. Ownership derived via candidate -> job.

2. Security
- RLS enabled on all four tables.
- profiles: owner can select/update own row; insert on signup.
- jobs: owner-scoped CRUD via auth.uid() = user_id.
- candidates & scores: ownership derived from the parent job's user_id via
  EXISTS subquery against jobs.
- user_id defaults to auth.uid() so frontend inserts without user_id succeed.

3. Important Notes
- Email confirmation stays OFF (default).
- Policies are idempotent (DROP IF EXISTS before CREATE).
- Indexes added on foreign keys for query performance.
*/

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- jobs
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  department text,
  required_skills text[] DEFAULT '{}',
  experience_required text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_jobs" ON jobs;
CREATE POLICY "select_own_jobs" ON jobs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_jobs" ON jobs;
CREATE POLICY "insert_own_jobs" ON jobs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_jobs" ON jobs;
CREATE POLICY "update_own_jobs" ON jobs FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_jobs" ON jobs;
CREATE POLICY "delete_own_jobs" ON jobs FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS jobs_user_id_idx ON jobs(user_id);

-- candidates
CREATE TABLE IF NOT EXISTS candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  skills text[] DEFAULT '{}',
  experience text,
  education text,
  resume_text text,
  resume_file_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_candidates" ON candidates;
CREATE POLICY "select_own_candidates" ON candidates FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM jobs WHERE jobs.id = candidates.job_id AND jobs.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_candidates" ON candidates;
CREATE POLICY "insert_own_candidates" ON candidates FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM jobs WHERE jobs.id = candidates.job_id AND jobs.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_candidates" ON candidates;
CREATE POLICY "update_own_candidates" ON candidates FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM jobs WHERE jobs.id = candidates.job_id AND jobs.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM jobs WHERE jobs.id = candidates.job_id AND jobs.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_candidates" ON candidates;
CREATE POLICY "delete_own_candidates" ON candidates FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM jobs WHERE jobs.id = candidates.job_id AND jobs.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS candidates_job_id_idx ON candidates(job_id);

-- scores
CREATE TABLE IF NOT EXISTS scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  overall_score numeric,
  skill_score numeric,
  experience_score numeric,
  relevance_score numeric,
  matched_skills text[] DEFAULT '{}',
  missing_skills text[] DEFAULT '{}',
  ai_summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_scores" ON scores;
CREATE POLICY "select_own_scores" ON scores FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM candidates
      JOIN jobs ON jobs.id = candidates.job_id
      WHERE candidates.id = scores.candidate_id AND jobs.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_scores" ON scores;
CREATE POLICY "insert_own_scores" ON scores FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM candidates
      JOIN jobs ON jobs.id = candidates.job_id
      WHERE candidates.id = scores.candidate_id AND jobs.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_own_scores" ON scores;
CREATE POLICY "update_own_scores" ON scores FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM candidates
      JOIN jobs ON jobs.id = candidates.job_id
      WHERE candidates.id = scores.candidate_id AND jobs.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM candidates
      JOIN jobs ON jobs.id = candidates.job_id
      WHERE candidates.id = scores.candidate_id AND jobs.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_scores" ON scores;
CREATE POLICY "delete_own_scores" ON scores FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM candidates
      JOIN jobs ON jobs.id = candidates.job_id
      WHERE candidates.id = scores.candidate_id AND jobs.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS scores_candidate_id_idx ON scores(candidate_id);
