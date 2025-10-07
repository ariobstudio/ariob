import type { BibleData } from '../types/bible';
import bibleData from '../data/bible.json';

class BibleService {
  private data: BibleData | null = null;

  async loadBible(): Promise<BibleData> {
    // In a real app, this might fetch from an API or local storage
    // For now, we'll use the imported JSON directly
    this.data = bibleData as unknown as BibleData;
    return this.data;
  }

  getBibleData(): BibleData | null {
    return this.data;
  }

  getBook(index: number) {
    return this.data?.books[index];
  }

  getChapter(bookIndex: number, chapterIndex: number) {
    return this.data?.books[bookIndex]?.chapters[chapterIndex];
  }

  getBookByName(name: string) {
    return this.data?.books.find(
      (book) =>
        book.en_name.toLowerCase() === name.toLowerCase() ||
        book.local_name.toLowerCase() === name.toLowerCase()
    );
  }

  searchVerses(query: string) {
    console.log('[BibleService] searchVerses called with query:', query);
    console.log('[BibleService] this.data exists:', !!this.data);
    console.log('[BibleService] query.trim():', query.trim());

    if (!this.data) {
      console.log('[BibleService] No bible data loaded, returning empty array');
      return [];
    }

    if (!query.trim()) {
      console.log('[BibleService] Empty query, returning empty array');
      return [];
    }

    const results: Array<{
      bookName: string;
      bookIndex: number;
      chapterNum: number;
      chapterIndex: number;
      verseNum: number;
      text: string;
    }> = [];

    const searchLower = query.toLowerCase();
    console.log('[BibleService] Searching for:', searchLower);
    console.log('[BibleService] Total books to search:', this.data.books.length);

    let totalChaptersSearched = 0;
    let totalVersesSearched = 0;

    this.data.books.forEach((book, bookIndex) => {
      book.chapters.forEach((chapter, chapterIndex) => {
        totalChaptersSearched++;
        chapter.verses.forEach((verse) => {
          totalVersesSearched++;

          // Use the pre-computed text field for fast search
          if (verse.text.toLowerCase().includes(searchLower)) {
            const result = {
              bookName: book.en_name,
              bookIndex,
              chapterNum: chapter.chapter_num,
              chapterIndex,
              verseNum: verse.num,
              text: verse.text,
            };
            console.log('[BibleService] Match found:', result);
            results.push(result);
          }
        });
      });
    });

    console.log('[BibleService] Search complete');
    console.log('[BibleService] Total chapters searched:', totalChaptersSearched);
    console.log('[BibleService] Total verses searched:', totalVersesSearched);
    console.log('[BibleService] Total results found:', results.length);

    return results;
  }
}

export const bibleService = new BibleService();
