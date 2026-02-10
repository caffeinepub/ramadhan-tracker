import { RouterProvider, createRouter, createRoute, createRootRoute, redirect, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from './components/theme/ThemeProvider';
import { AppShell } from './components/layout/AppShell';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminPanelPage from './pages/admin/AdminPanelPage';
import { useAuth } from './hooks/useAuth';
import { Toaster } from '@/components/ui/sonner';

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

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPanelPage,
  beforeLoad: ({ context }: any) => {
    const auth = context?.auth;
    if (!auth?.isAuthenticated) {
      throw redirect({ to: '/login' });
    }
    if (!auth?.isAdmin) {
      throw redirect({ to: '/' });
    }
  },
});

const routeTree = rootRoute.addChildren([loginRoute, dashboardRoute, adminRoute]);

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
