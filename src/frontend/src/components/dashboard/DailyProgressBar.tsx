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

  const completedItems = [
    task?.fasting?.isFasting,
    task?.tilawah !== undefined && task?.tilawah !== null,
    task?.murojaah !== undefined && task?.murojaah !== null,
    task?.tahfidz !== undefined && task?.tahfidz !== null,
    task?.sedekah?.completed,
  ].filter(Boolean).length;

  const totalItems = 5;
  const progress = (completedItems / totalItems) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Daily Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Progress value={progress} className="h-3" />
        <p className="text-sm text-muted-foreground text-center">
          {completedItems} of {totalItems} activities completed
        </p>
      </CardContent>
    </Card>
  );
}
