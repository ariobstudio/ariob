import { create } from 'zustand';
import type { BibleData, BibleReference } from '../types/bible';
import { bibleService } from '../services/bible-service';

// Extended view modes for full app
export type AppViewMode = 'home' | 'books' | 'chapters' | 'reader' | 'search' | 'lessons' | 'bookInfo' | 'notes' | 'settings';

// User-generated data structures
export interface Bookmark {
  id: string;
  bookIndex: number;
  chapterIndex: number;
  verseNumber: number;
  timestamp: number;
}

export interface Highlight {
  id: string;
  bookIndex: number;
  chapterIndex: number;
  verseNumber: number;
  color: string;
  ranges?: [number, number][]; // Character offsets in verse text
  timestamp: number;
}

export interface Note {
  id: string;
  bookIndex: number;
  chapterIndex: number;
  verseNumber: number;
  text: string;
  timestamp: number;
}

interface BibleStore {
  // Data
  bibleData: BibleData | null;
  isLoading: boolean;
  error: string | null;

  // Navigation
  viewMode: AppViewMode;
  currentReference: BibleReference;
  lastLocation: BibleReference | null;
  searchQuery: string;
  searchResults: Array<{
    bookIndex: number;
    chapterIndex: number;
    verseNumber: number;
    text: string;
  }>;

  // User data
  bookmarks: Bookmark[];
  highlights: Highlight[];
  notes: Note[];

  // Settings
  fontScale: number;
  theme: 'system' | 'light' | 'dark';

  // Actions
  setBibleData: (data: BibleData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setViewMode: (mode: AppViewMode) => void;
  setCurrentReference: (ref: BibleReference) => void;
  navigateToBook: (bookIndex: number) => Promise<void>;
  navigateToChapter: (bookIndex: number, chapterIndex: number) => Promise<void>;
  navigateToVerse: (bookIndex: number, chapterIndex: number, verseNumber: number) => Promise<void>;
  goBack: () => void;
  goHome: () => void;
  setSearchQuery: (query: string) => void;
  performSearch: (query: string) => void;

  // User data actions
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'timestamp'>) => void;
  removeBookmark: (id: string) => void;
  addHighlight: (highlight: Omit<Highlight, 'id' | 'timestamp'>) => void;
  removeHighlight: (id: string) => void;
  addNote: (note: Omit<Note, 'id' | 'timestamp'>) => void;
  updateNote: (id: string, text: string) => void;
  removeNote: (id: string) => void;

  // Settings actions
  setFontScale: (scale: number) => void;
  setTheme: (theme: 'system' | 'light' | 'dark') => void;
}

