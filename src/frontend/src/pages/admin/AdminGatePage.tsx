import { useAuth } from '@/hooks/useAuth';
import { AdminAccessDeniedScreen } from '@/components/auth/AdminAccessDeniedScreen';
import AdminPanelPage from './AdminPanelPage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { setReturnToPath } from '@/utils/urlParams';

export default function AdminGatePage() {
  const { isAuthenticated, isAuthResolved, isAdmin, isLoading, hasError, retry } = useAuth();
  const navigate = useNavigate();

  // Show loading state while auth is initializing or admin status is being checked
  if (!isAuthResolved || isLoading) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Verifying admin access...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Auth is resolved but user is not authenticated - redirect to login
  if (isAuthResolved && !isAuthenticated) {
    setReturnToPath('/admin');
    navigate({ to: '/login' });
    return null;
  }

  // Show error state if role/admin checks failed
  if (hasError) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="p-3 rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="text-center space-y-2">
              <p className="font-medium">Unable to Verify Admin Status</p>
              <p className="text-sm text-muted-foreground">
                An error occurred while checking your admin permissions. Please try again.
              </p>
            </div>
            <Button onClick={retry} variant="outline" className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show access denied screen if user is not admin
  if (!isAdmin) {
    return <AdminAccessDeniedScreen />;
  }

  // User is confirmed admin, show the admin panel
  return <AdminPanelPage />;
}
