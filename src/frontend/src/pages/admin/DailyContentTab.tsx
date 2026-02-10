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
      toast.error('All fields are required');
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
      toast.success('Content saved successfully');
    } catch (error) {
      toast.error('Failed to save content');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Content Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quran">Tadabbur</Label>
            <Textarea
              id="quran"
              value={quranReflection}
              onChange={(e) => setQuranReflection(e.target.value)}
              placeholder="Enter a verse or reflection from the Quran..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hadith">Hadith</Label>
            <Textarea
              id="hadith"
              value={hadith}
              onChange={(e) => setHadith(e.target.value)}
              placeholder="Enter a hadith..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivation">Islamic Quote</Label>
            <Textarea
              id="motivation"
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="Enter an Islamic quote or motivational message..."
              rows={4}
            />
          </div>

          <Button onClick={handleSave} disabled={createOrUpdate.isPending} className="w-full">
            {createOrUpdate.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Content
              </>
            )}
          </Button>
        </div>

        {currentContent && (
          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">Current Content Preview</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Tadabbur:</strong> {currentContent.quranReflection}</p>
              <p><strong>Hadith:</strong> {currentContent.hadith}</p>
              <p><strong>Islamic Quote:</strong> {currentContent.motivation}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
