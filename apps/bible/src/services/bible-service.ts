import type { BibleData, VersePart, Verse } from '../types/bible';
// Import metadata directly as JSON data
import bibleMetadata from '../assets/bible-metadata.json';
import { loadBookData } from './book-loader';

interface BibleMetadata {
  version: string;
  bookCount: number;
  books: Array<{
    index: number;
    en_name: string;
    local_name: string;
    chapterCount: number;
  }>;
}

// Raw data types from JSON
interface RawVersePart {
  style: 'NONE' | 'ITALIC' | 'OBLIQUE' | 'DIVINE_NAME' | 'SMALL_CAPS' | 'LINE_BREAK' | 'FOOTNOTE' | 'LITURGY_NOTE' | 'CROSS_REF';
  text: string;
  note_parts?: RawVersePart[];
}

interface RawVerse {
  num_int: number;
  num_str: string;
  verse_parts: RawVersePart[];
}

class BibleService {
  private data: BibleData | null = null;
  private metadata: BibleMetadata | null = null;
  private loadedBooks: Map<number, any> = new Map();

  /**
   * Transform raw verse_parts from JSON to UI-friendly VersePart format
   */
  private transformVerseParts(rawParts: RawVersePart[], bookIndex: number, chapterNum: number, verseNum: number): { parts: VersePart[], text: string, footnoteIds: string[], liturgyIds: string[] } {
    const parts: VersePart[] = [];
    let text = '';
    const footnoteIds: string[] = [];
    const liturgyIds: string[] = [];
    let footnoteCount = 0;
    let liturgyCount = 0;

    for (const rawPart of rawParts) {
      switch (rawPart.style) {
        case 'NONE':
          parts.push(rawPart.text);
          text += rawPart.text;
          break;

        case 'ITALIC':
          parts.push({ italic: rawPart.text });
          text += rawPart.text;
          break;

        case 'OBLIQUE':
          parts.push({ oblique: rawPart.text });
          text += rawPart.text;
          break;

        case 'DIVINE_NAME':
          parts.push({ divine_name: rawPart.text });
          text += rawPart.text;
          break;

        case 'SMALL_CAPS':
          parts.push({ small_caps: rawPart.text });
          text += rawPart.text;
          break;

        case 'LINE_BREAK':
          parts.push({ line_break: true });
          text += '\n';
          break;

        case 'FOOTNOTE':
          // Don't add to visible parts (handled at verse level)
          // Generate stable footnote ID based on location
          footnoteCount++;
          const footnoteId = `f${bookIndex}-${chapterNum}-${verseNum}-${footnoteCount}`;
          footnoteIds.push(footnoteId);

          // Store footnote content
          if (this.data) {
            const noteParts: any[] = [];
            let noteText = rawPart.text || '';

            // Process note_parts if they exist
            if (rawPart.note_parts) {
              noteText = '';
              for (const notePart of rawPart.note_parts) {
                if (notePart.style === 'NONE') {
                  noteParts.push(notePart.text);
                  noteText += notePart.text;
                } else if (notePart.style === 'ITALIC') {
                  noteParts.push({ italic: notePart.text });
                  noteText += notePart.text;
                } else if (notePart.style === 'CROSS_REF') {
                  noteParts.push({ cross_ref: footnoteId, text: notePart.text });
                  noteText += notePart.text;
                }
              }
            }

            this.data.footnotes[footnoteId] = {
              text: noteText,
              parts: noteParts.length > 0 ? noteParts : [noteText]
            };
          }
          break;

        case 'LITURGY_NOTE':
          // Don't add to visible parts (handled at verse level)
          liturgyCount++;
          const liturgyId = `l${bookIndex}-${chapterNum}-${verseNum}-${liturgyCount}`;
          liturgyIds.push(liturgyId);

          // Store liturgy note content
          if (this.data) {
            const noteParts: any[] = [];
            let noteText = rawPart.text || '';

            // Process note_parts if they exist
            if (rawPart.note_parts) {
              noteText = '';
              for (const notePart of rawPart.note_parts) {
                if (notePart.style === 'NONE') {
                  noteParts.push(notePart.text);
                  noteText += notePart.text;
                } else if (notePart.style === 'ITALIC') {
                  noteParts.push({ italic: notePart.text });
                  noteText += notePart.text;
                } else if (notePart.style === 'CROSS_REF') {
                  noteParts.push({ cross_ref: liturgyId, text: notePart.text });
                  noteText += notePart.text;
                }
              }
            }

            this.data.liturgy_notes[liturgyId] = {
              text: noteText,
              parts: noteParts.length > 0 ? noteParts : [noteText]
            };
          }
          break;

        case 'CROSS_REF':
          // Add cross-reference part
          const crossRefId = `cr-${Date.now()}-${Math.random()}`;
          parts.push({ cross_ref: crossRefId, text: rawPart.text });
          text += rawPart.text;
          break;

        default:
          // Fallback: treat as plain text
          parts.push(rawPart.text);
          text += rawPart.text;
      }
    }

    return { parts, text, footnoteIds, liturgyIds };
  }

