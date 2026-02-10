import { Outlet } from '@tanstack/react-router';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';

export function AppShell() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
