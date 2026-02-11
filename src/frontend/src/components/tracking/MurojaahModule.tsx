import { useState, useEffect } from 'react';
import { useGetTask, useCreateOrUpdateTask } from '@/hooks/useBackendQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { dateToTimestamp } from '@/utils/date';
import { validateVerseRange } from '@/utils/validation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface MurojaahModuleProps {
  selectedDate: Date;
}

export function MurojaahModule({ selectedDate }: MurojaahModuleProps) {
  const timestamp = dateToTimestamp(selectedDate);
  const { data: task } = useGetTask(timestamp);
  const updateTask = useCreateOrUpdateTask();

  const [surah, setSurah] = useState('');
  const [verseStart, setVerseStart] = useState('');
  const [verseEnd, setVerseEnd] = useState('');

  useEffect(() => {
    setSurah(task?.murojaah?.surah ?? '');
    setVerseStart(task?.murojaah?.verseStart?.toString() ?? '');
    setVerseEnd(task?.murojaah?.verseEnd?.toString() ?? '');
  }, [task]);

  const handleSave = async () => {
    const validation = validateVerseRange(surah, verseStart, verseEnd);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    try {
      await updateTask.mutateAsync({
        date: timestamp,
        task: {
          fasting: task?.fasting,
          tilawah: task?.tilawah,
          murojaah: {
            surah: surah.trim(),
            verseStart: BigInt(verseStart),
            verseEnd: BigInt(verseEnd),
          },
          tahfidz: task?.tahfidz,
          sedekah: task?.sedekah,
          sholat: task?.sholat,
        },
      });
      toast.success('Murojaah saved');
    } catch (error) {
      toast.error('Failed to save Murojaah');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Murojaah</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="murojaah-surah">Nama Surah</Label>
          <Input
            id="murojaah-surah"
            value={surah}
            onChange={(e) => setSurah(e.target.value)}
            placeholder="contoh: Al-Baqarah"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="murojaah-start">Ayat Dari</Label>
            <Input
              id="murojaah-start"
              type="number"
              value={verseStart}
              onChange={(e) => setVerseStart(e.target.value)}
              placeholder="1"
              min="1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="murojaah-end">Ayat Sampai</Label>
            <Input
              id="murojaah-end"
              type="number"
              value={verseEnd}
              onChange={(e) => setVerseEnd(e.target.value)}
              placeholder="10"
              min="1"
            />
          </div>
        </div>
        <Button onClick={handleSave} disabled={updateTask.isPending}>
          {updateTask.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Simpan Murojaah'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
