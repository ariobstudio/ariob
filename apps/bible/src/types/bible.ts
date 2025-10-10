// Bible data types based on new simplified bible.json structure

// Simplified verse part types
export type VersePart =
  | string                                    // Plain text (90% of cases)
  | { italic: string }                        // Italic text
  | { oblique: string }                       // Oblique text (prophecies/quotes)
  | { divine_name: string }                   // LORD in Old Testament
  | { small_caps: string }                    // JESUS in New Testament
  | { line_break: true }                      // Line break
  | { text: string; cross_ref: string }       // Cross reference
  | { footnote: string }                      // Footnote marker
  | { liturgy: string };                      // Liturgy note marker

// Global reference tables
export interface CrossRefTarget {
  href?: string;
  book_file?: string;
  book_abbrev?: string;
  chapter?: number;  // Optional - some refs only have href
  verse?: number;    // Optional - some refs only have href
  verse_end?: number;
}

export interface Note {
  text: string;
  parts?: Array<string | { italic: string } | { text: string; cross_ref: string }>;
}

// Simplified verse structure
export interface Verse {
  num: number;
  text: string;                    // Plain text for search
  parts: VersePart[];
  footnotes?: string[] | null;     // Array of footnote IDs
  liturgy_notes?: string[] | null; // Array of liturgy note IDs
}

// Simplified chapter structure
export interface Chapter {
  chapter_num: number;
  verses_count: number;
  verses: Verse[];
  headers: string[];
  paragraphs_list?: any[];  // Backwards compatibility (optional)
}

// Metadata structure
export interface MetadataPart {
  style?: 'NONE' | 'ITALIC' | 'CROSS_REF';
  text: string;
  target?: CrossRefTarget;
}

export interface BookMetadata {
  title: string;
  content_parts?: MetadataPart[];
  list?: MetadataPart[][];
}

// Lesson structure
export interface LessonEntry {
  parts: Array<string | { italic: string } | { text: string; cross_ref: string }>;
}

export interface Lesson {
  title: string;
  entries: LessonEntry[];
}

// Book structure
export interface Book {
  en_name: string;
  local_name: string;
  ch_count: number;
  metadata: BookMetadata[];
  chapters: Chapter[];
  chapters_list?: any[];  // Backwards compatibility (optional)
  lessons?: Lesson[] | null;
}

// Top-level Bible data
export interface BibleData {
  version: string;
  lang: string;
  books: Book[];
  footnotes: Record<string, Note>;
  liturgy_notes: Record<string, Note>;
  cross_refs: Record<string, CrossRefTarget>;
}

// View types for app navigation
export type ViewMode = 'books' | 'chapters' | 'reader' | 'search';

export interface BibleReference {
  bookIndex: number;
  chapterIndex: number;
  verseNumber?: number;
}
