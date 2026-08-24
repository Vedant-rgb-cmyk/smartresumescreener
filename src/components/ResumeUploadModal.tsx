import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { AlertCircle, CheckCircle2, FileText, Loader2, Sparkles, UploadCloud, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { parseResume } from '@/lib/parseResume';

type UploadStatus = 'queued' | 'processing' | 'parsing' | 'success' | 'error';

type ResumeFile = {
  id: string;
  file: File;
  status: UploadStatus;
  message?: string;
};

type Props = {
  open: boolean;
  jobId: string;
  userId: string;
  onClose: () => void;
  onUploaded: () => void;
};

const acceptedTypes = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const maxFileSize = 10 * 1024 * 1024;

function getCandidateName(fileName: string) {
  return fileName.replace(/\.(pdf|docx)$/i, '').replace(/[_-]+/g, ' ').trim() || 'Unnamed candidate';
}

function getFileType(file: File) {
  return file.type === 'application/pdf' ? 'PDF' : 'DOCX';
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export default function ResumeUploadModal({ open, jobId, userId, onClose, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<ResumeFile[]>([]);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (open) setFiles([]);
  }, [open]);

  if (!open) return null;

  const addFiles = (selectedFiles: File[]) => {
    const newFiles: ResumeFile[] = selectedFiles.map((file) => {
      const invalidType = !acceptedTypes.has(file.type);
      const invalidSize = file.size > maxFileSize;
      const message = invalidType
        ? 'Only PDF and DOCX files are supported.'
        : invalidSize
          ? 'Files must be 10 MB or smaller.'
          : undefined;
      return {
        id: crypto.randomUUID(),
        file,
        status: message ? 'error' : 'queued',
        message,
      };
    });
    setFiles((current) => [...current, ...newFiles]);
    newFiles.filter((item) => item.status === 'queued').forEach((item) => uploadFile(item));
  };

  const uploadFile = async (item: ResumeFile) => {
    setFiles((current) =>
      current.map((entry) => (entry.id === item.id ? { ...entry, status: 'processing' } : entry)),
    );

    const path = `${userId}/${jobId}/${crypto.randomUUID()}-${sanitizeFileName(item.file.name)}`;
    const { error: storageError } = await supabase.storage.from('resumes').upload(path, item.file, {
      contentType: item.file.type,
      upsert: false,
    });

    if (storageError) {
      setFiles((current) =>
        current.map((entry) =>
          entry.id === item.id
            ? { ...entry, status: 'error', message: 'Could not upload this resume.' }
            : entry,
        ),
      );
      return;
    }

    const { data: candidateData, error: candidateError } = await supabase.from('candidates').insert({
      job_id: jobId,
      name: getCandidateName(item.file.name),
      email: null,
      phone: null,
      skills: [],
      experience: null,
      education: null,
      resume_text: null,
      resume_file_path: path,
      parse_status: 'processing',
    }).select('id').single();

    if (candidateError || !candidateData) {
      await supabase.storage.from('resumes').remove([path]);
      setFiles((current) =>
        current.map((entry) =>
          entry.id === item.id
            ? { ...entry, status: 'error', message: 'Resume uploaded, but candidate could not be saved.' }
            : entry,
        ),
      );
      return;
    }

    setFiles((current) =>
      current.map((entry) => (entry.id === item.id ? { ...entry, status: 'parsing' } : entry)),
    );

    const result = await parseResume(candidateData.id);
    if (!result.success) {
      setFiles((current) =>
        current.map((entry) =>
          entry.id === item.id
            ? { ...entry, status: 'success', message: `Uploaded — AI parsing will retry from the job page.` }
            : entry,
        ),
      );
    } else {
      setFiles((current) =>
        current.map((entry) => (entry.id === item.id ? { ...entry, status: 'success' } : entry)),
      );
    }
    onUploaded();
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.target.files ?? []));
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    addFiles(Array.from(event.dataTransfer.files));
  };

  const hasProcessing = files.some((item) => item.status === 'processing' || item.status === 'queued' || item.status === 'parsing');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Upload Resumes</h2>
            <p className="mt-0.5 text-xs text-slate-400">PDF or DOCX, up to 10 MB each</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100"
            aria-label="Close upload dialog"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div
            onDragEnter={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
              dragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <UploadCloud size={24} />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-800">Drop resumes here</p>
            <p className="mt-1 text-xs text-slate-500">or click to browse multiple files</p>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
              multiple
              onChange={handleInput}
              className="hidden"
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Upload status
              </p>
              {files.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{item.file.name}</p>
                    <p className="text-xs text-slate-400">{getFileType(item.file)} · {(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    {item.message && <p className="mt-0.5 text-xs text-red-600">{item.message}</p>}
                  </div>
                  <div className="flex-shrink-0">
                    {item.status === 'queued' && <span className="text-xs text-slate-400">Queued</span>}
                    {item.status === 'processing' && <Loader2 size={17} className="animate-spin text-blue-600" />}
                    {item.status === 'parsing' && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600">
                        <Sparkles size={13} /> AI
                      </span>
                    )}
                    {item.status === 'success' && <CheckCircle2 size={18} className="text-emerald-600" />}
                    {item.status === 'error' && <AlertCircle size={18} className="text-red-600" />}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-400">
              {hasProcessing ? 'Processing resumes…' : 'Resumes are parsed with AI after upload.'}
            </p>
            <button
              onClick={onClose}
              disabled={hasProcessing}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {hasProcessing ? 'Processing…' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
