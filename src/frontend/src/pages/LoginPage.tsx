import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

export default function LoginPage() {
  const { login, loginStatus, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, navigate]);

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold text-primary">Pelacak Ramadhan</CardTitle>
          <CardDescription className="text-base">
            Lacak perjalanan spiritual Anda selama bulan yang penuh berkah
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>Selamat datang! Silakan masuk untuk mengakses dasbor Anda.</p>
            <p className="text-xs">
              Catatan: Akun dikelola oleh administrator. Hubungi admin Anda jika Anda memerlukan akses.
            </p>
          </div>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full"
            size="lg"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Masuk...
              </>
            ) : (
              'Masuk'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
