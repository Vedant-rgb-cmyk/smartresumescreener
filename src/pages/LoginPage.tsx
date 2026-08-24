import { useState, type FormEvent } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Logo from '@/components/Logo';
import { useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { navigate } = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await signIn(email, password);
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
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-blue-600 p-12 lg:flex">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-blue-500/40 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-sky-400/30 blur-3xl" />
        <div className="relative">
          <Logo light size="lg" />
        </div>
        <div className="relative">
          <h2 className="text-4xl font-bold leading-tight text-white">
            Screen Smarter.
            <br />
            Hire Faster.
          </h2>
          <p className="mt-4 max-w-sm text-lg text-blue-100">
            Sign in to manage your jobs, upload resumes, and find the best candidates in
            seconds.
          </p>
        </div>
        <p className="relative text-sm text-blue-200">© 2026 Smart Resume Screener</p>
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

          <h1 className="mt-8 text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to your account to continue.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

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
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <button
              onClick={() => navigate({ name: 'signup' })}
              className="font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
