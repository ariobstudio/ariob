import { useEffect, useRef } from '@lynx-js/react';
import { useBibleStore } from '../store/bible-store';
import { Button, Column, Row } from '@ariob/ui';
import { useTheme } from '@ariob/ui';
import { VersePart } from './VersePart';

export function VerseReader() {
  const { bibleData, currentReference, goBack, navigateToChapter } = useBibleStore();
  const { withTheme } = useTheme();

  console.log('[VerseReader] Rendering');
  console.log('[VerseReader] bibleData exists:', !!bibleData);
  console.log('[VerseReader] currentReference:', currentReference);

  if (!bibleData) {
    console.log('[VerseReader] No bibleData');
    return null;
  }

  const book = bibleData.books[currentReference.bookIndex];
  console.log('[VerseReader] Book:', book?.en_name);

  const chapter = book?.chapters[currentReference.chapterIndex];
  console.log('[VerseReader] Chapter:', chapter?.chapter_num);
  console.log('[VerseReader] Chapter data:', chapter);
  console.log('[VerseReader] Verses count:', chapter?.verses?.length);
  console.log('[VerseReader] Headers:', chapter?.headers);

  if (!book || !chapter) {
    console.log('[VerseReader] Missing book or chapter');
    return null;
  }

  const hasNextChapter = currentReference.chapterIndex < book.ch_count - 1;
  const hasPrevChapter = currentReference.chapterIndex > 0;

  const goToNextChapter = () => {
    if (hasNextChapter) {
      navigateToChapter(currentReference.bookIndex, currentReference.chapterIndex + 1);
    }
  };

  const goToPrevChapter = () => {
    if (hasPrevChapter) {
      navigateToChapter(currentReference.bookIndex, currentReference.chapterIndex - 1);
    }
  };

  return (
    <Column width="full" height="full" className={withTheme('bg-background', 'dark bg-background')}>
      {/* Header */}
      <view className="px-4 py-3 border-b border-border bg-card">
        <Row align="center" spacing="md" width="full">
          <Button variant="ghost" size="icon" icon="chevron-left" onClick={goBack} />
          <Column spacing="xs" className="flex-1">
            <text className="text-lg font-bold text-foreground">
              {book.en_name} {chapter.chapter_num}
            </text>
            <text className="text-xs text-muted-foreground">
              {chapter.verses_count} verses
            </text>
          </Column>
          <Row spacing="sm">
            <Button
              variant="ghost"
              size="icon"
              icon="chevron-up"
              onClick={goToPrevChapter}
              disabled={!hasPrevChapter}
            />
            <Button
              variant="ghost"
              size="icon"
              icon="chevron-down"
              onClick={goToNextChapter}
              disabled={!hasNextChapter}
            />
          </Row>
        </Row>
      </view>

      {/* Verses */}
      <scroll-view scroll-y className="flex-1 w-full">
        <Column width="full" spacing="md" className="p-4 pb-20">
          {/* Section headers */}
          {chapter.headers && chapter.headers.length > 0 && (
            <Column spacing="md" className="mb-4">
              {chapter.headers.map((header, index) => (
                <view key={`header-${index}`} className="mt-2 mb-2">
                  <text className="text-base font-bold text-foreground text-center">
                    {header}
                  </text>
                </view>
              ))}
            </Column>
          )}

          {/* Verses */}
          {chapter.verses.map((verse) => {
            console.log('[VerseReader] Rendering verse', verse.num, verse);
            return (
              <view key={verse.num} className="flex flex-row gap-2">
                {/* Verse number */}
                <text className="text-sm font-bold text-primary w-8 shrink-0 mt-0.5">
                  {verse.num}
                </text>

                {/* Verse content */}
                <view className="flex-1 flex flex-row flex-wrap gap-1">
                  {verse.parts.map((part, partIndex) => {
                    if (typeof part === 'string') {
                      return <text key={partIndex} className="text-sm text-foreground">{part}</text>;
                    }

                    if ('italic' in part) {
                      return <text key={partIndex} className="text-sm text-foreground italic">{part.italic}</text>;
                    }

                    if ('cross_ref' in part) {
                      return (
                        <text key={partIndex} className="text-sm text-primary underline">
                          {part.text}
                        </text>
                      );
                    }

                    if ('footnote' in part) {
                      return (
                        <text key={partIndex} className="text-xs text-primary align-super">
                          [{part.footnote}]
                        </text>
                      );
                    }

                    if ('liturgy' in part) {
                      return (
                        <text key={partIndex} className="text-xs text-accent align-super">
                          [{part.liturgy}]
                        </text>
                      );
                    }

                    return null;
                  })}
                </view>
              </view>
            );
          })}

          {/* Navigation buttons at bottom */}
          <Row justify="between" width="full" className="mt-8 pt-4 border-t border-border">
            {hasPrevChapter ? (
              <Button variant="outline" onClick={goToPrevChapter}>
                <Row align="center" spacing="sm">
                  <text>← Previous</text>
                </Row>
              </Button>
            ) : (
              <view />
            )}

            {hasNextChapter ? (
              <Button variant="outline" onClick={goToNextChapter}>
                <Row align="center" spacing="sm">
                  <text>Next →</text>
                </Row>
              </Button>
            ) : (
              <view />
            )}
          </Row>
        </Column>
      </scroll-view>
    </Column>
  );
}
