import { useState, useEffect } from 'react';
import { useGetTask, useCreateOrUpdateTask } from '@/hooks/useBackendQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { dateToTimestamp } from '@/utils/date';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FastingModuleProps {
  selectedDate: Date;
}

export function FastingModule({ selectedDate }: FastingModuleProps) {
  const timestamp = dateToTimestamp(selectedDate);
  const { data: task } = useGetTask(timestamp);
  const updateTask = useCreateOrUpdateTask();

  const [isFasting, setIsFasting] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    setIsFasting(task?.fasting?.isFasting ?? false);
    setNote(task?.fasting?.note ?? '');
  }, [task]);

  const handleToggleFasting = async (checked: boolean) => {
    setIsFasting(checked);
    try {
      await updateTask.mutateAsync({
        date: timestamp,
        task: {
          fasting: { isFasting: checked, note: note || undefined },
          tilawah: task?.tilawah,
          murojaah: task?.murojaah,
          tahfidz: task?.tahfidz,
          sedekah: task?.sedekah,
          sholat: task?.sholat,
        },
      });
      toast.success('Fasting status updated');
    } catch (error) {
      toast.error('Failed to update fasting status');
      setIsFasting(!checked);
    }
  };

  const handleSaveNote = async () => {
    try {
      await updateTask.mutateAsync({
        date: timestamp,
        task: {
          fasting: { isFasting, note: note.trim() || undefined },
          tilawah: task?.tilawah,
          murojaah: task?.murojaah,
          tahfidz: task?.tahfidz,
          sedekah: task?.sedekah,
          sholat: task?.sholat,
        },
      });
      toast.success('Note saved');
    } catch (error) {
      toast.error('Failed to save note');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Puasa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="fasting-toggle">Puasa hari ini?</Label>
          <Switch
            id="fasting-toggle"
            checked={isFasting}
            onCheckedChange={handleToggleFasting}
            disabled={updateTask.isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fasting-note">Catatan Opsional</Label>
          <Textarea
            id="fasting-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Tambahkan catatan tentang puasa Anda..."
            rows={3}
          />
          <Button onClick={handleSaveNote} disabled={updateTask.isPending} size="sm">
            {updateTask.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Simpan Catatan'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