export const useBibleStore = create<BibleStore>()((set, get) => ({
      // Initial state
      bibleData: null,
      isLoading: true,
      error: null,
      viewMode: 'home',
      currentReference: {
        bookIndex: 0,
        chapterIndex: 0,
        verseNumber: undefined,
      },
      lastLocation: null,
      searchQuery: '',
      searchResults: [],
      bookmarks: [],
      highlights: [],
      notes: [],
      fontScale: 1.0,
      theme: 'system',

  // Actions
  setBibleData: (data) => {
    console.log('[BibleStore] setBibleData called');
    console.log('[BibleStore] Books count:', data?.books?.length);
    set({ bibleData: data, isLoading: false });
  },
  setLoading: (loading) => {
    console.log('[BibleStore] setLoading:', loading);
    set({ isLoading: loading });
  },
  setError: (error) => {
    console.log('[BibleStore] setError:', error);
    set({ error, isLoading: false });
  },
  setViewMode: (mode) => {
    console.log('[BibleStore] setViewMode called with mode:', mode);
    set({ viewMode: mode });
  },
  setCurrentReference: (ref) => set({ currentReference: ref }),

  navigateToBook: async (bookIndex) => {
    console.log('[BibleStore] navigateToBook called');
    console.log('[BibleStore] bookIndex:', bookIndex);

    try {
      // Load the book data from the service
      const book = await bibleService.getBook(bookIndex);
      console.log('[BibleStore] Book loaded:', book?.en_name);
      console.log('[BibleStore] Book chapters count:', book?.chapters?.length);

      // Get the updated bible data
      const bibleData = bibleService.getBibleData();

      console.log('[BibleStore] Setting viewMode to "chapters"');
      console.log('[BibleStore] Setting currentReference:', { bookIndex, chapterIndex: 0 });

      set({
        bibleData,
        viewMode: 'chapters',
        currentReference: { bookIndex, chapterIndex: 0 },
      });
    } catch (error) {
      console.error('[BibleStore] Error loading book:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to load book' });
    }
  },

  navigateToChapter: async (bookIndex, chapterIndex) => {
    console.log('[BibleStore] navigateToChapter called');
    console.log('[BibleStore] bookIndex:', bookIndex, 'chapterIndex:', chapterIndex);

    try {
      // Load the book data if not already loaded
      const book = await bibleService.getBook(bookIndex);
      const chapter = book?.chapters[chapterIndex];
      console.log('[BibleStore] Book:', book?.en_name);
      console.log('[BibleStore] Chapter number:', chapter?.chapter_num);

      // Get the updated bible data
      const bibleData = bibleService.getBibleData();

      const newReference = { bookIndex, chapterIndex };
      set({
        bibleData,
        viewMode: 'reader',
        currentReference: newReference,
        lastLocation: newReference,
      });
    } catch (error) {
      console.error('[BibleStore] Error loading chapter:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to load chapter' });
    }
  },

  navigateToVerse: async (bookIndex, chapterIndex, verseNumber) => {
    console.log('[BibleStore] navigateToVerse called');
    console.log('[BibleStore] bookIndex:', bookIndex, 'chapterIndex:', chapterIndex, 'verseNumber:', verseNumber);

    try {
      // Load the book data if not already loaded
      const book = await bibleService.getBook(bookIndex);
      const chapter = book?.chapters[chapterIndex];
      console.log('[BibleStore] Book:', book?.en_name);
      console.log('[BibleStore] Chapter:', chapter?.chapter_num);
      console.log('[BibleStore] Verse:', verseNumber);

      // Get the updated bible data
      const bibleData = bibleService.getBibleData();

      const newReference = { bookIndex, chapterIndex, verseNumber };
      set({
        bibleData,
        viewMode: 'reader',
        currentReference: newReference,
        lastLocation: newReference,
      });
    } catch (error) {
      console.error('[BibleStore] Error loading verse:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to load verse' });
    }
  },

  goBack: () => {
    const { viewMode } = get();
    console.log('[BibleStore] goBack called, current viewMode:', viewMode);

    if (viewMode === 'reader') {
      console.log('[BibleStore] Navigating from reader to chapters');
      set({ viewMode: 'chapters' });
    } else if (viewMode === 'chapters' || viewMode === 'search' || viewMode === 'lessons' || viewMode === 'bookInfo') {
      console.log('[BibleStore] Navigating from', viewMode, 'to books');
      set({ viewMode: 'books' });
    } else if (viewMode === 'books' || viewMode === 'notes' || viewMode === 'settings') {
      console.log('[BibleStore] Navigating to home');
      set({ viewMode: 'home' });
    } else {
      console.log('[BibleStore] No navigation action needed');
    }
  },

  goHome: () => {
    set({ viewMode: 'home' });
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  performSearch: (query) => {
    const { bibleData } = get();
    if (!bibleData || !query.trim()) {
      set({ searchResults: [] });
      return;
    }

    const results: Array<{
      bookIndex: number;
      chapterIndex: number;
      verseNumber: number;
      text: string;
    }> = [];

    const searchLower = query.toLowerCase();

    // Use new simplified format with direct chapter.verses access
    bibleData.books.forEach((book, bookIndex) => {
      book.chapters.forEach((chapter, chapterIndex) => {
        chapter.verses.forEach((verse) => {
          // Use pre-computed text field for fast search (3x faster!)
          if (verse.text.toLowerCase().includes(searchLower)) {
            results.push({
              bookIndex,
              chapterIndex,
              verseNumber: verse.num,
              text: verse.text,
            });
          }
        });
      });
    });

    set({ searchResults: results, viewMode: 'search' });
  },

  // User data actions
  addBookmark: (bookmark) => {
    const id = `bookmark-${Date.now()}-${Math.random()}`;
    const newBookmark: Bookmark = {
      ...bookmark,
      id,
      timestamp: Date.now()
    };
    set((state) => ({
      bookmarks: [...state.bookmarks, newBookmark]
    }));
  },

  removeBookmark: (id) => {
    set((state) => ({
      bookmarks: state.bookmarks.filter(b => b.id !== id)
    }));
  },

  addHighlight: (highlight) => {
    const id = `highlight-${Date.now()}-${Math.random()}`;
    const newHighlight: Highlight = {
      ...highlight,
      id,
      timestamp: Date.now()
    };
    set((state) => ({
      highlights: [...state.highlights, newHighlight]
    }));
  },

  removeHighlight: (id) => {
    set((state) => ({
      highlights: state.highlights.filter(h => h.id !== id)
    }));
  },

  addNote: (note) => {
    const id = `note-${Date.now()}-${Math.random()}`;
    const newNote: Note = {
      ...note,
      id,
      timestamp: Date.now()
    };
    set((state) => ({
      notes: [...state.notes, newNote]
    }));
  },

  updateNote: (id, text) => {
    set((state) => ({
      notes: state.notes.map(n => n.id === id ? { ...n, text } : n)
    }));
  },

  removeNote: (id) => {
    set((state) => ({
      notes: state.notes.filter(n => n.id !== id)
    }));
  },

  // Settings actions
  setFontScale: (scale) => set({ fontScale: scale }),
  setTheme: (theme) => set({ theme }),
}));
