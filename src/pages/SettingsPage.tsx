import { useState, type FormEvent } from 'react';
import { User, Mail, Check, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await supabase.from('profiles').update({ full_name: fullName }).eq('id', user!.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account information.</p>
      </div>

      <div className="max-w-lg rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
            {profile?.full_name?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{profile?.full_name ?? 'User'}</p>
            <p className="text-sm text-slate-400">{profile?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-8 space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              <span className="inline-flex items-center gap-1.5">
                <User size={15} /> Full name
              </span>
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              <span className="inline-flex items-center gap-1.5">
                <Mail size={15} /> Email
              </span>
            </label>
            <input
              value={profile?.email ?? ''}
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500"
            />
            <p className="mt-1 text-xs text-slate-400">Email cannot be changed.</p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            {saved && (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                <Check size={16} /> Saved
              </span>
            )}
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
