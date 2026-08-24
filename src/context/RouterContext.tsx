import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Route =
  | { name: 'landing' }
  | { name: 'login' }
  | { name: 'signup' }
  | { name: 'dashboard' }
  | { name: 'jobs' }
  | { name: 'job'; id: string }
  | { name: 'candidates' }
  | { name: 'analytics' }
  | { name: 'settings' };

type RouterContextValue = {
  route: Route;
  navigate: (route: Route) => void;
};

const RouterContext = createContext<RouterContextValue | undefined>(undefined);

function parseHash(): Route {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const [name, id] = hash.split('/');

  if (name === 'login') return { name: 'login' };
  if (name === 'signup') return { name: 'signup' };
  if ((name === 'job' || name === 'jobs') && id) return { name: 'job', id };
  if (name === 'jobs') return { name: 'jobs' };
  if (name === 'candidates') return { name: 'candidates' };
  if (name === 'analytics') return { name: 'analytics' };
  if (name === 'settings') return { name: 'settings' };
  if (name === 'dashboard') return { name: 'dashboard' };
  return { name: 'landing' };
}

function routeToHash(route: Route): string {
  switch (route.name) {
    case 'job':
      return `#/job/${route.id}`;
    default:
      return `#/${route.name}`;
  }
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(parseHash());

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (newRoute: Route) => {
    window.location.hash = routeToHash(newRoute);
    setRoute(newRoute);
    window.scrollTo(0, 0);
  };

  return (
    <RouterContext.Provider value={{ route, navigate }}>{children}</RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}

export type { Route };
