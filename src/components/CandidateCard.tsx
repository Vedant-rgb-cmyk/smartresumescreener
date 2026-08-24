import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { parseResume } from '@/lib/parseResume';
import type { Candidate } from '@/types/database';

type Props = {
  candidate: Candidate;
  onUpdated: () => void;
};

export default function CandidateCard({ candidate, onUpdated }: Props) {
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRetry = async () => {
    setRetrying(true);
    setError(null);

    await supabase
      .from('candidates')
      .update({ parse_status: 'processing' })
      .eq('id', candidate.id);

    onUpdated();

    const result = await parseResume(candidate.id);
    setRetrying(false);
    if (!result.success) {
      setError(result.error);
      onUpdated();
    } else {
      onUpdated();
    }
  };

  const status = candidate.parse_status;

  return (
    <div className="px-6 py-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600">
            {candidate.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-slate-900">{candidate.name}</p>
            {status === 'processing' && (
              <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-blue-600">
                <Loader2 size={13} className="animate-spin" /> Processing…
              </span>
            )}
            {status === 'completed' && (
              <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <CheckCircle2 size={13} /> Completed
              </span>
            )}
            {status === 'failed' && (
              <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-red-600">
                <AlertCircle size={13} /> Failed
              </span>
            )}
          </div>
        </div>

        {status === 'failed' && (
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {retrying ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            Retry
          </button>
        )}
      </div>

      {status === 'failed' && (error || !candidate.resume_text) && (
        <div className="mt-3 rounded-lg border border-red-100 bg-red-50 p-2.5 text-xs text-red-600">
          {error ?? 'Resume parsing failed. Click Retry to try again.'}
        </div>
      )}

      {status === 'completed' && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {candidate.email && (
            <InfoRow icon={Mail} label="Email" value={candidate.email} />
          )}
          {candidate.phone && (
            <InfoRow icon={Phone} label="Phone" value={candidate.phone} />
          )}
          {candidate.experience && (
            <InfoRow icon={Briefcase} label="Experience" value={`${candidate.experience} year${candidate.experience === '1' ? '' : 's'}`} />
          )}
          {candidate.education && (
            <InfoRow icon={GraduationCap} label="Education" value={candidate.education} />
          )}
          {candidate.skills && candidate.skills.length > 0 && (
            <div className="sm:col-span-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Sparkles size={13} /> Skills
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {candidate.skills.map((skill, i) => (
                  <span
                    key={`${skill}-${i}`}
                    className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
        <Icon size={13} /> {label}
      </div>
      <p className="mt-0.5 text-sm text-slate-700">{value}</p>
    </div>
  );
}
