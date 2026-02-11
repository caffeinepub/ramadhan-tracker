import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { dateToTimestamp } from '@/utils/date';
import { generateCsv } from '@/utils/csv';
import { generatePdf } from '@/utils/pdf';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useActor } from '@/hooks/useActor';

type ExportFormat = 'csv' | 'pdf';

interface DownloadCsvCardProps {
  defaultStartDate?: string;
  defaultEndDate?: string;
}

export function DownloadCsvCard({ defaultStartDate = '', defaultEndDate = '' }: DownloadCsvCardProps) {
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [isDownloading, setIsDownloading] = useState(false);
  const { actor } = useActor();

  // Update dates when defaults change (e.g., month navigation)
  useEffect(() => {
    if (defaultStartDate) setStartDate(defaultStartDate);
    if (defaultEndDate) setEndDate(defaultEndDate);
  }, [defaultStartDate, defaultEndDate]);

  const handleDownload = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      toast.error('Start date must be before end date');
      return;
    }

    if (!actor) {
      toast.error('Backend not available');
      return;
    }

    setIsDownloading(true);
    try {
      const startTimestamp = dateToTimestamp(start);
      const endTimestamp = dateToTimestamp(end);

      const tasks = await actor.getTasksInRange(startTimestamp, endTimestamp);
      
      let blob: Blob;
      let filename: string;
      
      if (format === 'csv') {
        const csv = generateCsv(tasks);
        blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        filename = `worship-report-${startDate}-to-${endDate}.csv`;
      } else {
        blob = generatePdf(tasks, startDate, endDate);
        filename = `worship-report-${startDate}-to-${endDate}.pdf`;
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`${format.toUpperCase()} downloaded successfully`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error(`Failed to download ${format.toUpperCase()}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Download Progress Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="format">Format</Label>
          <Select value={format} onValueChange={(value) => setFormat(value as ExportFormat)}>
            <SelectTrigger id="format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
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
              Generating...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download {format.toUpperCase()}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
