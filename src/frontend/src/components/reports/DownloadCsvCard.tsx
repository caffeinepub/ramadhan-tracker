import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { dateToTimestamp } from '@/utils/date';
import { generateCsv } from '@/utils/csv';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useActor } from '@/hooks/useActor';

export function DownloadCsvCard() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const { actor } = useActor();

  const handleDownload = async () => {
    if (!startDate || !endDate) {
      toast.error('Silakan pilih tanggal mulai dan tanggal akhir');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      toast.error('Tanggal mulai harus sebelum tanggal akhir');
      return;
    }

    if (!actor) {
      toast.error('Backend tidak tersedia');
      return;
    }

    setIsDownloading(true);
    try {
      const startTimestamp = dateToTimestamp(start);
      const endTimestamp = dateToTimestamp(end);

      const tasks = await actor.getTasksInRange(startTimestamp, endTimestamp);
      
      const csv = generateCsv(tasks);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan-ramadhan-${startDate}-sampai-${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('CSV berhasil diunduh');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Gagal mengunduh CSV');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unduh Laporan Progres</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Tanggal Mulai</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">Tanggal Akhir</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={handleDownload} disabled={isDownloading} className="w-full">
          {isDownloading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menghasilkan...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Unduh CSV
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
