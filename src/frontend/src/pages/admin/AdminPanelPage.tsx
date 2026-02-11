import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserManagementTab } from './UserManagementTab';
import { DailyContentTab } from './DailyContentTab';
import { StatisticsTab } from './StatisticsTab';
import { SettingsTab } from './SettingsTab';

export default function AdminPanelPage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Panel Admin</h1>
        <p className="text-muted-foreground">Kelola pengguna, konten, dan lihat statistik</p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Pengguna</TabsTrigger>
          <TabsTrigger value="content">Konten</TabsTrigger>
          <TabsTrigger value="statistics">Statistik</TabsTrigger>
          <TabsTrigger value="settings">Pengaturan</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <UserManagementTab />
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <DailyContentTab />
        </TabsContent>

        <TabsContent value="statistics" className="mt-6">
          <StatisticsTab />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
