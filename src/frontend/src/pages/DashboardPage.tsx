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
import { FastingModule } from '@/components/tracking/FastingModule';
import { TilawahModule } from '@/components/tracking/TilawahModule';
import { MurojaahModule } from '@/components/tracking/MurojaahModule';
import { TahfidzModule } from '@/components/tracking/TahfidzModule';
import { SedekahModule } from '@/components/tracking/SedekahModule';
import { DownloadCsvCard } from '@/components/reports/DownloadCsvCard';
import { dateToTimestamp, getTodayTimestamp } from '@/utils/date';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });

  useEffect(() => {
    if (isFetched && userProfile === null) {
      setShowProfileSetup(true);
    }
  }, [isFetched, userProfile]);

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
            <h1 className="text-2xl font-bold">Welcome, {userProfile?.name || 'User'}</h1>
            <p className="text-muted-foreground">Track your daily worship activities</p>
          </div>
          <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
        </div>

        <DailyContentCarousel />

        <DailyProgressBar selectedDate={selectedDate} />

        <DailyOverviewTiles selectedDate={selectedDate} />

        <div className="grid gap-4">
          <FastingModule selectedDate={selectedDate} />
          <TilawahModule selectedDate={selectedDate} />
          <MurojaahModule selectedDate={selectedDate} />
          <TahfidzModule selectedDate={selectedDate} />
          <SedekahModule selectedDate={selectedDate} />
        </div>

        <DownloadCsvCard />
      </div>

      <Dialog open={showProfileSetup} onOpenChange={setShowProfileSetup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Your Profile</DialogTitle>
            <DialogDescription>
              Please provide your name and email to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                placeholder="Enter your email"
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
                  Saving...
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
