import { useState, type FormEvent } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Logo from '@/components/Logo';
import { useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const { navigate } = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    const { error } = await signUp(name, email, password);
    setSubmitting(false);
    if (error) {
      setError(error);
    } else {
      navigate({ name: 'dashboard' });
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-900 p-12 lg:flex">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-blue-600/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative">
          <Logo light size="lg" />
        </div>
        <div className="relative">
          <h2 className="text-4xl font-bold leading-tight text-white">
            Start hiring smarter
            <br />
            today.
          </h2>
          <p className="mt-4 max-w-sm text-lg text-slate-300">
            Create an account to post jobs, upload resumes, and let Smart Screener match
            candidates to your requirements automatically.
          </p>
        </div>
        <p className="relative text-sm text-slate-400">© 2026 Smart Resume Screener</p>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <button
            onClick={() => navigate({ name: 'landing' })}
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft size={16} /> Back to home
          </button>

          <div className="lg:hidden">
            <Logo size="md" />
          </div>

          <h1 className="mt-8 text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-2 text-sm text-slate-500">Get started in less than a minute.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Recruiter"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <button
              onClick={() => navigate({ name: 'login' })}
              className="font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
