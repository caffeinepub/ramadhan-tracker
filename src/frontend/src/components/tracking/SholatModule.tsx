import { useState, useEffect } from 'react';
import { useGetTask, useCreateOrUpdateTask } from '@/hooks/useBackendQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { dateToTimestamp } from '@/utils/date';
import { toast } from 'sonner';
import type { Sholat } from '@/backend';

interface SholatModuleProps {
  selectedDate: Date;
}

export function SholatModule({ selectedDate }: SholatModuleProps) {
  const timestamp = dateToTimestamp(selectedDate);
  const { data: task } = useGetTask(timestamp);
  const updateTask = useCreateOrUpdateTask();

  const [sholat, setSholat] = useState<Sholat>({
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
    dhuha: false,
    tarawih: false,
    qiyamulLail: false,
  });

  useEffect(() => {
    if (task?.sholat) {
      setSholat(task.sholat);
    } else {
      setSholat({
        fajr: false,
        dhuhr: false,
        asr: false,
        maghrib: false,
        isha: false,
        dhuha: false,
        tarawih: false,
        qiyamulLail: false,
      });
    }
  }, [task]);

  const handleToggle = async (field: keyof Sholat, checked: boolean) => {
    const newSholat = { ...sholat, [field]: checked };
    setSholat(newSholat);

    try {
      await updateTask.mutateAsync({
        date: timestamp,
        task: {
          fasting: task?.fasting,
          tilawah: task?.tilawah,
          murojaah: task?.murojaah,
          tahfidz: task?.tahfidz,
          sedekah: task?.sedekah,
          sholat: newSholat,
        },
      });
      toast.success('Prayer status updated');
    } catch (error) {
      toast.error('Failed to update prayer status');
      setSholat({ ...sholat, [field]: !checked });
    }
  };

  const prayers = [
    { key: 'fajr' as keyof Sholat, label: 'Subuh' },
    { key: 'dhuhr' as keyof Sholat, label: 'Zuhur' },
    { key: 'asr' as keyof Sholat, label: 'Ashar' },
    { key: 'maghrib' as keyof Sholat, label: 'Maghrib' },
    { key: 'isha' as keyof Sholat, label: 'Isya' },
    { key: 'dhuha' as keyof Sholat, label: 'Dhuha' },
    { key: 'tarawih' as keyof Sholat, label: 'Tarawih' },
    { key: 'qiyamulLail' as keyof Sholat, label: 'Qiyamul Lail' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sholat</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {prayers.map((prayer) => (
          <div key={prayer.key} className="flex items-center justify-between">
            <Label htmlFor={`sholat-${prayer.key}`}>{prayer.label}</Label>
            <Switch
              id={`sholat-${prayer.key}`}
              checked={sholat[prayer.key]}
              onCheckedChange={(checked) => handleToggle(prayer.key, checked)}
              disabled={updateTask.isPending}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
