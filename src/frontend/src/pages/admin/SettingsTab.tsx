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
      toast.error('Link pembayaran tidak boleh kosong');
      return;
    }

    try {
      await setPaymentLink.mutateAsync(paymentLink.trim());
      toast.success('Pengaturan berhasil disimpan');
    } catch (error) {
      toast.error('Gagal menyimpan pengaturan');
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
        <CardTitle>Pengaturan Aplikasi</CardTitle>
        <CardDescription>Konfigurasi pengaturan aplikasi global</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="payment-link">Link Pembayaran Sedekah</Label>
          <Input
            id="payment-link"
            type="url"
            value={paymentLink}
            onChange={(e) => setPaymentLinkState(e.target.value)}
            placeholder="https://tribelio.page/site/donation/9U7UPN3Y"
          />
          <p className="text-xs text-muted-foreground">
            Link ini akan dibuka ketika pengguna mengklik tombol "Donasi Sekarang"
          </p>
        </div>

        <Button onClick={handleSave} disabled={setPaymentLink.isPending}>
          {setPaymentLink.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Simpan Pengaturan
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
