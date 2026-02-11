import { useGetTask } from '@/hooks/useBackendQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { dateToTimestamp } from '@/utils/date';

interface DailyProgressBarProps {
  selectedDate: Date;
}

export function DailyProgressBar({ selectedDate }: DailyProgressBarProps) {
  const timestamp = dateToTimestamp(selectedDate);
  const { data: task } = useGetTask(timestamp);

  // Count 5 wajib prayers as one item
  const fiveWajibComplete = task?.sholat?.fajr && task?.sholat?.dhuhr && task?.sholat?.asr && task?.sholat?.maghrib && task?.sholat?.isha;

  const completedItems = [
    fiveWajibComplete,
    task?.fasting?.isFasting,
    task?.tilawah !== undefined && task?.tilawah !== null,
    task?.murojaah !== undefined && task?.murojaah !== null,
    task?.tahfidz !== undefined && task?.tahfidz !== null,
    task?.sedekah?.completed,
  ].filter(Boolean).length;

  const totalItems = 6;
  const progress = (completedItems / totalItems) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Progres Harian</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Progress value={progress} className="h-3" />
        <p className="text-sm text-muted-foreground text-center">
          {completedItems} dari {totalItems} aktivitas selesai
        </p>
      </CardContent>
    </Card>
  );
}
