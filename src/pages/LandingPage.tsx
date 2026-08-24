import { ArrowRight, CheckCircle2, Zap, Target, BarChart3 } from 'lucide-react';
import Logo from '@/components/Logo';
import { useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';

export default function LandingPage() {
  const { navigate } = useRouter();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <button
            onClick={() => navigate(user ? { name: 'dashboard' } : { name: 'login' })}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            {user ? 'Go to Dashboard' : 'Sign in'}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-slate-50" />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-sky-100/40 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
              <Zap size={14} /> AI-powered resume screening
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
              Screen Smarter. <span className="text-blue-600">Hire Faster.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
              Smart Resume Screener helps recruiters upload resumes, automatically match
              candidates to job requirements, and surface the best fits in seconds — all in
              one clean dashboard.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={() => navigate(user ? { name: 'dashboard' } : { name: 'signup' })}
                className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30"
              >
                Get Started
                <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => navigate({ name: 'login' })}
                className="rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                I already have an account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: Target,
              title: 'Job-specific matching',
              desc: 'Define required skills and experience for each role. Candidates are scored against exactly what you need.',
            },
            {
              icon: Zap,
              title: 'Instant screening',
              desc: 'Upload resumes and get match scores in seconds. Stop spending hours reading through unqualified applications.',
            },
            {
              icon: BarChart3,
              title: 'Clear analytics',
              desc: 'See average match scores, candidate pipelines, and job performance at a glance on your dashboard.',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <f.icon size={24} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold text-slate-900">How it works</h2>
          <div className="mt-12 space-y-6">
            {[
              'Create a job posting with the skills and experience you require.',
              'Upload candidate resumes against the job.',
              'Review match scores and shortlist the best candidates.',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {i + 1}
                </div>
                <p className="pt-1 text-lg text-slate-700">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-blue-600 px-8 py-16 text-center shadow-xl">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/40 blur-2xl" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white">Ready to screen smarter?</h2>
            <p className="mx-auto mt-3 max-w-xl text-blue-100">
              Create your free account and start matching candidates in minutes.
            </p>
            <button
              onClick={() => navigate({ name: 'signup' })}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-blue-600 shadow-lg transition hover:bg-blue-50"
            >
              Get Started Free
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
          <Logo size="sm" />
          <p className="text-sm text-slate-400">© 2026 Smart Resume Screener</p>
        </div>
      </footer>
    </div>
  );
}
