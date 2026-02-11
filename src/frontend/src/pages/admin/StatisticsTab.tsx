import { useState } from 'react';
import { useGetAllUsers, useGetUserStatistics } from '@/hooks/useBackendQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { dateToTimestamp } from '@/utils/date';
import { Loader2 } from 'lucide-react';

export function StatisticsTab() {
  const { data: users } = useGetAllUsers();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showStats, setShowStats] = useState(false);

  const handleViewStats = () => {
    if (startDate && endDate) {
      setShowStats(true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistik Partisipasi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stats-start">Tanggal Mulai</Label>
            <Input
              id="stats-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stats-end">Tanggal Akhir</Label>
            <Input
              id="stats-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={handleViewStats} disabled={!startDate || !endDate}>
          Lihat Statistik
        </Button>

        {showStats && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Total Pengguna</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{users?.length || 0}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Partisipasi Keseluruhan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Sholat</span>
                      <span>0%</span>
                    </div>
                    <Progress value={0} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Puasa</span>
                      <span>0%</span>
                    </div>
                    <Progress value={0} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tilawah</span>
                      <span>0%</span>
                    </div>
                    <Progress value={0} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Murojaah</span>
                      <span>0%</span>
                    </div>
                    <Progress value={0} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tahfidz</span>
                      <span>0%</span>
                    </div>
                    <Progress value={0} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Sedekah</span>
                      <span>0%</span>
                    </div>
                    <Progress value={0} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
