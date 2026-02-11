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
  
  // Extract the local date components for the selected date
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  // Create a date at midnight UTC for the selected date
  const midnightUTC = new Date(Date.UTC(year, month, day, 0, 0, 0));
  
  // Get Julian date for the selected date at noon UTC
  const noonUTC = new Date(Date.UTC(year, month, day, 12, 0, 0));
  const jd = getJulianDate(noonUTC);
  
  // Calculate equation of time and solar declination
  const { eqt, declination } = getSolarPosition(jd);
  
  // Calculate solar noon in UTC (hours from midnight UTC)
  // Solar noon UTC = 12:00 - (longitude / 15) - (equation of time / 60)
  const longitudeCorrection = lng / 15; // Convert longitude to hours
  const eqtHours = eqt / 60; // Convert minutes to hours
  const solarNoonUTC = 12 - longitudeCorrection - eqtHours;
  
  // Convert solar noon to local time by applying timezone offset
  const solarNoonLocal = solarNoonUTC + offset;
  
  // Fajr: 20 degrees below horizon (Kemenag Indonesia standard)
  const fajrOffset = getTimeDifference(lat, declination, 20) / 60;
  const fajrLocal = solarNoonLocal - fajrOffset;
  
  // Sunrise: 0.833 degrees below horizon (standard)
  const sunriseOffset = getTimeDifference(lat, declination, 0.833) / 60;
  const sunriseLocal = solarNoonLocal - sunriseOffset;
  
  // Dhuhr: solar noon + 2 minutes (standard practice)
  const dhuhrLocal = solarNoonLocal + 2 / 60;
  
  // Asr: using Shafi'i method (shadow = object length + shadow at noon)
  const asrAngle = getAsrAngle(lat, declination);
  const asrOffset = getTimeDifference(lat, declination, asrAngle) / 60;
  const asrLocal = solarNoonLocal + asrOffset;
  
  // Maghrib: same as sunset
  const maghribOffset = getTimeDifference(lat, declination, 0.833) / 60;
  const maghribLocal = solarNoonLocal + maghribOffset;
  
  // Isha: 18 degrees below horizon (Kemenag Indonesia standard)
  const ishaOffset = getTimeDifference(lat, declination, 18) / 60;
  const ishaLocal = solarNoonLocal + ishaOffset;
  
  return {
    fajr: formatTime(fajrLocal),
    sunrise: formatTime(sunriseLocal),
    dhuhr: formatTime(dhuhrLocal),
    asr: formatTime(asrLocal),
    maghrib: formatTime(maghribLocal),
    isha: formatTime(ishaLocal),
  };
}

function getJulianDate(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  const second = date.getUTCSeconds();
  
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  
  const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  const jd = jdn + (hour - 12) / 24 + minute / 1440 + second / 86400;
  
  return jd;
}

