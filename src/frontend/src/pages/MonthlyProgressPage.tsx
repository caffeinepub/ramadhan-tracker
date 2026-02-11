import React, { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Calendar, AlertCircle, ArrowLeft } from 'lucide-react';
import { useGetTasksInRange } from '@/hooks/useBackendQueries';
import { dateToTimestamp, formatDateForInput } from '@/utils/date';
import { calculateTaskCompletion } from '@/utils/progress';
import {
  getMonthStartDate,
  getMonthEndDate,
  formatMonthLabel,
  getMonthDays,
  getDaysInMonth,
} from '@/utils/month';
import { MonthlyProgressChart } from '@/components/dashboard/MonthlyProgressChart';
import { DownloadCsvCard } from '@/components/reports/DownloadCsvCard';
import type { Task } from '../backend';

export default function MonthlyProgressPage() {
  const navigate = useNavigate();
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

  const { data: tasksData, isLoading, isError, error, refetch } = useGetTasksInRange(
    startTimestamp,
    endTimestamp
  );

  // Check if viewing current month
  const isCurrentMonth = selectedYear === today.getFullYear() && selectedMonth === today.getMonth();
  const currentDay = today.getDate();

  const chartData = useMemo(() => {
    if (!tasksData) return [];

    const taskMap = new Map<number, Task>();
    tasksData.forEach(([dateTs, task]) => {
      const date = new Date(Number(dateTs) * 1000);
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
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);

    if (!tasksData || tasksData.length === 0) {
      return {
        daysInMonth,
        trackedDays: 0,
        perfectDays: 0,
        averageCompletion: 0,
      };
    }

    // Get unique tracked days
    const uniqueDays = new Set<number>();
    tasksData.forEach(([dateTs]) => {
      const date = new Date(Number(dateTs) * 1000);
      uniqueDays.add(date.getDate());
    });
    const trackedDays = uniqueDays.size;

    // Count perfect days (100% completion)
    const perfectDays = tasksData.filter(([_, task]) => {
      const completion = calculateTaskCompletion(task);
      return completion === 100;
    }).length;

    // Calculate average over tracked days only
    const totalCompletion = tasksData.reduce((sum, [_, task]) => {
      return sum + calculateTaskCompletion(task);
    }, 0);
    const averageCompletion = trackedDays > 0 ? Math.round(totalCompletion / trackedDays) : 0;

    return { daysInMonth, trackedDays, perfectDays, averageCompletion };
  }, [tasksData, selectedYear, selectedMonth]);

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

  const handleRetry = () => {
    refetch();
  };

  const handleBackToDashboard = () => {
    navigate({ to: '/' });
  };

  // Default date range for download card
  const defaultStartDate = formatDateForInput(monthStart);
  const defaultEndDate = formatDateForInput(monthEnd);

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Skeleton className="h-8 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-44" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-destructive">Failed to Load Data</h2>
            <p className="text-muted-foreground max-w-md">
              {error instanceof Error ? error.message : 'An unknown error occurred'}
            </p>
          </div>
          <Button onClick={handleRetry} variant="default">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const hasData = tasksData && tasksData.length > 0;

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header with month navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Monthly Progress
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-medium min-w-[140px] sm:min-w-[180px] text-center">
            {formatMonthLabel(selectedYear, selectedMonth)}
          </span>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Statistics cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Days in Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.daysInMonth}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tracked Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.trackedDays}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Perfect Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.perfectDays}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average (tracked)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.averageCompletion}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Progress Chart</CardTitle>
        </CardHeader>
        <CardContent>
          {hasData ? (
            <MonthlyProgressChart
              data={chartData}
              isCurrentMonth={isCurrentMonth}
              currentDay={currentDay}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Calendar className="h-12 w-12 text-muted-foreground/50" />
              <div className="text-center space-y-2">
                <p className="text-muted-foreground font-medium">No data for this month</p>
                <p className="text-sm text-muted-foreground">
                  Start tracking your daily worship activities to see your progress here.
                </p>
              </div>
              <Button onClick={handleBackToDashboard} variant="default" className="mt-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Download report card */}
      <DownloadCsvCard defaultStartDate={defaultStartDate} defaultEndDate={defaultEndDate} />
    </div>
  );
}
