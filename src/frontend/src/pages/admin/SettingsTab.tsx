import { useState, useEffect } from 'react';
import { useGetSedekahPaymentLink, useSetSedekahPaymentLink } from '@/hooks/useBackendQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function SettingsTab() {
  const { data: currentPaymentLink, isLoading } = useGetSedekahPaymentLink();
  const setPaymentLink = useSetSedekahPaymentLink();
  const [paymentLink, setPaymentLinkState] = useState('');

  // Initialize form state from loaded payment link
  useEffect(() => {
    if (currentPaymentLink) {
      setPaymentLinkState(currentPaymentLink);
    }
  }, [currentPaymentLink]);

  const handleSave = async () => {
    if (!paymentLink.trim()) {
      toast.error('Payment link cannot be empty');
      return;
    }

    try {
      await setPaymentLink.mutateAsync(paymentLink.trim());
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Settings</CardTitle>
        <CardDescription>Configure global application settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="payment-link">Sedekah Payment Link</Label>
          <Input
            id="payment-link"
            type="url"
            value={paymentLink}
            onChange={(e) => setPaymentLinkState(e.target.value)}
            placeholder="https://tribelio.page/site/donation/9U7UPN3Y"
          />
          <p className="text-xs text-muted-foreground">
            This link will be opened when users click the "Donate Now" button
          </p>
        </div>

        <Button onClick={handleSave} disabled={setPaymentLink.isPending}>
          {setPaymentLink.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
