import type { Task, Date_ } from '@/backend';
import { timestampToDate } from './date';

// Simple PDF generation without external dependencies
// Creates a basic PDF structure with text content
export function generatePdf(tasks: [Date_, Task][], startDate: string, endDate: string): Blob {
  const lines: string[] = [];
  
  // PDF Header
  lines.push('%PDF-1.4');
  lines.push('1 0 obj');
  lines.push('<< /Type /Catalog /Pages 2 0 R >>');
  lines.push('endobj');
  
  // Build content
  const content: string[] = [];
  content.push('Worship Progress Report');
  content.push(`Period: ${startDate} to ${endDate}`);
  content.push('');
  content.push('='.repeat(80));
  content.push('');
  
  tasks.forEach(([date, task]) => {
    const dateObj = timestampToDate(date);
    const dateStr = dateObj.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    content.push(`Date: ${dateStr}`);
    content.push('');
    
    // Prayer times
    content.push('Prayers:');
    content.push(`  Fajr: ${task.sholat?.fajr ? 'Yes' : 'No'}`);
    content.push(`  Dhuhr: ${task.sholat?.dhuhr ? 'Yes' : 'No'}`);
    content.push(`  Asr: ${task.sholat?.asr ? 'Yes' : 'No'}`);
    content.push(`  Maghrib: ${task.sholat?.maghrib ? 'Yes' : 'No'}`);
    content.push(`  Isha: ${task.sholat?.isha ? 'Yes' : 'No'}`);
    content.push(`  Dhuha: ${task.sholat?.dhuha ? 'Yes' : 'No'}`);
    content.push(`  Tarawih: ${task.sholat?.tarawih ? 'Yes' : 'No'}`);
    content.push(`  Qiyamul Lail: ${task.sholat?.qiyamulLail ? 'Yes' : 'No'}`);
    content.push('');
    
    // Fasting
    content.push(`Fasting: ${task.fasting?.isFasting ? 'Yes' : 'No'}`);
    if (task.fasting?.note) {
      content.push(`  Note: ${task.fasting.note}`);
    }
    content.push('');
    
    // Tilawah
    if (task.tilawah) {
      content.push(`Tilawah: ${task.tilawah.surah} (${task.tilawah.verseStart}-${task.tilawah.verseEnd})`);
    } else {
      content.push('Tilawah: Not recorded');
    }
    content.push('');
    
    // Murojaah
    if (task.murojaah) {
      content.push(`Murojaah: ${task.murojaah.surah} (${task.murojaah.verseStart}-${task.murojaah.verseEnd})`);
    } else {
      content.push('Murojaah: Not recorded');
    }
    content.push('');
    
    // Tahfidz
    if (task.tahfidz) {
      content.push(`Tahfidz: ${task.tahfidz.surah} (${task.tahfidz.verseStart}-${task.tahfidz.verseEnd})`);
    } else {
      content.push('Tahfidz: Not recorded');
    }
    content.push('');
    
    // Sedekah
    content.push(`Sedekah: ${task.sedekah?.completed ? 'Yes' : 'No'}`);
    content.push('');
    content.push('-'.repeat(80));
    content.push('');
  });
  
  // Encode content
  const contentStr = content.join('\n');
  const contentBytes = new TextEncoder().encode(contentStr);
  
  // Create a simple text-based PDF
  // For a proper PDF, we'd need a full PDF library, but this creates a readable text file
  // that browsers will handle as a download
  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Courier >> >> >>
endobj
5 0 obj
<< /Length ${contentBytes.length} >>
stream
BT
/F1 10 Tf
50 750 Td
${contentStr.split('\n').map((line, i) => `(${line.replace(/[()\\]/g, '\\$&')}) Tj 0 -12 Td`).join('\n')}
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000214 00000 n 
0000000308 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${400 + contentBytes.length}
%%EOF`;
  
  return new Blob([pdfContent], { type: 'application/pdf' });
}
