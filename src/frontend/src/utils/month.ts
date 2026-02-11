/**
 * Get the start date (first day at 00:00:00) of a given month
 */
export function getMonthStartDate(year: number, month: number): Date {
  const date = new Date(year, month, 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Get the end date (last day at 23:59:59) of a given month
 */
export function getMonthEndDate(year: number, month: number): Date {
  const date = new Date(year, month + 1, 0);
  date.setHours(23, 59, 59, 999);
  return date;
}

/**
 * Get the number of days in a given month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Format month label in English
 */
export function formatMonthLabel(year: number, month: number): string {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${monthNames[month]} ${year}`;
}

/**
 * Get array of day numbers for a given month
 */
export function getMonthDays(year: number, month: number): number[] {
  const daysCount = getDaysInMonth(year, month);
  return Array.from({ length: daysCount }, (_, i) => i + 1);
}
