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

interface TahfidzModuleProps {
  selectedDate: Date;
}

export function TahfidzModule({ selectedDate }: TahfidzModuleProps) {
  const timestamp = dateToTimestamp(selectedDate);
  const { data: task } = useGetTask(timestamp);
  const updateTask = useCreateOrUpdateTask();

  const [surah, setSurah] = useState('');
  const [verseStart, setVerseStart] = useState('');
  const [verseEnd, setVerseEnd] = useState('');

  useEffect(() => {
    setSurah(task?.tahfidz?.surah ?? '');
    setVerseStart(task?.tahfidz?.verseStart?.toString() ?? '');
    setVerseEnd(task?.tahfidz?.verseEnd?.toString() ?? '');
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
          ...task,
          tahfidz: {
            surah: surah.trim(),
            verseStart: BigInt(verseStart),
            verseEnd: BigInt(verseEnd),
          },
        },
      });
      toast.success('Tahfidz saved');
    } catch (error) {
      toast.error('Failed to save tahfidz');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tahfidz</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tahfidz-surah">Surah Name</Label>
          <Input
            id="tahfidz-surah"
            value={surah}
            onChange={(e) => setSurah(e.target.value)}
            placeholder="e.g., Al-Baqarah"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tahfidz-start">Verse From</Label>
            <Input
              id="tahfidz-start"
              type="number"
              value={verseStart}
              onChange={(e) => setVerseStart(e.target.value)}
              placeholder="1"
              min="1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tahfidz-end">Verse To</Label>
            <Input
              id="tahfidz-end"
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
            'Save Tahfidz'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
