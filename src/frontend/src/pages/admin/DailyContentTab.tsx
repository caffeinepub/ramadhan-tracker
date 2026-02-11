import { useState, useEffect } from 'react';
import { useGetContents, useCreateOrUpdateContent, useDeleteContent } from '@/hooks/useBackendQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { DailyContent } from '@/backend';

export function DailyContentTab() {
  const { data: contents, isLoading } = useGetContents();
  const createOrUpdate = useCreateOrUpdateContent();
  const deleteContent = useDeleteContent();

  const [quranReflection, setQuranReflection] = useState('');
  const [hadith, setHadith] = useState('');
  const [motivation, setMotivation] = useState('');

  const currentContent = contents?.[0];

  // Initialize form state from loaded content
  useEffect(() => {
    if (currentContent) {
      setQuranReflection(currentContent.quranReflection);
      setHadith(currentContent.hadith);
      setMotivation(currentContent.motivation);
    }
  }, [currentContent]);

  const handleSave = async () => {
    if (!quranReflection.trim() || !hadith.trim() || !motivation.trim()) {
      toast.error('Semua kolom wajib diisi');
      return;
    }

    try {
      await createOrUpdate.mutateAsync({
        contentType: BigInt(0),
        content: {
          quranReflection: quranReflection.trim(),
          hadith: hadith.trim(),
          motivation: motivation.trim(),
        },
      });
      toast.success('Konten berhasil disimpan');
    } catch (error) {
      toast.error('Gagal menyimpan konten');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manajemen Konten Harian</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quran">Tadabbur</Label>
            <Textarea
              id="quran"
              value={quranReflection}
              onChange={(e) => setQuranReflection(e.target.value)}
              placeholder="Masukkan ayat atau renungan dari Al-Qur'an..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hadith">Hadits</Label>
            <Textarea
              id="hadith"
              value={hadith}
              onChange={(e) => setHadith(e.target.value)}
              placeholder="Masukkan hadits..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivation">Kutipan Islami</Label>
            <Textarea
              id="motivation"
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="Masukkan kutipan Islami atau pesan motivasi..."
              rows={4}
            />
          </div>

          <Button onClick={handleSave} disabled={createOrUpdate.isPending} className="w-full">
            {createOrUpdate.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Simpan Konten
              </>
            )}
          </Button>
        </div>

        {currentContent && (
          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">Pratinjau Konten Saat Ini</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Tadabbur:</strong> {currentContent.quranReflection}</p>
              <p><strong>Hadits:</strong> {currentContent.hadith}</p>
              <p><strong>Kutipan Islami:</strong> {currentContent.motivation}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
