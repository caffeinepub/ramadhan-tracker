import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetTask } from '@/hooks/useBackendQueries';
import { dateToTimestamp, getPreviousDay } from '@/utils/date';
import { BookOpen, BookMarked, GraduationCap, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface YesterdayProgressSummaryProps {
  selectedDate: Date;
}

export function YesterdayProgressSummary({ selectedDate }: YesterdayProgressSummaryProps) {
  const yesterdayDate = getPreviousDay(selectedDate);
  const timestamp = dateToTimestamp(yesterdayDate);
  const { data: task, isLoading } = useGetTask(timestamp);

  const formatProgress = (data: { surah: string; verseStart: bigint; verseEnd: bigint } | undefined | null): string => {
    if (!data) return 'Belum dicatat';
    return `${data.surah} (${data.verseStart}-${data.verseEnd})`;
  };

  const items = [
    {
      title: 'Tilawah',
      icon: BookOpen,
      value: formatProgress(task?.tilawah),
    },
    {
      title: 'Tahfidz',
      icon: GraduationCap,
      value: formatProgress(task?.tahfidz),
    },
    {
      title: 'Murojaah',
      icon: BookMarked,
      value: formatProgress(task?.murojaah),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Progres Kemarin
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                  </div>
                  <p className="text-sm pl-6">{item.value}</p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
