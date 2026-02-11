import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { getTimezoneLabel, type IndonesiaTimezone } from '@/utils/prayerTimes';
import { Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PrayerTimesSectionProps {
  selectedDate: Date;
}

export function PrayerTimesSection({ selectedDate }: PrayerTimesSectionProps) {
  const { prayerTimes, timezone, setTimezone, isLoading, error, retry } = usePrayerTimes(selectedDate);

  const timezones: IndonesiaTimezone[] = ['WIB', 'WITA', 'WIT'];

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Waktu Sholat
            </CardTitle>
            <Select value={timezone} onValueChange={(value) => setTimezone(value as IndonesiaTimezone)}>
              <SelectTrigger className="w-[130px] h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {getTimezoneLabel(tz)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Unable to Load Prayer Times</p>
              <p className="text-sm text-muted-foreground mt-1">
                Could not calculate prayer times for the selected date
              </p>
            </div>
            <Button onClick={retry} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Waktu Sholat
          </CardTitle>
          <Select value={timezone} onValueChange={(value) => setTimezone(value as IndonesiaTimezone)}>
            <SelectTrigger className="w-[130px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {getTimezoneLabel(tz)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-7 w-20" />
              </div>
            ))}
          </div>
        ) : prayerTimes ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Subuh</p>
              <p className="text-xl font-semibold tabular-nums">{prayerTimes.fajr}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Terbit</p>
              <p className="text-xl font-semibold tabular-nums">{prayerTimes.sunrise}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Dzuhur</p>
              <p className="text-xl font-semibold tabular-nums">{prayerTimes.dhuhr}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Ashar</p>
              <p className="text-xl font-semibold tabular-nums">{prayerTimes.asr}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Maghrib</p>
              <p className="text-xl font-semibold tabular-nums">{prayerTimes.maghrib}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Isya</p>
              <p className="text-xl font-semibold tabular-nums">{prayerTimes.isha}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            Tidak ada data waktu sholat
          </div>
        )}
      </CardContent>
    </Card>
  );
}