function getSolarPosition(jd: number): { eqt: number; declination: number } {
  const d = jd - 2451545.0;
  
  // Mean anomaly
  const g = (357.529 + 0.98560028 * d) % 360;
  const gRad = g * Math.PI / 180;
  
  // Mean longitude
  const q = (280.459 + 0.98564736 * d) % 360;
  
  // Ecliptic longitude
  const L = q + 1.915 * Math.sin(gRad) + 0.020 * Math.sin(2 * gRad);
  const LRad = (L % 360) * Math.PI / 180;
  
  // Obliquity of ecliptic
  const e = (23.439 - 0.00000036 * d) * Math.PI / 180;
  
  // Right ascension
  const ra = Math.atan2(Math.cos(e) * Math.sin(LRad), Math.cos(LRad));
  const raDeg = ra * 180 / Math.PI;
  
  // Equation of time (in minutes)
  let eqt = 4 * (q - raDeg);
  
  // Normalize equation of time to [-20, 20] minutes range
  while (eqt > 20) eqt -= 360 * 4;
  while (eqt < -20) eqt += 360 * 4;
  
  // Solar declination
  const declination = Math.asin(Math.sin(e) * Math.sin(LRad)) * 180 / Math.PI;
  
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

function formatTime(timeInHours: number): string {
  // Check if time is within valid same-day range (0-24)
  if (timeInHours < 0 || timeInHours >= 24) {
    // Time has wrapped into another day - this is invalid
    return 'INVALID';
  }
  
  const hours = Math.floor(timeInHours);
  const minutes = Math.round((timeInHours - hours) * 60);
  
  // Handle minute overflow
  let finalHours = hours;
  let finalMinutes = minutes;
  
  if (finalMinutes >= 60) {
    finalHours += 1;
    finalMinutes -= 60;
  }
  if (finalMinutes < 0) {
    finalHours -= 1;
    finalMinutes += 60;
  }
  
  // Check again after adjustment
  if (finalHours < 0 || finalHours >= 24) {
    return 'INVALID';
  }
  
  // Ensure valid values
  if (isNaN(finalHours) || isNaN(finalMinutes) || finalMinutes < 0 || finalMinutes >= 60) {
    return 'INVALID';
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

// Validation helpers
export function isValidTimeFormat(time: string): boolean {
  if (time === 'INVALID') return false;
  const match = time.match(/^(\d{2}):(\d{2})$/);
  if (!match) return false;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  return !isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
}

function parseTime(time: string): number {
  if (time === 'INVALID') return -1;
  const [hours, minutes] = time.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return -1;
  return hours * 60 + minutes;
}

export function validatePrayerTimes(times: PrayerTimes): boolean {
  // Check all times are valid format
  const allValid = Object.values(times).every(isValidTimeFormat);
  if (!allValid) {
    console.error('Invalid time format detected:', times);
    return false;
  }
  
  // Parse all times to minutes
  const fajrMinutes = parseTime(times.fajr);
  const sunriseMinutes = parseTime(times.sunrise);
  const dhuhrMinutes = parseTime(times.dhuhr);
  const asrMinutes = parseTime(times.asr);
  const maghribMinutes = parseTime(times.maghrib);
  const ishaMinutes = parseTime(times.isha);
  
  // Check for parsing errors
  if ([fajrMinutes, sunriseMinutes, dhuhrMinutes, asrMinutes, maghribMinutes, ishaMinutes].some(t => t < 0)) {
    console.error('Time parsing failed');
    return false;
  }
  
  // Relaxed realistic ranges for Indonesian prayer times across all regions
  // These ranges account for seasonal variation and timezone differences
  
  // Fajr: typically 03:00-06:30 (allowing for extreme northern/southern Indonesia)
  if (fajrMinutes < 3 * 60 || fajrMinutes > 6 * 60 + 30) {
    console.error('Fajr time out of realistic range:', times.fajr);
    return false;
  }
  
  // Sunrise: typically 04:30-07:30
  if (sunriseMinutes < 4 * 60 + 30 || sunriseMinutes > 7 * 60 + 30) {
    console.error('Sunrise time out of realistic range:', times.sunrise);
    return false;
  }
  
  // Dhuhr: typically 11:00-13:30
  if (dhuhrMinutes < 11 * 60 || dhuhrMinutes > 13 * 60 + 30) {
    console.error('Dhuhr time out of realistic range:', times.dhuhr);
    return false;
  }
  
  // Asr: typically 14:00-17:00
  if (asrMinutes < 14 * 60 || asrMinutes > 17 * 60) {
    console.error('Asr time out of realistic range:', times.asr);
    return false;
  }
  
  // Maghrib: typically 17:00-19:30
  if (maghribMinutes < 17 * 60 || maghribMinutes > 19 * 60 + 30) {
    console.error('Maghrib time out of realistic range:', times.maghrib);
    return false;
  }
  
  // Isha: typically 18:00-21:00
  if (ishaMinutes < 18 * 60 || ishaMinutes > 21 * 60) {
    console.error('Isha time out of realistic range:', times.isha);
    return false;
  }
  
  // Check strict chronological order (all times must be on the same day)
  const isChronological = 
    fajrMinutes < sunriseMinutes &&
    sunriseMinutes < dhuhrMinutes &&
    dhuhrMinutes < asrMinutes &&
    asrMinutes < maghribMinutes &&
    maghribMinutes < ishaMinutes;
  
  if (!isChronological) {
    console.error('Prayer times not in chronological order:', times);
    return false;
  }
  
  return true;
}
