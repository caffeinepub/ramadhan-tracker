export function dateToTimestamp(date: Date): bigint {
  // Convert to Unix timestamp in seconds
  return BigInt(Math.floor(date.getTime() / 1000));
}

export function timestampToDate(timestamp: bigint): Date {
  return new Date(Number(timestamp) * 1000);
}

export function getTodayTimestamp(): bigint {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dateToTimestamp(today);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getPreviousDay(date: Date): Date {
  const previous = new Date(date);
  previous.setDate(previous.getDate() - 1);
  return previous;
}

/**
 * Format a Date object to YYYY-MM-DD string for HTML date inputs
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
