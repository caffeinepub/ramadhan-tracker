import { RouterProvider, createRouter, createRoute, createRootRoute, redirect, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from './components/theme/ThemeProvider';
import { AppShell } from './components/layout/AppShell';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminGatePage from './pages/admin/AdminGatePage';
import MonthlyProgressPage from './pages/MonthlyProgressPage';
import { useAuth } from './hooks/useAuth';
import { Toaster } from '@/components/ui/sonner';
import { setReturnToPath } from './utils/urlParams';

function RootComponent() {
  return (
    <ThemeProvider>
      <AppShell />
      <Toaster />
    </ThemeProvider>
  );
}

const rootRoute = createRootRoute({
  component: RootComponent,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
  beforeLoad: ({ context }: any) => {
    const auth = context?.auth;
    if (auth?.isAuthenticated) {
      throw redirect({ to: '/' });
    }
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
  beforeLoad: ({ context }: any) => {
    const auth = context?.auth;
    if (!auth?.isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
});

const monthlyProgressRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/progres-bulanan',
  component: MonthlyProgressPage,
  beforeLoad: ({ context }: any) => {
    const auth = context?.auth;
    if (!auth?.isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminGatePage,
  beforeLoad: ({ context }: any) => {
    const auth = context?.auth;
    
    // Wait for auth to be resolved before making decisions
    if (!auth?.isAuthResolved) {
      // Auth is still initializing, let AdminGatePage handle the loading state
      return;
    }
    
    // Auth is resolved and user is not authenticated
    if (!auth?.isAuthenticated) {
      // Store return intent before redirecting
      setReturnToPath('/admin');
      throw redirect({ to: '/login' });
    }
    
    // User is authenticated - let AdminGatePage handle admin check
  },
});

const routeTree = rootRoute.addChildren([loginRoute, dashboardRoute, monthlyProgressRoute, adminRoute]);

const router = createRouter({
  routeTree,
  context: { auth: undefined as any },
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  const auth = useAuth();

  return <RouterProvider router={router} context={{ auth }} />;
}

export default App;
