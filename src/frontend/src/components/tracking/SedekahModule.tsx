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
          ...task,
          sedekah: { completed: true, paymentLink },
        },
      });
      toast.success('Sedekah recorded! Opening payment link...');
      window.open(paymentLink, '_blank', 'noopener,noreferrer');
    } catch (error) {
      toast.error('Failed to record sedekah');
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
              Sedekah completed for this day. May Allah accept your charity.
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
                Donate Now
                <ExternalLink className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
