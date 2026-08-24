import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Upload,
  Briefcase,
  Building2,
  Clock,
  Pencil,
  Trash2,
  Users,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import JobFormModal from '@/components/JobFormModal';
import ResumeUploadModal from '@/components/ResumeUploadModal';
import CandidateCard from '@/components/CandidateCard';
import { useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import type { Job, Candidate } from '@/types/database';

export default function JobDetailPage({ jobId }: { jobId: string }) {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const loadData = async () => {
    const { data: jobData } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .maybeSingle();
    setJob(jobData as Job | null);

    const { data: candData } = await supabase
      .from('candidates')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });
    setCandidates((candData as Candidate[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const handleDelete = async () => {
    await supabase.from('jobs').delete().eq('id', jobId);
    navigate({ name: 'jobs' });
  };


  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 size={24} className="animate-spin text-blue-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center">
          <p className="text-slate-500">Job not found.</p>
          <button
            onClick={() => navigate({ name: 'jobs' })}
            className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Back to Jobs
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <button
        onClick={() => navigate({ name: 'jobs' })}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
      >
        <ArrowLeft size={16} /> Back to Jobs
      </button>

      {/* Job header */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
              {job.department && (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 size={15} /> {job.department}
                </span>
              )}
              {job.experience_required && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={15} /> {job.experience_required}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Briefcase size={15} /> {candidates.length} candidates
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Pencil size={15} /> Edit
            </button>
            <button
              onClick={() => setDeleteOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <Trash2 size={15} /> Delete
            </button>
          </div>
        </div>

        {job.required_skills && job.required_skills.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Required skills
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {job.required_skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {job.description && (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Description
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {job.description}
            </p>
          </div>
        )}
      </div>

      {/* Upload section */}
      <div className="mt-6 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-sky-50 p-6 md:p-8">
        <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <Upload size={26} />
          </div>
          <div className="mt-4 flex-1 sm:mt-0 sm:ml-5">
            <h2 className="text-lg font-bold text-slate-900">Candidate Resumes</h2>
            <p className="mt-1 text-sm text-slate-600">
              Upload candidate resumes to this job for processing.
            </p>
          </div>
          <button
            onClick={() => setUploadOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 sm:mt-0"
          >
            <Upload size={18} /> Upload Resumes
          </button>
        </div>
      </div>

      {/* Candidates list */}
      <div className="mt-6 rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-slate-900">Candidates ({candidates.length})</h2>
        </div>
        {candidates.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <Users size={24} />
            </div>
            <p className="mt-4 text-sm text-slate-500">
              No candidates yet. Upload resumes to get started.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {candidates.map((c) => (
              <CandidateCard key={c.id} candidate={c} onUpdated={loadData} />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <JobFormModal
        open={editOpen}
        job={job}
        onClose={() => setEditOpen(false)}
        onSaved={() => {
          setEditOpen(false);
          loadData();
        }}
      />

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setDeleteOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertCircle size={24} />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">Delete this job?</h3>
            <p className="mt-2 text-sm text-slate-500">
              This will permanently remove the job and all its candidates and scores.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteOpen(false)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ResumeUploadModal
        open={uploadOpen}
        jobId={jobId}
        userId={user!.id}
        onClose={() => setUploadOpen(false)}
        onUploaded={loadData}
      />
    </DashboardLayout>
  );
}
