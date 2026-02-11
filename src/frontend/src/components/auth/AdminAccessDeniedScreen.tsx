import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Copy, Home, ShieldCheck } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useIsAdminBootstrapAvailable, usePromoteToAdmin } from '@/hooks/useBackendQueries';

export function AdminAccessDeniedScreen() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const principal = identity?.getPrincipal().toString() || '';

  const { data: isBootstrapAvailable, isLoading: bootstrapLoading } = useIsAdminBootstrapAvailable();
  const promoteToAdminMutation = usePromoteToAdmin();

  const handleCopyPrincipal = () => {
    navigator.clipboard.writeText(principal);
    toast.success('Principal copied to clipboard');
  };

  const handleBootstrapAdmin = async () => {
    if (!identity) return;

    try {
      await promoteToAdminMutation.mutateAsync(identity.getPrincipal());
      toast.success('Admin access granted successfully!');
    } catch (error: any) {
      console.error('Bootstrap admin error:', error);
      toast.error(error.message || 'Failed to grant admin access');
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <CardTitle>Admin Access Required</CardTitle>
              <CardDescription>You do not have permission to access the Admin Panel</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isBootstrapAvailable && !bootstrapLoading && (
            <div className="p-4 bg-primary/10 rounded-md border border-primary/20 space-y-3">
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Bootstrap Mode Available</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    No admin exists yet. You can grant yourself admin access to set up the system.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleBootstrapAdmin}
                disabled={promoteToAdminMutation.isPending}
                className="w-full"
                size="sm"
              >
                {promoteToAdminMutation.isPending ? 'Granting Access...' : 'Bootstrap Admin Access'}
              </Button>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Only users with Admin role can access this area. If you believe you should have access, please share your
            Principal ID with an existing Admin to request role assignment.
          </p>

          <div className="space-y-2">
            <label className="text-sm font-medium">Your Principal ID:</label>
            <div className="flex gap-2">
              <div className="flex-1 p-3 bg-muted rounded-md font-mono text-xs break-all">{principal}</div>
              <Button variant="outline" size="icon" onClick={handleCopyPrincipal} title="Copy Principal ID">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-md border">
            <p className="text-sm">
              <strong>Note:</strong> An Admin can grant you access by using your Principal ID in the user management
              section of the Admin Panel.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => navigate({ to: '/' })} className="w-full" variant="outline">
            <Home className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
