export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateVerseRange(
  surah: string,
  verseStart: string,
  verseEnd: string
): ValidationResult {
  if (!surah.trim()) {
    return { valid: false, error: 'Surah name is required' };
  }

  const start = parseInt(verseStart, 10);
  const end = parseInt(verseEnd, 10);

  if (isNaN(start) || start < 1) {
    return { valid: false, error: 'Start verse must be a positive number' };
  }

  if (isNaN(end) || end < 1) {
    return { valid: false, error: 'End verse must be a positive number' };
  }

  if (start > end) {
    return { valid: false, error: 'Start verse must be less than or equal to end verse' };
  }

  return { valid: true };
}
