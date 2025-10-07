import { create } from 'zustand';
import type { BibleData, BibleReference, ViewMode } from '../types/bible';

interface BibleStore {
  // Data
  bibleData: BibleData | null;
  isLoading: boolean;
  error: string | null;

  // Navigation
  viewMode: ViewMode;
  currentReference: BibleReference;
  searchQuery: string;
  searchResults: Array<{
    bookIndex: number;
    chapterIndex: number;
    verseNumber: number;
    text: string;
  }>;

  // Actions
  setBibleData: (data: BibleData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setCurrentReference: (ref: BibleReference) => void;
  navigateToBook: (bookIndex: number) => void;
  navigateToChapter: (bookIndex: number, chapterIndex: number) => void;
  navigateToVerse: (bookIndex: number, chapterIndex: number, verseNumber: number) => void;
  goBack: () => void;
  setSearchQuery: (query: string) => void;
  performSearch: (query: string) => void;
}

export const useBibleStore = create<BibleStore>((set, get) => ({
  // Initial state
  bibleData: null,
  isLoading: true,
  error: null,
  viewMode: 'books',
  currentReference: {
    bookIndex: 0,
    chapterIndex: 0,
    verseNumber: undefined,
  },
  searchQuery: '',
  searchResults: [],

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

  navigateToBook: (bookIndex) => {
    console.log('[BibleStore] navigateToBook called');
    console.log('[BibleStore] bookIndex:', bookIndex);

    const { bibleData } = get();
    if (bibleData) {
      const book = bibleData.books[bookIndex];
      console.log('[BibleStore] Book found:', book?.en_name);
      console.log('[BibleStore] Book chapters:', book?.ch_count);
    } else {
      console.log('[BibleStore] Warning: No bibleData available');
    }

    console.log('[BibleStore] Setting viewMode to "chapters"');
    console.log('[BibleStore] Setting currentReference:', { bookIndex, chapterIndex: 0 });

    set({
      viewMode: 'chapters',
      currentReference: { bookIndex, chapterIndex: 0 },
    });
  },

  navigateToChapter: (bookIndex, chapterIndex) => {
    console.log('[BibleStore] navigateToChapter called');
    console.log('[BibleStore] bookIndex:', bookIndex, 'chapterIndex:', chapterIndex);

    const { bibleData } = get();
    if (bibleData) {
      const book = bibleData.books[bookIndex];
      const chapter = book?.chapters[chapterIndex];
      console.log('[BibleStore] Book:', book?.en_name);
      console.log('[BibleStore] Chapter number:', chapter?.chapter_num);
    }

    set({
      viewMode: 'reader',
      currentReference: { bookIndex, chapterIndex },
    });
  },

  navigateToVerse: (bookIndex, chapterIndex, verseNumber) => {
    console.log('[BibleStore] navigateToVerse called');
    console.log('[BibleStore] bookIndex:', bookIndex, 'chapterIndex:', chapterIndex, 'verseNumber:', verseNumber);

    const { bibleData } = get();
    if (bibleData) {
      const book = bibleData.books[bookIndex];
      const chapter = book?.chapters[chapterIndex];
      console.log('[BibleStore] Book:', book?.en_name);
      console.log('[BibleStore] Chapter:', chapter?.chapter_num);
      console.log('[BibleStore] Verse:', verseNumber);
    }

    set({
      viewMode: 'reader',
      currentReference: { bookIndex, chapterIndex, verseNumber },
    });
  },

  goBack: () => {
    const { viewMode } = get();
    console.log('[BibleStore] goBack called, current viewMode:', viewMode);

    if (viewMode === 'reader') {
      console.log('[BibleStore] Navigating from reader to chapters');
      set({ viewMode: 'chapters' });
    } else if (viewMode === 'chapters' || viewMode === 'search') {
      console.log('[BibleStore] Navigating from', viewMode, 'to books');
      set({ viewMode: 'books' });
    } else {
      console.log('[BibleStore] No navigation action needed');
    }
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
}));
