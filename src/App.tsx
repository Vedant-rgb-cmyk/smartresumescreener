import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { RouterProvider, useRouter } from '@/context/RouterContext';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import DashboardPage from '@/pages/DashboardPage';
import JobsPage from '@/pages/JobsPage';
import JobDetailPage from '@/pages/JobDetailPage';
import CandidatesPage from '@/pages/CandidatesPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import SettingsPage from '@/pages/SettingsPage';

function AppRoutes() {
  const { route, navigate } = useRouter();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 size={28} className="animate-spin text-blue-500" />
      </div>
    );
  }

  // Public routes
  if (route.name === 'landing') return <LandingPage />;
  if (route.name === 'login') {
    if (user) {
      navigate({ name: 'dashboard' });
      return null;
    }
    return <LoginPage />;
  }
  if (route.name === 'signup') {
    if (user) {
      navigate({ name: 'dashboard' });
      return null;
    }
    return <SignupPage />;
  }

  // Protected routes — redirect to login if not signed in
  if (!user) {
    navigate({ name: 'login' });
    return null;
  }

  switch (route.name) {
    case 'dashboard':
      return <DashboardPage />;
    case 'jobs':
      return <JobsPage />;
    case 'job':
      return <JobDetailPage jobId={route.id} />;
    case 'candidates':
      return <CandidatesPage />;
    case 'analytics':
      return <AnalyticsPage />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <DashboardPage />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <AppRoutes />
      </RouterProvider>
    </AuthProvider>
  );
}
