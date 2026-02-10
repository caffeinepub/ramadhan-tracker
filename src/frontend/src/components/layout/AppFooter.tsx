import { Heart } from 'lucide-react';

export function AppFooter() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = encodeURIComponent(window.location.hostname || 'ramadhan-tracker');

  return (
    <footer className="w-full border-t bg-background py-6 mt-auto">
      <div className="container px-4 text-center text-sm text-muted-foreground">
        <p className="flex items-center justify-center gap-1">
          © {currentYear} Ramadhan Tracker. Built with{' '}
          <Heart className="h-4 w-4 text-destructive fill-destructive" /> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
