import { useGetTask } from '@/hooks/useBackendQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, BookOpen, BookMarked, GraduationCap, Heart, Moon } from 'lucide-react';
import { dateToTimestamp } from '@/utils/date';

interface DailyOverviewTilesProps {
  selectedDate: Date;
}

export function DailyOverviewTiles({ selectedDate }: DailyOverviewTilesProps) {
  const timestamp = dateToTimestamp(selectedDate);
  const { data: task, isLoading } = useGetTask(timestamp);

  const fiveWajibComplete = task?.sholat?.fajr && task?.sholat?.dhuhr && task?.sholat?.asr && task?.sholat?.maghrib && task?.sholat?.isha;
  const wajibCount = [task?.sholat?.fajr, task?.sholat?.dhuhr, task?.sholat?.asr, task?.sholat?.maghrib, task?.sholat?.isha].filter(Boolean).length;
  const sunnahCount = [task?.sholat?.dhuha, task?.sholat?.tarawih, task?.sholat?.qiyamulLail].filter(Boolean).length;

  const tiles = [
    {
      title: 'Sholat',
      icon: Moon,
      completed: fiveWajibComplete ?? false,
      summary: `${wajibCount}/5 wajib${sunnahCount > 0 ? `, +${sunnahCount} sunnah` : ''}`,
    },
    {
      title: 'Puasa',
      icon: Circle,
      completed: task?.fasting?.isFasting ?? false,
      summary: task?.fasting?.isFasting ? 'Selesai' : 'Belum selesai',
    },
    {
      title: 'Tilawah',
      icon: BookOpen,
      completed: task?.tilawah !== undefined && task?.tilawah !== null,
      summary: task?.tilawah
        ? `${task.tilawah.surah} (${task.tilawah.verseStart}-${task.tilawah.verseEnd})`
        : 'Belum dicatat',
    },
    {
      title: 'Murojaah',
      icon: BookMarked,
      completed: task?.murojaah !== undefined && task?.murojaah !== null,
      summary: task?.murojaah
        ? `${task.murojaah.surah} (${task.murojaah.verseStart}-${task.murojaah.verseEnd})`
        : 'Belum dicatat',
    },
    {
      title: 'Tahfidz',
      icon: GraduationCap,
      completed: task?.tahfidz !== undefined && task?.tahfidz !== null,
      summary: task?.tahfidz
        ? `${task.tahfidz.surah} (${task.tahfidz.verseStart}-${task.tahfidz.verseEnd})`
        : 'Belum dicatat',
    },
    {
      title: 'Sedekah',
      icon: Heart,
      completed: task?.sedekah?.completed ?? false,
      summary: task?.sedekah?.completed ? 'Selesai' : 'Belum selesai',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-muted rounded w-24" />
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-muted rounded w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tiles.map((tile) => {
        const Icon = tile.icon;
        return (
          <Card key={tile.title} className={tile.completed ? 'border-primary/50' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {tile.title}
                </CardTitle>
                {tile.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{tile.summary}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
