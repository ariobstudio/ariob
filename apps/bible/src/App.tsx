import './styles/globals.css';

import { useEffect } from '@lynx-js/react';
import { useTheme, Column } from '@ariob/ui';
import { useBibleStore } from './store/bible-store';
import { bibleService } from './services/bible-service';
import { BookList, ChapterList, VerseReader, SearchView } from './components';

export function App() {
  const { withTheme, setTheme } = useTheme();
  const { viewMode, setBibleData, setError, setLoading, isLoading, error } = useBibleStore();

  console.log('[App] Rendering with viewMode:', viewMode, 'isLoading:', isLoading, 'error:', error);

  // Load Bible data on mount
  useEffect(() => {
    async function loadBible() {
      try {
        console.log('[App] Starting to load Bible data...');
        setLoading(true);
        const data = await bibleService.loadBible();
        console.log('[App] Bible data loaded successfully');
        console.log('[App] Data structure:', {
          version: data.version,
          booksCount: data.books.length,
          firstBook: data.books[0]?.en_name,
          lastBook: data.books[data.books.length - 1]?.en_name
        });
        setBibleData(data);
      } catch (err) {
        console.error('[App] Error loading Bible data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load Bible data');
      }
    }
    setTheme('Dark');
    console.log('[App] Component mounted, initiating Bible data load');
    loadBible();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <page
        style={{ paddingTop: 'max(env(safe-area-inset-top), 7%)' }}
        className={withTheme(
          'bg-background w-full h-full',
          'dark bg-background w-full h-full'
        )}
      >
        <Column align="center" justify="center" width="full" height="full">
          <text className="text-foreground text-lg">Loading Orthodox Study Bible...</text>
        </Column>
      </page>
    );
  }

  // Error state
  if (error) {
    return (
      <page
        className={withTheme(
          'bg-background pt-safe-top w-full h-full',
          'dark bg-background pt-safe-top w-full h-full'
        )}
      >
        <Column align="center" justify="center" width="full" height="full" className="p-6">
          <text className="text-destructive text-lg mb-4">Error</text>
          <text className="text-foreground text-center">{error}</text>
        </Column>
      </page>
    );
  }

  // Main app with view routing
  return (
    <page
      className={withTheme(
        'bg-background pt-safe-top w-full h-full',
        'dark bg-background pt-safe-top w-full h-full'
      )}
    >
      {viewMode === 'books' && <BookList />}
      {viewMode === 'chapters' && <ChapterList />}
      {viewMode === 'reader' && <VerseReader />}
      {viewMode === 'search' && <SearchView />}
    </page>
  );
}
