import { useState, useEffect } from 'react';
import { calculatePrayerTimes, type IndonesiaTimezone, type PrayerTimes } from '@/utils/prayerTimes';

const TIMEZONE_STORAGE_KEY = 'selected_prayer_timezone';

export function usePrayerTimes(selectedDate: Date) {
  const [timezone, setTimezoneState] = useState<IndonesiaTimezone>(() => {
    const stored = localStorage.getItem(TIMEZONE_STORAGE_KEY);
    if (stored === 'WIB' || stored === 'WITA' || stored === 'WIT') {
      return stored;
    }
    return 'WIB';
  });

  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const setTimezone = (tz: IndonesiaTimezone) => {
    setTimezoneState(tz);
    localStorage.setItem(TIMEZONE_STORAGE_KEY, tz);
  };

  const retry = () => {
    setError(null);
    setIsLoading(true);
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    try {
      setIsLoading(true);
      setError(null);
      const times = calculatePrayerTimes(selectedDate, timezone);
      setPrayerTimes(times);
    } catch (err) {
      console.error('Prayer times calculation error:', err);
      setError('Failed to calculate prayer times');
      setPrayerTimes(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, timezone, refreshKey]);

  // Auto-refresh at date rollover
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timer = setTimeout(() => {
      setRefreshKey((prev) => prev + 1);
    }, msUntilMidnight);

    return () => clearTimeout(timer);
  }, []);

  return {
    prayerTimes,
    timezone,
    setTimezone,
    isLoading,
    error,
    retry,
  };
}
