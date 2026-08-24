import { useState, type ReactNode } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import Logo from '@/components/Logo';
import { useRouter, type Route } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';

type NavItem = {
  label: string;
  icon: typeof LayoutDashboard;
  route: Route;
  match: string[];
};

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, route: { name: 'dashboard' }, match: ['dashboard'] },
  { label: 'Jobs', icon: Briefcase, route: { name: 'jobs' }, match: ['jobs', 'job'] },
  { label: 'Candidates', icon: Users, route: { name: 'candidates' }, match: ['candidates'] },
  { label: 'Analytics', icon: BarChart3, route: { name: 'analytics' }, match: ['analytics'] },
  { label: 'Settings', icon: Settings, route: { name: 'settings' }, match: ['settings'] },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { route, navigate } = useRouter();
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate({ name: 'landing' });
  };

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <button onClick={() => navigate({ name: 'dashboard' })}>
          <Logo size="md" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const active = item.match.includes(route.name);
          return (
            <button
              key={item.label}
              onClick={() => {
                navigate(item.route);
                setMobileOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <item.icon size={18} className={active ? 'text-blue-600' : 'text-slate-400'} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            {profile?.full_name?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">
              {profile?.full_name ?? 'User'}
            </p>
            <p className="truncate text-xs text-slate-400">{profile?.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={18} className="text-slate-400" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white lg:hidden">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
            {SidebarContent}
          </aside>
        </>
      )}

      {/* Main */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button onClick={() => navigate({ name: 'dashboard' })}>
            <Logo size="sm" />
          </button>
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <Menu size={20} />
          </button>
        </header>

        <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
