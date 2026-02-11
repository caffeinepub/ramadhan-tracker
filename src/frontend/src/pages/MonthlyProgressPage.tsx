import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useGetTasksInRange } from '@/hooks/useBackendQueries';
import { dateToTimestamp } from '@/utils/date';
import { calculateTaskCompletion } from '@/utils/progress';
import {
  getMonthStartDate,
  getMonthEndDate,
  formatMonthLabel,
  getMonthDays,
} from '@/utils/month';
import { MonthlyProgressChart } from '@/components/dashboard/MonthlyProgressChart';
import { DownloadCsvCard } from '@/components/reports/DownloadCsvCard';
import type { Task } from '../backend';

export default function MonthlyProgressPage() {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());

  const monthStart = useMemo(
    () => getMonthStartDate(selectedYear, selectedMonth),
    [selectedYear, selectedMonth]
  );
  const monthEnd = useMemo(
    () => getMonthEndDate(selectedYear, selectedMonth),
    [selectedYear, selectedMonth]
  );

  const startTimestamp = dateToTimestamp(monthStart);
  const endTimestamp = dateToTimestamp(monthEnd);

  const { data: tasksData, isLoading, isError, error } = useGetTasksInRange(
    startTimestamp,
    endTimestamp
  );

  const chartData = useMemo(() => {
    if (!tasksData) return [];

    const taskMap = new Map<number, Task>();
    tasksData.forEach(([dateTs, task]) => {
      const date = new Date(Number(dateTs));
      taskMap.set(date.getDate(), task);
    });

    const days = getMonthDays(selectedYear, selectedMonth);
    return days.map((day) => {
      const task = taskMap.get(day);
      const percentage = task ? calculateTaskCompletion(task) : 0;
      return { day, percentage };
    });
  }, [tasksData, selectedYear, selectedMonth]);

  const stats = useMemo(() => {
    if (!tasksData || tasksData.length === 0) {
      return {
        totalDays: 0,
        completedDays: 0,
        averageCompletion: 0,
      };
    }

    const totalDays = tasksData.length;
    const completedDays = tasksData.filter(([_, task]) => {
      const completion = calculateTaskCompletion(task);
      return completion === 100;
    }).length;

    const totalCompletion = tasksData.reduce((sum, [_, task]) => {
      return sum + calculateTaskCompletion(task);
    }, 0);
    const averageCompletion = Math.round(totalCompletion / totalDays);

    return { totalDays, completedDays, averageCompletion };
  }, [tasksData]);

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-destructive">
            Gagal memuat data: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  const hasData = tasksData && tasksData.length > 0;

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Progres Bulanan
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-medium min-w-[180px] text-center">
            {formatMonthLabel(selectedYear, selectedMonth)}
          </span>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hari Tercatat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalDays}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hari Sempurna
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.completedDays}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rata-rata Penyelesaian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.averageCompletion}%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grafik Progres Harian</CardTitle>
        </CardHeader>
        <CardContent>
          {hasData ? (
            <MonthlyProgressChart data={chartData} />
          ) : (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              Belum ada data untuk bulan ini
            </div>
          )}
        </CardContent>
      </Card>

      <DownloadCsvCard />
    </div>
  );
}
