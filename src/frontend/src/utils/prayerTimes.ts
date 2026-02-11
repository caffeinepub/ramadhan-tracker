// Prayer times calculation for Indonesia timezones (WIB, WITA, WIT)
// Using simplified calculation based on standard Indonesian prayer time methods

export type IndonesiaTimezone = 'WIB' | 'WITA' | 'WIT';

export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

// Approximate coordinates for major Indonesian cities (used as reference)
const TIMEZONE_COORDS: Record<IndonesiaTimezone, { lat: number; lng: number; offset: number }> = {
  WIB: { lat: -6.2088, lng: 106.8456, offset: 7 }, // Jakarta
  WITA: { lat: -8.6705, lng: 115.2126, offset: 8 }, // Bali
  WIT: { lat: -0.9493, lng: 131.2932, offset: 9 }, // Papua
};

// Calculate prayer times for a given date and timezone
export function calculatePrayerTimes(date: Date, timezone: IndonesiaTimezone): PrayerTimes {
  const { lat, lng, offset } = TIMEZONE_COORDS[timezone];
  
  // Get Julian date
  const jd = getJulianDate(date);
  
  // Calculate equation of time and solar declination
  const { eqt, declination } = getSolarPosition(jd);
  
  // Calculate solar noon in UTC
  const solarNoonUTC = 12 - lng / 15 - eqt / 60;
  
  // Fajr: 20 degrees below horizon (Kemenag Indonesia standard)
  const fajrOffset = getTimeDifference(lat, declination, 20) / 60;
  const fajrUTC = solarNoonUTC - fajrOffset;
  
  // Sunrise: 0.833 degrees below horizon (standard)
  const sunriseOffset = getTimeDifference(lat, declination, 0.833) / 60;
  const sunriseUTC = solarNoonUTC - sunriseOffset;
  
  // Dhuhr: solar noon + 2 minutes (standard practice)
  const dhuhrUTC = solarNoonUTC + 2 / 60;
  
  // Asr: using Shafi'i method (shadow = object length + shadow at noon)
  const asrAngle = getAsrAngle(lat, declination);
  const asrOffset = getTimeDifference(lat, declination, asrAngle) / 60;
  const asrUTC = solarNoonUTC + asrOffset;
  
  // Maghrib: same as sunset
  const maghribOffset = getTimeDifference(lat, declination, 0.833) / 60;
  const maghribUTC = solarNoonUTC + maghribOffset;
  
  // Isha: 18 degrees below horizon (Kemenag Indonesia standard)
  const ishaOffset = getTimeDifference(lat, declination, 18) / 60;
  const ishaUTC = solarNoonUTC + ishaOffset;
  
  return {
    fajr: formatTime(fajrUTC, offset),
    sunrise: formatTime(sunriseUTC, offset),
    dhuhr: formatTime(dhuhrUTC, offset),
    asr: formatTime(asrUTC, offset),
    maghrib: formatTime(maghribUTC, offset),
    isha: formatTime(ishaUTC, offset),
  };
}

function getJulianDate(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function getSolarPosition(jd: number): { eqt: number; declination: number } {
  const d = jd - 2451545.0;
  const g = (357.529 + 0.98560028 * d) * Math.PI / 180;
  const q = 280.459 + 0.98564736 * d;
  const L = (q + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * Math.PI / 180;
  
  const e = (23.439 - 0.00000036 * d) * Math.PI / 180;
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L));
  
  const eqt = (q / 15 - ra * 180 / Math.PI / 15) * 4;
  const declination = Math.asin(Math.sin(e) * Math.sin(L)) * 180 / Math.PI;
  
  return { eqt, declination };
}

function getTimeDifference(lat: number, declination: number, angle: number): number {
  const latRad = lat * Math.PI / 180;
  const decRad = declination * Math.PI / 180;
  const angleRad = angle * Math.PI / 180;
  
  const cosH = (Math.sin(-angleRad) - Math.sin(latRad) * Math.sin(decRad)) / (Math.cos(latRad) * Math.cos(decRad));
  
  // Clamp cosH to valid range [-1, 1]
  const clampedCosH = Math.max(-1, Math.min(1, cosH));
  
  const hourAngle = Math.acos(clampedCosH) * 180 / Math.PI;
  return hourAngle / 15 * 60; // Convert to minutes
}

function getAsrAngle(lat: number, declination: number): number {
  const latRad = lat * Math.PI / 180;
  const decRad = declination * Math.PI / 180;
  
  const shadowRatio = 1 + Math.tan(Math.abs(latRad - decRad));
  const angle = Math.atan(1 / shadowRatio) * 180 / Math.PI;
  
  return 90 - angle;
}

function formatTime(timeUTC: number, offset: number): string {
  // Add timezone offset
  let totalHours = timeUTC + offset;
  
  // Normalize to 0-24 range
  while (totalHours < 0) {
    totalHours += 24;
  }
  while (totalHours >= 24) {
    totalHours -= 24;
  }
  
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);
  
  // Handle minute overflow
  let finalHours = hours;
  let finalMinutes = minutes;
  
  if (finalMinutes >= 60) {
    finalHours += 1;
    finalMinutes -= 60;
  }
  
  // Normalize hours again after minute adjustment
  if (finalHours >= 24) {
    finalHours -= 24;
  }
  
  return `${finalHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
}

// Get timezone offset in hours
export function getTimezoneOffset(timezone: IndonesiaTimezone): number {
  return TIMEZONE_COORDS[timezone].offset;
}

// Get timezone label
export function getTimezoneLabel(timezone: IndonesiaTimezone): string {
  const labels: Record<IndonesiaTimezone, string> = {
    WIB: 'WIB (GMT+7)',
    WITA: 'WITA (GMT+8)',
    WIT: 'WIT (GMT+9)',
  };
  return labels[timezone];
}
