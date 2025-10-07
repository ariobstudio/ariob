import { useState } from '@lynx-js/react';
import type { VersePart as VersePartType } from '../types/bible';
import { useBibleStore } from '../store/bible-store';
import { Card, Column } from '@ariob/ui';

interface VersePartProps {
  part: VersePartType;
}

export function VersePart({ part }: VersePartProps) {
  const [showNote, setShowNote] = useState(false);
  const { navigateToVerse, bibleData } = useBibleStore();

  // Plain text (most common case)
  if (typeof part === 'string') {
    return (
      <text className="text-sm text-foreground leading-relaxed">{part}</text>
    );
  }

  // Italic text
  if ('italic' in part) {
    return (
      <text className="text-sm text-foreground leading-relaxed italic">
        {part.italic}
      </text>
    );
  }

  // Cross reference
  if ('cross_ref' in part) {
    const handleCrossRefClick = () => {
      if (!bibleData) return;

      // Look up the cross-ref target from global table
      const target = bibleData.cross_refs[part.cross_ref];
      if (!target || !target.chapter || !target.verse) return;

      // Find book by name, abbreviation, or book_file
      let bookIndex = -1;

      // Try exact match with book_file
      if (target.book_file) {
        bookIndex = bibleData.books.findIndex(
          (book) => book.en_name.toLowerCase() === target.book_file?.toLowerCase()
        );
      }

      // Try exact match with book_abbrev
      if (bookIndex === -1 && target.book_abbrev) {
        bookIndex = bibleData.books.findIndex(
          (book) =>
            book.en_name.toLowerCase() === target.book_abbrev?.toLowerCase() ||
            book.local_name.toLowerCase() === target.book_abbrev?.toLowerCase()
        );
      }

      // Try partial match (book name starts with book_file)
      if (bookIndex === -1 && target.book_file) {
        bookIndex = bibleData.books.findIndex(
          (book) => book.en_name.toLowerCase().startsWith(target.book_file?.toLowerCase() || '')
        );
      }

      if (bookIndex !== -1) {
        navigateToVerse(bookIndex, target.chapter - 1, target.verse);
      }
    };

    return (
      <text
        className="text-sm text-primary underline cursor-pointer"
        bindtap={handleCrossRefClick}
      >
        {part.text}
      </text>
    );
  }

  // Footnote
  if ('footnote' in part) {
    const noteContent = bibleData?.footnotes[part.footnote];

    return (
      <view className="inline">
        <text
          className="text-xs text-primary cursor-pointer font-semibold align-super ml-0.5"
          bindtap={() => setShowNote(!showNote)}
        >
          [{part.footnote}]
        </text>
        {showNote && noteContent && (
          <Card className="mt-2 mb-2 shadow-md">
            <Column spacing="xs" className="p-3">
              <text className="text-xs font-semibold text-muted-foreground uppercase">
                Study Note
              </text>
              <view className="flex flex-row flex-wrap gap-1">
                {noteContent.parts ? (
                  noteContent.parts.map((notePart, index) => (
                    <VersePart key={index} part={notePart} />
                  ))
                ) : (
                  <text className="text-sm text-foreground leading-relaxed">
                    {noteContent.text}
                  </text>
                )}
              </view>
            </Column>
          </Card>
        )}
      </view>
    );
  }

  // Liturgy note
  if ('liturgy' in part) {
    const noteContent = bibleData?.liturgy_notes[part.liturgy];

    return (
      <view className="inline">
        <text
          className="text-xs text-accent cursor-pointer font-semibold align-super ml-0.5"
          bindtap={() => setShowNote(!showNote)}
        >
          [{part.liturgy}]
        </text>
        {showNote && noteContent && (
          <Card className="mt-2 mb-2 shadow-md">
            <Column spacing="xs" className="p-3">
              <text className="text-xs font-semibold text-muted-foreground uppercase">
                Liturgical Note
              </text>
              <view className="flex flex-row flex-wrap gap-1">
                {noteContent.parts ? (
                  noteContent.parts.map((notePart, index) => (
                    <VersePart key={index} part={notePart} />
                  ))
                ) : (
                  <text className="text-sm text-foreground leading-relaxed">
                    {noteContent.text}
                  </text>
                )}
              </view>
            </Column>
          </Card>
        )}
      </view>
    );
  }

  return null;
}
