import { useEffect, useState } from 'react';
import { Users, ArrowRight } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useRouter } from '@/context/RouterContext';
import { supabase } from '@/lib/supabaseClient';
import type { Candidate, Job } from '@/types/database';

type CandidateWithJob = Candidate & { jobs: Pick<Job, 'title'> | null };

export default function CandidatesPage() {
  const { navigate } = useRouter();
  const [candidates, setCandidates] = useState<CandidateWithJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('candidates')
        .select('*, jobs(title)')
        .order('created_at', { ascending: false });
      setCandidates((data as CandidateWithJob[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Candidates</h1>
        <p className="mt-1 text-sm text-slate-500">All candidates across your jobs.</p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center text-sm text-slate-400">
          Loading…
        </div>
      ) : candidates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Users size={28} />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-slate-900">No candidates yet</h3>
          <p className="mt-1 text-sm text-slate-500">
            Candidates will appear here once you upload resumes to a job.
          </p>
          <button
            onClick={() => navigate({ name: 'jobs' })}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Go to Jobs <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Job</th>
                <th className="hidden px-6 py-3 sm:table-cell">Email</th>
                <th className="hidden px-6 py-3 md:table-cell">Skills</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {candidates.map((c) => (
                <tr key={c.id} className="transition hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-900">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{c.jobs?.title ?? '—'}</td>
                  <td className="hidden px-6 py-4 text-slate-500 sm:table-cell">
                    {c.email ?? '—'}
                  </td>
                  <td className="hidden px-6 py-4 md:table-cell">
                    {c.skills && c.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {c.skills.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
