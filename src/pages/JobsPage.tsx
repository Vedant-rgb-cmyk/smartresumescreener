import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Briefcase, ArrowRight, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import JobFormModal from '@/components/JobFormModal';
import { useRouter } from '@/context/RouterContext';
import { supabase } from '@/lib/supabaseClient';
import type { Job } from '@/types/database';

export default function JobsPage() {
  const { navigate } = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadJobs = async () => {
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });
    setJobs((data as Job[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleCreate = () => {
    setEditingJob(null);
    setModalOpen(true);
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from('jobs').delete().eq('id', deleteId);
    setDeleteId(null);
    loadJobs();
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Jobs</h1>
          <p className="mt-1 text-sm text-slate-500">Create and manage your job postings.</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          <Plus size={18} /> New Job
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center text-sm text-slate-400">
          Loading…
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Briefcase size={28} />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-slate-900">No jobs yet</h3>
          <p className="mt-1 text-sm text-slate-500">
            Create your first job posting to start receiving candidates.
          </p>
          <button
            onClick={handleCreate}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={18} /> Create Job
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="group flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600"
                >
                  <Briefcase size={22} />
                </div>
                <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={() => handleEdit(job)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteId(job.id)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <button
                onClick={() => navigate({ name: 'job', id: job.id })}
                className="mt-4 flex-1 text-left"
              >
                <h3 className="font-semibold text-slate-900 group-hover:text-blue-600">
                  {job.title}
                </h3>
                <p className="mt-0.5 text-sm text-slate-400">
                  {job.department ?? 'No department'}
                </p>
                {job.required_skills && job.required_skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {job.required_skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.required_skills.length > 4 && (
                      <span className="px-1 py-0.5 text-xs text-slate-400">
                        +{job.required_skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </button>

              <button
                onClick={() => navigate({ name: 'job', id: job.id })}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Open job <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <JobFormModal
        open={modalOpen}
        job={editingJob}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          loadJobs();
        }}
      />

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertCircle size={24} />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">Delete this job?</h3>
            <p className="mt-2 text-sm text-slate-500">
              This will permanently remove the job and all its candidates and scores. This
              cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
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
    </DashboardLayout>
  );
}
