import { useGetContents } from '@/hooks/useBackendQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { BookOpen, Scroll, Sparkles, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function DailyContentCarousel() {
  const { data: contents, isLoading, isError, error } = useGetContents();
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    // Auto-rotate every 5 seconds
    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 5000);

    // Update current slide on scroll
    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });

    return () => {
      clearInterval(interval);
    };
  }, [api]);

  // Show error state
  if (isError) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="text-lg">Konten Harian</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Gagal memuat konten harian. Silakan coba muat ulang halaman.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Show empty state
  if (!isLoading && (!contents || contents.length === 0)) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="text-lg">Konten Harian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center text-center space-y-3 py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Belum ada konten harian. Minta admin untuk menambahkan Tadabbur, Hadits, dan Kutipan Islami di Panel Admin.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show loading state
  if (isLoading || !contents) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="text-lg">Konten Harian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-muted-foreground">Memuat konten harian...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const slides = contents.flatMap((content) => [
    { type: 'Tadabbur', text: content.quranReflection, icon: BookOpen },
    { type: 'Hadits', text: content.hadith, icon: Scroll },
    { type: 'Kutipan Islami', text: content.motivation, icon: Sparkles },
  ]);

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
      <CardContent className="p-6">
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            {slides.map((slide, index) => {
              const Icon = slide.icon;
              return (
                <CarouselItem key={index}>
                  <div className="flex flex-col items-center text-center space-y-3 py-4">
                    <Icon className="h-8 w-8 text-primary" />
                    <h3 className="text-sm font-semibold text-muted-foreground">{slide.type}</h3>
                    <p className="text-base leading-relaxed max-w-2xl">{slide.text}</p>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </CardContent>
    </Card>
  );
}
