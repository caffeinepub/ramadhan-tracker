import type { Task, Date_ } from '@/backend';
import { timestampToDate } from './date';

export function generateCsv(tasks: [Date_, Task][]): string {
  const headers = [
    'Tanggal',
    'Subuh',
    'Zuhur',
    'Ashar',
    'Maghrib',
    'Isya',
    'Dhuha',
    'Tarawih',
    'Qiyamul Lail',
    'Puasa',
    'Catatan Puasa',
    'Tilawah Surah',
    'Tilawah Dari',
    'Tilawah Sampai',
    'Murojaah Surah',
    'Murojaah Dari',
    'Murojaah Sampai',
    'Tahfidz Surah',
    'Tahfidz Dari',
    'Tahfidz Sampai',
    'Sedekah',
  ];

  const rows = tasks.map(([date, task]) => {
    const dateObj = timestampToDate(date);
    return [
      dateObj.toLocaleDateString('id-ID'),
      task.sholat?.fajr ? 'Ya' : 'Tidak',
      task.sholat?.dhuhr ? 'Ya' : 'Tidak',
      task.sholat?.asr ? 'Ya' : 'Tidak',
      task.sholat?.maghrib ? 'Ya' : 'Tidak',
      task.sholat?.isha ? 'Ya' : 'Tidak',
      task.sholat?.dhuha ? 'Ya' : 'Tidak',
      task.sholat?.tarawih ? 'Ya' : 'Tidak',
      task.sholat?.qiyamulLail ? 'Ya' : 'Tidak',
      task.fasting?.isFasting ? 'Ya' : 'Tidak',
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
      task.sedekah?.completed ? 'Ya' : 'Tidak',
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
