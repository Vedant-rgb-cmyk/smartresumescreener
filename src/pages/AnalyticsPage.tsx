import { useEffect, useState } from 'react';
import { TrendingUp, Briefcase, Users, Award } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabaseClient';
import type { Job, Score } from '@/types/database';

export default function AnalyticsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidateCount, setCandidateCount] = useState(0);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: jobData } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      setJobs((jobData as Job[]) ?? []);

      const { count } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true });
      setCandidateCount(count ?? 0);

      const { data: scoreData } = await supabase.from('scores').select('*');
      setScores((scoreData as Score[]) ?? []);

      setLoading(false);
    })();
  }, []);

  const avg = (key: keyof Pick<Score, 'overall_score' | 'skill_score' | 'experience_score' | 'relevance_score'>) => {
    const valid = scores.filter((s) => s[key] != null);
    if (valid.length === 0) return null;
    return Math.round(valid.reduce((sum, s) => sum + (s[key] ?? 0), 0) / valid.length);
  };

  const avgOverall = avg('overall_score');
  const avgSkill = avg('skill_score');
  const avgExperience = avg('experience_score');
  const avgRelevance = avg('relevance_score');

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">
          Key metrics across all your jobs and candidates.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center text-sm text-slate-400">
          Loading…
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard icon={Briefcase} label="Total Jobs" value={String(jobs.length)} />
            <MetricCard icon={Users} label="Total Candidates" value={String(candidateCount)} />
            <MetricCard
              icon={TrendingUp}
              label="Avg Overall Score"
              value={avgOverall !== null ? `${avgOverall}%` : 'N/A'}
            />
            <MetricCard
              icon={Award}
              label="Scored Candidates"
              value={String(scores.length)}
            />
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <ScoreBar label="Avg Skill Score" value={avgSkill} />
            <ScoreBar label="Avg Experience Score" value={avgExperience} />
            <ScoreBar label="Avg Relevance Score" value={avgRelevance} />
          </div>

          {scores.length === 0 && (
            <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-12 text-center">
              <p className="text-sm text-slate-500">
                No match scores yet. Scoring will appear here once candidates are scored
                against your jobs.
              </p>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Briefcase;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={20} />
      </div>
      <p className="mt-4 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">
        {value !== null ? `${value}%` : 'N/A'}
      </p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        {value !== null && (
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-700"
            style={{ width: `${Math.min(value, 100)}%` }}
          />
        )}
      </div>
    </div>
  );
}
