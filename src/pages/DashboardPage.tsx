import { useEffect, useState } from 'react';
import { Briefcase, Users, TrendingUp, ArrowRight } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useRouter } from '@/context/RouterContext';
import { supabase } from '@/lib/supabaseClient';
import type { Job, Score } from '@/types/database';

export default function DashboardPage() {
  const { navigate } = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidateCount, setCandidateCount] = useState(0);
  const [avgScore, setAvgScore] = useState<number | null>(null);
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

      const { data: scoreData } = await supabase.from('scores').select('overall_score');
      const scores = (scoreData as Score[]) ?? [];
      if (scores.length > 0) {
        const total = scores.reduce((sum, s) => sum + (s.overall_score ?? 0), 0);
        setAvgScore(Math.round(total / scores.length));
      } else {
        setAvgScore(null);
      }

      setLoading(false);
    })();
  }, []);

  const recentJobs = jobs.slice(0, 5);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          An overview of your recruiting activity.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={Briefcase}
          label="Total Jobs"
          value={loading ? '—' : String(jobs.length)}
          color="blue"
        />
        <StatCard
          icon={Users}
          label="Total Candidates"
          value={loading ? '—' : String(candidateCount)}
          color="emerald"
        />
        <StatCard
          icon={TrendingUp}
          label="Average Match Score"
          value={loading ? '—' : avgScore !== null ? `${avgScore}%` : 'N/A'}
          color="amber"
        />
      </div>

      {/* Recent jobs */}
      <div className="mt-8 rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-slate-900">Recent Jobs</h2>
          <button
            onClick={() => navigate({ name: 'jobs' })}
            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            View all <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-slate-400">Loading…</div>
        ) : recentJobs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-slate-500">You haven&apos;t created any jobs yet.</p>
            <button
              onClick={() => navigate({ name: 'jobs' })}
              className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Create your first job
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentJobs.map((job) => (
              <button
                key={job.id}
                onClick={() => navigate({ name: 'job', id: job.id })}
                className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-900">{job.title}</p>
                  <p className="text-sm text-slate-400">
                    {job.department ?? 'No department'} ·{' '}
                    {job.required_skills?.length ?? 0} skills required
                  </p>
                </div>
                <ArrowRight size={16} className="text-slate-300" />
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Briefcase;
  label: string;
  value: string;
  color: 'blue' | 'emerald' | 'amber';
}) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${colorMap[color]}`}>
        <Icon size={22} />
      </div>
      <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}
