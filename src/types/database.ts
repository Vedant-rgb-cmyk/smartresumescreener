export type Profile = {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
};

export type Job = {
  id: string;
  user_id: string;
  title: string;
  department: string | null;
  required_skills: string[];
  experience_required: string | null;
  description: string | null;
  created_at: string;
};

export type Candidate = {
  id: string;
  job_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  skills: string[];
  experience: string | null;
  education: string | null;
  resume_text: string | null;
  resume_file_path: string | null;
  parse_status: 'processing' | 'completed' | 'failed';
  created_at: string;
};

export type Score = {
  id: string;
  candidate_id: string;
  overall_score: number | null;
  skill_score: number | null;
  experience_score: number | null;
  relevance_score: number | null;
  matched_skills: string[];
  missing_skills: string[];
  ai_summary: string | null;
  created_at: string;
};

export type CandidateWithScores = Candidate & {
  scores: Score | null;
};
