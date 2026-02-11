import { useState } from 'react';
import { useGetAllUsers, useCreateUser, useUpdateUserProfile, useDeactivateUser, useReactivateUser } from '@/hooks/useBackendQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Principal } from '@dfinity/principal';
import { UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function UserManagementTab() {
  const { data: users, isLoading } = useGetAllUsers();
  const createUser = useCreateUser();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ principal: '', name: '', email: '' });

  const handleCreateUser = async () => {
    if (!newUserForm.principal || !newUserForm.name || !newUserForm.email) {
      toast.error('Semua kolom wajib diisi');
      return;
    }

    try {
      const principal = Principal.fromText(newUserForm.principal);
      await createUser.mutateAsync({
        user: principal,
        profile: {
          name: newUserForm.name,
          email: newUserForm.email,
          isActive: true,
        },
      });
      toast.success('Pengguna berhasil dibuat');
      setShowCreateDialog(false);
      setNewUserForm({ principal: '', name: '', email: '' });
    } catch (error) {
      toast.error('Gagal membuat pengguna. Periksa format principal.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Manajemen Pengguna</CardTitle>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Buat Pengguna
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Buat Pengguna Baru</DialogTitle>
                <DialogDescription>
                  Tambahkan akun pengguna baru. Pengguna memerlukan principal Internet Identity mereka.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="principal">ID Principal</Label>
                  <Input
                    id="principal"
                    value={newUserForm.principal}
                    onChange={(e) => setNewUserForm({ ...newUserForm, principal: e.target.value })}
                    placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nama</Label>
                  <Input
                    id="name"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    placeholder="Nama lengkap pengguna"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    placeholder="pengguna@contoh.com"
                  />
                </div>
                <Button onClick={handleCreateUser} disabled={createUser.isPending} className="w-full">
                  {createUser.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Membuat...
                    </>
                  ) : (
                    'Buat Pengguna'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : users && users.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Principal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.toString()}>
                  <TableCell className="font-mono text-xs">{user.toString().slice(0, 20)}...</TableCell>
                  <TableCell>
                    <Badge>Aktif</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Lihat Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground py-8">Tidak ada pengguna ditemukan</p>
        )}
      </CardContent>
    </Card>
  );
}
