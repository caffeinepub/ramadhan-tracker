import type { Task } from '../backend';

/**
 * Calculate completion percentage for a task following DailyProgressBar rules:
 * - 6 total items
 * - Sholat counts as complete only when all 5 wajib prayers are true
 */
export function calculateTaskCompletion(task: Task | null): number {
  if (!task) return 0;

  const fiveWajibComplete = 
    task.sholat?.fajr && 
    task.sholat?.dhuhr && 
    task.sholat?.asr && 
    task.sholat?.maghrib && 
    task.sholat?.isha;

  const completedItems = [
    fiveWajibComplete,
    task.fasting?.isFasting,
    task.tilawah !== undefined && task.tilawah !== null,
    task.murojaah !== undefined && task.murojaah !== null,
    task.tahfidz !== undefined && task.tahfidz !== null,
    task.sedekah?.completed,
  ].filter(Boolean).length;

  const totalItems = 6;
  return Math.round((completedItems / totalItems) * 100);
}

/**
 * Get completed and total item counts for a task
 */
export function getTaskCompletionCounts(task: Task | null): { completed: number; total: number } {
  if (!task) return { completed: 0, total: 6 };

  const fiveWajibComplete = 
    task.sholat?.fajr && 
    task.sholat?.dhuhr && 
    task.sholat?.asr && 
    task.sholat?.maghrib && 
    task.sholat?.isha;

  const completedItems = [
    fiveWajibComplete,
    task.fasting?.isFasting,
    task.tilawah !== undefined && task.tilawah !== null,
    task.murojaah !== undefined && task.murojaah !== null,
    task.tahfidz !== undefined && task.tahfidz !== null,
    task.sedekah?.completed,
  ].filter(Boolean).length;

  return { completed: completedItems, total: 6 };
}
