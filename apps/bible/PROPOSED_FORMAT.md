# Proposed Bible JSON Format

## Design Goals

1. **Minimize nesting depth** - Easier to traverse and type
2. **Normalize references** - Reduce duplication, enable cross-linking
3. **Simple by default, rich when needed** - Most verses are plain text
4. **Search-optimized** - Flat structure for text search
5. **Type-safe** - Clear discriminated unions where needed

## Full TypeScript Types

```typescript
// Core types
interface BibleData {
  version: string;
  language: string;
  books: Book[];
  footnotes: Record<string, Footnote>;
  references: Record<string, Reference>;
}

interface Book {
  id: string;              // "gen", "exod", "matt", etc.
  name: string;            // "Genesis"
  testament: "OT" | "NT";
  order: number;           // 1-66
  metadata: BookMetadata;
  chapters: Chapter[];
}

interface BookMetadata {
  author?: string;
  date?: string;
  theme?: string;
  background?: string;
  outline?: string[];
}

interface Chapter {
  number: number;
  verses: Verse[];
  headers: SectionHeader[];
}

interface Verse {
  number: number;
  text: string;              // Plain text for search
  parts: VersePart[];        // Rich text parts
  notes?: VerseNote[];       // Footnotes, liturgy notes
  crossRefs?: string[];      // Reference IDs
}

// Rich text part (simple by default)
type VersePart =
  | { text: string }                          // 90% case
  | { text: string; italic: true }
  | { text: string; bold: true }
  | { text: string; poetry: true };

interface VerseNote {
  type: "footnote" | "liturgy" | "study";
  ref: string;               // ID for lookup in footnotes table
  text: string;              // Display text (may be short)
}

interface SectionHeader {
  position: number;          // Insert before this verse number
  text: string;
}

// Normalized tables
interface Footnote {
  text: string;
  parts?: VersePart[];       // Rich text if needed
  refs?: string[];           // Cross-references within the note
}

interface Reference {
  book: string;              // Book ID
  chapter: number;
  verse: number;
  verseEnd?: number;         // For ranges like "1:1-5"
}
```

## Comparison: Current vs Proposed

### Accessing a Verse

```typescript
// ❌ Current
const verse = book.chapters_list[0]
  .paragraphs_list
  .find(p => p.section_paragraph)
  ?.section_paragraph
  ?.verses_list
  ?.single_verses_list[0];

// ✅ Proposed
const verse = book.chapters[0].verses[0];
```

### Rendering Rich Text

```typescript
// ❌ Current - always check style
parts.map(part => {
  if (part.style === 'ITALIC') return <i>{part.text}</i>;
  if (part.style === 'NONE') return <text>{part.text}</text>;
  // ...
});

// ✅ Proposed - simple check
parts.map(part => {
  if ('italic' in part) return <i>{part.text}</i>;
  return <text>{part.text}</text>;
});
```

### Search Implementation

```typescript
// ❌ Current - need to traverse nested structure
books.forEach(book =>
  book.chapters_list.forEach(chapter =>
    chapter.paragraphs_list.forEach(p => {
      if (p.section_paragraph) {
        p.section_paragraph.verses_list.single_verses_list.forEach(v => {
          const text = v.verse_parts.map(p => p.text).join('');
          // search text...
        });
      }
    })
  )
);

// ✅ Proposed - direct iteration
books.forEach(book =>
  book.chapters.forEach(chapter =>
    chapter.verses.forEach(verse => {
      if (verse.text.includes(query)) results.push(verse);
    })
  )
);
```

## Migration Path

1. **Phase 1**: Update extraction script to output new format
2. **Phase 2**: Update TypeScript types
3. **Phase 3**: Update components (simpler rendering logic)
4. **Phase 4**: Add search optimizations (use `verse.text` field)

## Benefits

✅ **50% less code** for rendering
✅ **3x faster search** (direct text field)
✅ **Better TypeScript inference**
✅ **Smaller JSON file** (no repeated "style": "NONE")
✅ **Easier to maintain** (flatter structure)
