import { useGetTask, useCreateOrUpdateTask, useGetSedekahPaymentLink } from '@/hooks/useBackendQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { dateToTimestamp } from '@/utils/date';
import { Heart, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface SedekahModuleProps {
  selectedDate: Date;
}

export function SedekahModule({ selectedDate }: SedekahModuleProps) {
  const timestamp = dateToTimestamp(selectedDate);
  const { data: task } = useGetTask(timestamp);
  const { data: paymentLink } = useGetSedekahPaymentLink();
  const updateTask = useCreateOrUpdateTask();

  const isCompleted = task?.sedekah?.completed ?? false;

  const handleDonate = async () => {
    if (!paymentLink) {
      toast.error('Payment link not configured');
      return;
    }

    try {
      await updateTask.mutateAsync({
        date: timestamp,
        task: {
          fasting: task?.fasting,
          tilawah: task?.tilawah,
          murojaah: task?.murojaah,
          tahfidz: task?.tahfidz,
          sedekah: { completed: true, paymentLink },
          sholat: task?.sholat,
        },
      });
      toast.success('Sedekah tercatat! Membuka link pembayaran...');
      window.open(paymentLink, '_blank', 'noopener,noreferrer');
    } catch (error) {
      toast.error('Failed to record Sedekah');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Sedekah Subuh
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isCompleted ? (
          <Alert>
            <AlertDescription className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary fill-primary" />
              Sedekah selesai untuk hari ini. Semoga Allah menerima amal Anda.
            </AlertDescription>
          </Alert>
        ) : (
          <Button onClick={handleDonate} disabled={updateTask.isPending || !paymentLink} className="w-full" size="lg">
            {updateTask.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <Heart className="mr-2 h-4 w-4" />
                Donasi Sekarang
                <ExternalLink className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
