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

  // Validate time format before rendering
  const isValidTime = (time: string): boolean => {
    const match = time.match(/^(\d{2}):(\d{2})$/);
    if (!match) return false;
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
  };

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Waktu Sholat
            </CardTitle>
            <Select value={timezone} onValueChange={(value) => setTimezone(value as IndonesiaTimezone)}>
              <SelectTrigger className="w-[140px]">
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
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Gagal memuat waktu sholat</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tidak dapat menghitung waktu sholat untuk tanggal yang dipilih
              </p>
            </div>
            <Button onClick={retry} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Coba Lagi
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Waktu Sholat
          </CardTitle>
          <Select value={timezone} onValueChange={(value) => setTimezone(value as IndonesiaTimezone)}>
            <SelectTrigger className="w-[140px]">
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
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        ) : prayerTimes ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Subuh</p>
              <p className="text-lg font-semibold">
                {isValidTime(prayerTimes.fajr) ? prayerTimes.fajr : '--:--'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Terbit</p>
              <p className="text-lg font-semibold">
                {isValidTime(prayerTimes.sunrise) ? prayerTimes.sunrise : '--:--'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dzuhur</p>
              <p className="text-lg font-semibold">
                {isValidTime(prayerTimes.dhuhr) ? prayerTimes.dhuhr : '--:--'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ashar</p>
              <p className="text-lg font-semibold">
                {isValidTime(prayerTimes.asr) ? prayerTimes.asr : '--:--'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Maghrib</p>
              <p className="text-lg font-semibold">
                {isValidTime(prayerTimes.maghrib) ? prayerTimes.maghrib : '--:--'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Isya</p>
              <p className="text-lg font-semibold">
                {isValidTime(prayerTimes.isha) ? prayerTimes.isha : '--:--'}
              </p>
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
