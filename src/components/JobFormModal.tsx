import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import type { Job } from '@/types/database';

type Props = {
  open: boolean;
  job: Job | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function JobFormModal({ open, job, onClose, onSaved }: Props) {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [experienceRequired, setExperienceRequired] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(job?.title ?? '');
      setDepartment(job?.department ?? '');
      setRequiredSkills(job?.required_skills?.join(', ') ?? '');
      setExperienceRequired(job?.experience_required ?? '');
      setDescription(job?.description ?? '');
      setError(null);
    }
  }, [open, job]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const skills = requiredSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title,
      department: department || null,
      required_skills: skills,
      experience_required: experienceRequired || null,
      description: description || null,
    };

    if (job) {
      const { error } = await supabase.from('jobs').update(payload).eq('id', job.id);
      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from('jobs').insert(payload);
      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">
            {job ? 'Edit Job' : 'Create New Job'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Job title <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Senior Frontend Engineer"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Department</label>
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Engineering"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Required skills
            </label>
            <input
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              placeholder="React, TypeScript, Tailwind"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <p className="mt-1 text-xs text-slate-400">Separate skills with commas.</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Experience required
            </label>
            <input
              value={experienceRequired}
              onChange={(e) => setExperienceRequired(e.target.value)}
              placeholder="5+ years"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Job description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the role, responsibilities, and what you're looking for…"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? 'Saving…' : job ? 'Save changes' : 'Create job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