  /**
   * Transform raw verse from JSON to UI-friendly Verse format
   */
  private transformVerse(rawVerse: RawVerse, bookIndex: number, chapterNum: number): Verse {
    const { parts, text, footnoteIds, liturgyIds } = this.transformVerseParts(
      rawVerse.verse_parts,
      bookIndex,
      chapterNum,
      rawVerse.num_int
    );

    return {
      num: rawVerse.num_int,
      text,
      parts,
      footnotes: footnoteIds.length > 0 ? footnoteIds : null,
      liturgy_notes: liturgyIds.length > 0 ? liturgyIds : null
    };
  }

  async loadBible(): Promise<BibleData> {
    // Use the imported metadata directly (small file ~9KB)
    this.metadata = bibleMetadata as BibleMetadata;

    // Create a shell BibleData structure with empty books
    // Books will be loaded on demand
    this.data = {
      version: this.metadata.version,
      lang: 'en',
      books: this.metadata.books.map(bookMeta => ({
        en_name: bookMeta.en_name,
        local_name: bookMeta.local_name,
        ch_count: bookMeta.chapterCount,
        metadata: [],
        chapters: [], // Will be loaded on demand
        lessons: null
      })),
      footnotes: {},
      liturgy_notes: {},
      cross_refs: {}
    } as BibleData;

    return this.data;
  }

  private async loadBook(index: number) {
    if (this.loadedBooks.has(index)) {
      return this.loadedBooks.get(index);
    }

    try {
      // Use the book loader module which handles static imports properly
      console.log(`[BibleService] Loading book ${index}`);
      const bookData = await loadBookData(index);

      this.loadedBooks.set(index, bookData);

      // Update the data structure
      if (this.data) {
        // Merge book data with existing metadata
        this.data.books[index] = {
          ...this.data.books[index],
          ...bookData
        };

        // Transform chapters from paragraphs_list structure to verses array
        if (bookData.chapters_list) {
          const transformedChapters = bookData.chapters_list.map((chapter: any) => {
            const verses: Verse[] = [];
            const headers: string[] = [];

            // Extract headers and verses from paragraphs_list
            if (chapter.paragraphs_list) {
              chapter.paragraphs_list.forEach((paragraph: any) => {
                // Handle section headers
                if (paragraph.type === 'section_header') {
                  headers.push(paragraph.text);
                }
                // Handle verse paragraphs
                else if (paragraph.type === 'section_paragraph' && paragraph.verses_list?.single_verses_list) {
                  paragraph.verses_list.single_verses_list.forEach((rawVerse: RawVerse) => {
                    const transformedVerse = this.transformVerse(rawVerse, index, chapter.chapter_num);
                    verses.push(transformedVerse);
                  });
                }
              });
            }

            return {
              chapter_num: chapter.chapter_num,
              verses_count: chapter.verses_count,
              verses,
              headers,
              paragraphs_list: chapter.paragraphs_list // Keep for backwards compatibility
            };
          });

          this.data.books[index].chapters = transformedChapters;
        }
        // Fallback: if chapters already exist, use them
        else if (bookData.chapters) {
          this.data.books[index].chapters = bookData.chapters;
        }

        // Merge global tables if present at root (for backwards compatibility)
        if (bookData.footnotes) {
          this.data.footnotes = { ...this.data.footnotes, ...bookData.footnotes };
        }
        if (bookData.liturgy_notes) {
          this.data.liturgy_notes = { ...this.data.liturgy_notes, ...bookData.liturgy_notes };
        }
        if (bookData.cross_refs) {
          this.data.cross_refs = { ...this.data.cross_refs, ...bookData.cross_refs };
        }
      }

      return this.data?.books[index];
    } catch (error) {
      console.error(`[BibleService] Error loading book ${index}:`, error);
      throw error;
    }
  }

  getBibleData(): BibleData | null {
    return this.data;
  }

  async getBook(index: number) {
    await this.loadBook(index);
    return this.data?.books[index];
  }

  async getChapter(bookIndex: number, chapterIndex: number) {
    await this.loadBook(bookIndex);
    return this.data?.books[bookIndex]?.chapters[chapterIndex];
  }

  getBookByName(name: string) {
    return this.data?.books.find(
      (book) =>
        book.en_name.toLowerCase() === name.toLowerCase() ||
        book.local_name.toLowerCase() === name.toLowerCase()
    );
  }

  async searchVerses(query: string) {
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

    // Load all books before searching
    console.log('[BibleService] Loading all books for search...');
    await Promise.all(
      this.metadata!.books.map(book => this.loadBook(book.index))
    );

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
