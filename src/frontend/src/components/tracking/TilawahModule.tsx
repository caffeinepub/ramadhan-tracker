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

interface TilawahModuleProps {
  selectedDate: Date;
}

export function TilawahModule({ selectedDate }: TilawahModuleProps) {
  const timestamp = dateToTimestamp(selectedDate);
  const { data: task } = useGetTask(timestamp);
  const updateTask = useCreateOrUpdateTask();

  const [surah, setSurah] = useState('');
  const [verseStart, setVerseStart] = useState('');
  const [verseEnd, setVerseEnd] = useState('');

  useEffect(() => {
    setSurah(task?.tilawah?.surah ?? '');
    setVerseStart(task?.tilawah?.verseStart?.toString() ?? '');
    setVerseEnd(task?.tilawah?.verseEnd?.toString() ?? '');
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
          tilawah: {
            surah: surah.trim(),
            verseStart: BigInt(verseStart),
            verseEnd: BigInt(verseEnd),
          },
          murojaah: task?.murojaah,
          tahfidz: task?.tahfidz,
          sedekah: task?.sedekah,
          sholat: task?.sholat,
        },
      });
      toast.success('Tilawah saved');
    } catch (error) {
      toast.error('Failed to save Tilawah');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tilawah</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tilawah-surah">Nama Surah</Label>
          <Input
            id="tilawah-surah"
            value={surah}
            onChange={(e) => setSurah(e.target.value)}
            placeholder="contoh: Al-Baqarah"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tilawah-start">Ayat Dari</Label>
            <Input
              id="tilawah-start"
              type="number"
              value={verseStart}
              onChange={(e) => setVerseStart(e.target.value)}
              placeholder="1"
              min="1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tilawah-end">Ayat Sampai</Label>
            <Input
              id="tilawah-end"
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
            'Simpan Tilawah'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
