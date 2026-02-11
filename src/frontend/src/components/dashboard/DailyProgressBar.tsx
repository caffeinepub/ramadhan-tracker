import { useGetTask } from '@/hooks/useBackendQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { dateToTimestamp } from '@/utils/date';
import { calculateTaskCompletion } from '@/utils/progress';

interface DailyProgressBarProps {
  selectedDate: Date;
}

export function DailyProgressBar({ selectedDate }: DailyProgressBarProps) {
  const timestamp = dateToTimestamp(selectedDate);
  const { data: task, isLoading } = useGetTask(timestamp);

  const percentage = calculateTaskCompletion(task ?? null);

  // Count completed items for display
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progres Harian</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-5 w-32" />
        </CardContent>
      </Card>
    );
  }

  if (!task) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progres Harian</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Belum ada data untuk tanggal ini
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progres Harian</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={percentage} className="h-3" />
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {completedItems} dari {totalItems} aktivitas selesai
          </span>
          <span className="font-semibold">{percentage}%</span>
        </div>
      </CardContent>
    </Card>
  );
}
