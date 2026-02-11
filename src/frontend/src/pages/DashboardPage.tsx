import { useState, useEffect } from 'react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '@/hooks/useBackendQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DateSelector } from '@/components/dashboard/DateSelector';
import { DailyContentCarousel } from '@/components/dashboard/DailyContentCarousel';
import { DailyOverviewTiles } from '@/components/dashboard/DailyOverviewTiles';
import { DailyProgressBar } from '@/components/dashboard/DailyProgressBar';
import { PrayerTimesSection } from '@/components/dashboard/PrayerTimesSection';
import { YesterdayProgressSummary } from '@/components/dashboard/YesterdayProgressSummary';
import { FastingModule } from '@/components/tracking/FastingModule';
import { TilawahModule } from '@/components/tracking/TilawahModule';
import { MurojaahModule } from '@/components/tracking/MurojaahModule';
import { TahfidzModule } from '@/components/tracking/TahfidzModule';
import { SedekahModule } from '@/components/tracking/SedekahModule';
import { SholatModule } from '@/components/tracking/SholatModule';
import { dateToTimestamp, getTodayTimestamp } from '@/utils/date';
import { Loader2 } from 'lucide-react';

const SELECTED_DATE_KEY = 'dashboard_selected_date';

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const stored = localStorage.getItem(SELECTED_DATE_KEY);
    if (stored) {
      try {
        return new Date(stored);
      } catch {
        return new Date();
      }
    }
    return new Date();
  });

  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });

  useEffect(() => {
    if (isFetched && userProfile === null) {
      setShowProfileSetup(true);
    }
  }, [isFetched, userProfile]);

  useEffect(() => {
    localStorage.setItem(SELECTED_DATE_KEY, selectedDate.toISOString());
  }, [selectedDate]);

  const handleSaveProfile = async () => {
    if (!profileForm.name.trim() || !profileForm.email.trim()) return;
    
    await saveProfile.mutateAsync({
      name: profileForm.name.trim(),
      email: profileForm.email.trim(),
      isActive: true,
    });
    setShowProfileSetup(false);
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Selamat Datang, {userProfile?.name || 'Pengguna'}</h1>
            <p className="text-muted-foreground">Lacak aktivitas ibadah harian Anda</p>
          </div>
          <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
        </div>

        <DailyContentCarousel />

        <PrayerTimesSection selectedDate={selectedDate} />

        <DailyProgressBar selectedDate={selectedDate} />

        <div className="grid gap-4 lg:grid-cols-2">
          <DailyOverviewTiles selectedDate={selectedDate} />
          <YesterdayProgressSummary selectedDate={selectedDate} />
        </div>

        <div className="grid gap-4">
          <SholatModule selectedDate={selectedDate} />
          <FastingModule selectedDate={selectedDate} />
          <TilawahModule selectedDate={selectedDate} />
          <MurojaahModule selectedDate={selectedDate} />
          <TahfidzModule selectedDate={selectedDate} />
          <SedekahModule selectedDate={selectedDate} />
        </div>
      </div>

      <Dialog open={showProfileSetup} onOpenChange={setShowProfileSetup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lengkapi Profil Anda</DialogTitle>
            <DialogDescription>
              Silakan masukkan nama dan email Anda untuk memulai.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                placeholder="Masukkan nama Anda"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                placeholder="Masukkan email Anda"
              />
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={!profileForm.name.trim() || !profileForm.email.trim() || saveProfile.isPending}
              className="w-full"
            >
              {saveProfile.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Profil'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
