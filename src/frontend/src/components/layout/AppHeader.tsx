import { useAuth } from '@/hooks/useAuth';
import { useGetCallerUserProfile } from '@/hooks/useBackendQueries';
import { Button } from '@/components/ui/button';
import { Moon, Sun, LogOut, User, Shield, TrendingUp } from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';
import { useNavigate } from '@tanstack/react-router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function AppHeader() {
  const { isAuthenticated, logout, isAdmin } = useAuth();
  const { data: userProfile } = useGetCallerUserProfile();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-primary">Pelacak Ramadhan</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{userProfile?.name || 'Pengguna'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate({ to: '/' })}>
                Dasbor
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: '/progres-bulanan' })}>
                <TrendingUp className="mr-2 h-4 w-4" />
                Progres Bulanan
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate({ to: '/admin' })}>
                    <Shield className="mr-2 h-4 w-4" />
                    Panel Admin
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
