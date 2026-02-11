import type { Task, Date_ } from '@/backend';
import { timestampToDate } from './date';

export function generateCsv(tasks: [Date_, Task][]): string {
  const headers = [
    'Date',
    'Fajr',
    'Dhuhr',
    'Asr',
    'Maghrib',
    'Isha',
    'Dhuha',
    'Tarawih',
    'Qiyamul Lail',
    'Fasting',
    'Fasting Note',
    'Tilawah Surah',
    'Tilawah From',
    'Tilawah To',
    'Murojaah Surah',
    'Murojaah From',
    'Murojaah To',
    'Tahfidz Surah',
    'Tahfidz From',
    'Tahfidz To',
    'Sedekah',
  ];

  const rows = tasks.map(([date, task]) => {
    const dateObj = timestampToDate(date);
    return [
      dateObj.toLocaleDateString('en-US'),
      task.sholat?.fajr ? 'Yes' : 'No',
      task.sholat?.dhuhr ? 'Yes' : 'No',
      task.sholat?.asr ? 'Yes' : 'No',
      task.sholat?.maghrib ? 'Yes' : 'No',
      task.sholat?.isha ? 'Yes' : 'No',
      task.sholat?.dhuha ? 'Yes' : 'No',
      task.sholat?.tarawih ? 'Yes' : 'No',
      task.sholat?.qiyamulLail ? 'Yes' : 'No',
      task.fasting?.isFasting ? 'Yes' : 'No',
      task.fasting?.note || '',
      task.tilawah?.surah || '',
      task.tilawah?.verseStart?.toString() || '',
      task.tilawah?.verseEnd?.toString() || '',
      task.murojaah?.surah || '',
      task.murojaah?.verseStart?.toString() || '',
      task.murojaah?.verseEnd?.toString() || '',
      task.tahfidz?.surah || '',
      task.tahfidz?.verseStart?.toString() || '',
      task.tahfidz?.verseEnd?.toString() || '',
      task.sedekah?.completed ? 'Yes' : 'No',
    ];
  });

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\n');

  return csvContent;
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
