import { useState } from '@lynx-js/react';
import { useBibleStore } from '../store/bible-store';
import { Button, Column, Row } from '@ariob/ui';
import { useTheme } from '@ariob/ui';
import { VersePartRenderer } from './VersePartRenderer';
import { BottomSheet } from './BottomSheet';
import { CrossReferencePanel } from './CrossReferencePanel';
import type { CrossRefTarget } from '../types/bible';

export function VerseReader() {
  const { bibleData, currentReference, goBack, navigateToChapter, navigateToVerse } = useBibleStore();
  const { withTheme } = useTheme();

  // Sheet/Panel state
  const [footnoteSheet, setFootnoteSheet] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });
  const [liturgySheet, setLiturgySheet] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });
  const [crossRefPanel, setCrossRefPanel] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });

  if (!bibleData) return null;

  const book = bibleData.books[currentReference.bookIndex];
  const chapter = book?.chapters[currentReference.chapterIndex];

  if (!book || !chapter) return null;

  const hasNextChapter = currentReference.chapterIndex < book.ch_count - 1;
  const hasPrevChapter = currentReference.chapterIndex > 0;

  const goToNextChapter = async () => {
    if (hasNextChapter) {
      await navigateToChapter(currentReference.bookIndex, currentReference.chapterIndex + 1);
    }
  };

  const goToPrevChapter = async () => {
    if (hasPrevChapter) {
      await navigateToChapter(currentReference.bookIndex, currentReference.chapterIndex - 1);
    }
  };

  // Handler for footnote clicks
  const handleFootnoteClick = (footnoteId: string) => {
    setFootnoteSheet({ isOpen: true, id: footnoteId });
  };

  // Handler for liturgy clicks
  const handleLiturgyClick = (liturgyId: string) => {
    setLiturgySheet({ isOpen: true, id: liturgyId });
  };

  // Handler for cross-ref clicks
  const handleCrossRefClick = (crossRefId: string) => {
    setCrossRefPanel({ isOpen: true, id: crossRefId });
  };

  // Handler for navigating to cross-reference target
  const handleCrossRefNavigate = async (target: CrossRefTarget) => {
    // TODO: Implement proper book/chapter/verse resolution from target
    // For now, just close the panel
    console.log('[VerseReader] Navigate to cross-ref:', target);
  };

  // Render footnote content - show all footnotes for the current verse
  const renderFootnote = () => {
    if (!footnoteSheet.id || !bibleData.footnotes) {
      return <text className="text-muted-foreground">No footnotes available</text>;
    }

    // Get the current verse to show all its footnotes
    const verse = chapter?.verses.find(v =>
      v.footnotes && v.footnotes.includes(footnoteSheet.id!)
    );

    if (!verse || !verse.footnotes || verse.footnotes.length === 0) {
      return <text className="text-muted-foreground">No footnotes found for this verse</text>;
    }

    // Render all footnotes for this verse
    return (
      <Column spacing="lg">
        <view className="pb-2 border-b border-border">
          <text className="text-xs font-semibold text-muted-foreground">
            {book.en_name} {chapter.chapter_num}:{verse.num}
          </text>
        </view>

        {verse.footnotes.map((footnoteId, index) => {
          const footnote = bibleData.footnotes[footnoteId];
          if (!footnote) {
            return (
              <text key={footnoteId} className="text-xs text-muted-foreground">
                Footnote {footnoteId} not loaded
              </text>
            );
          }

          return (
            <Column key={footnoteId} spacing="sm">
              {verse.footnotes!.length > 1 && (
                <text className="text-xs font-bold text-primary">Note {index + 1}</text>
              )}
              {footnote.parts && footnote.parts.length > 0 ? (
                <VersePartRenderer
                  parts={footnote.parts}
                  onCrossRefClick={handleCrossRefClick}
                  className="text-sm text-foreground leading-relaxed"
                />
              ) : footnote.text ? (
                <text className="text-sm text-foreground leading-relaxed">{footnote.text}</text>
              ) : (
                <text className="text-xs text-muted-foreground italic">Empty footnote</text>
              )}
            </Column>
          );
        })}
      </Column>
    );
  };

  // Render liturgy content - show all liturgy notes for the current verse
  const renderLiturgy = () => {
    if (!liturgySheet.id || !bibleData.liturgy_notes) {
      return <text className="text-muted-foreground">No liturgy notes available</text>;
    }

    // Get the current verse to show all its liturgy notes
    const verse = chapter?.verses.find(v =>
      v.liturgy_notes && v.liturgy_notes.includes(liturgySheet.id!)
    );

    if (!verse || !verse.liturgy_notes || verse.liturgy_notes.length === 0) {
      return <text className="text-muted-foreground">No liturgy notes found for this verse</text>;
    }

    // Render all liturgy notes for this verse
    return (
      <Column spacing="lg">
        <view className="pb-2 border-b border-border">
          <text className="text-xs font-semibold text-muted-foreground">
            {book.en_name} {chapter.chapter_num}:{verse.num}
          </text>
        </view>

        {verse.liturgy_notes.map((liturgyId, index) => {
          const liturgy = bibleData.liturgy_notes[liturgyId];
          if (!liturgy) {
            return (
              <text key={liturgyId} className="text-xs text-muted-foreground">
                Liturgy note {liturgyId} not loaded
              </text>
            );
          }

          return (
            <Column key={liturgyId} spacing="sm">
              {verse.liturgy_notes!.length > 1 && (
                <text className="text-xs font-bold text-accent-foreground">Reading {index + 1}</text>
              )}
              {liturgy.parts && liturgy.parts.length > 0 ? (
                <VersePartRenderer
                  parts={liturgy.parts}
                  onCrossRefClick={handleCrossRefClick}
                  className="text-sm text-foreground leading-relaxed"
                />
              ) : liturgy.text ? (
                <text className="text-sm text-foreground leading-relaxed">{liturgy.text}</text>
              ) : (
                <text className="text-xs text-muted-foreground italic">Empty liturgy note</text>
              )}
            </Column>
          );
        })}
      </Column>
    );
  };

  return (
    <Column width="full" height="full" className={withTheme('bg-background', 'dark bg-background')}>
      {/* Header */}
      <view className="px-4 py-3 border-b border-border bg-card">
        <Row align="center" spacing="md" width="full">
          <Button variant="ghost" size="icon" icon="chevron-left" onClick={goBack} />
          <Column spacing="xs" className="flex-1">
            <text className="text-base font-bold text-foreground">
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
        <Column width="full" spacing="lg" className="p-4 pb-20">
          {/* Section headers */}
          {chapter.headers && chapter.headers.length > 0 && (
            <Column spacing="md" className="mb-4">
              {chapter.headers.map((header, index) => (
                <view key={`header-${index}`} className="mt-2 mb-2">
                  <text className="text-base font-bold text-foreground text-center uppercase tracking-wide">
                    {header}
                  </text>
                </view>
              ))}
            </Column>
          )}

          {/* Verses */}
          {chapter.verses.map((verse) => {
            const hasFootnotes = verse.footnotes && verse.footnotes.length > 0;
            const hasLiturgy = verse.liturgy_notes && verse.liturgy_notes.length > 0;

            return (
              <view
                key={verse.num}
                className="flex flex-row gap-3 py-2 px-2 -mx-2 rounded-lg active:bg-muted/30 transition-colors"
                bindtap={() => {
                  // Open footnotes if available
                  if (hasFootnotes) {
                    setFootnoteSheet({ isOpen: true, id: verse.footnotes![0] });
                  }
                }}
                bindtouchstart={(e: any) => {
                  // Track for swipe detection
                  const touch = e.touches[0];
                  (e.currentTarget as any)._startX = touch.clientX;
                  (e.currentTarget as any)._startY = touch.clientY;
                }}
                bindtouchend={(e: any) => {
                  // Detect swipe left for liturgy
                  const touch = e.changedTouches[0];
                  const startX = (e.currentTarget as any)._startX || touch.clientX;
                  const startY = (e.currentTarget as any)._startY || touch.clientY;
                  const deltaX = touch.clientX - startX;
                  const deltaY = Math.abs(touch.clientY - startY);

                  // Swipe left (deltaX < -50) and mostly horizontal (deltaY < 30)
                  if (deltaX < -50 && deltaY < 30 && hasLiturgy) {
                    setLiturgySheet({ isOpen: true, id: verse.liturgy_notes![0] });
                  }
                }}
              >
                {/* Verse number (gutter) */}
                <text className="text-sm font-bold text-primary/60 w-8 shrink-0 mt-0.5 text-right">
                  {verse.num}
                </text>

                {/* Verse content - render without click handlers on markers */}
                <view className="flex-1 flex flex-row items-start gap-2">
                  <view className="flex-1">
                    <VersePartRenderer
                      parts={verse.parts}
                      className="text-base text-foreground leading-relaxed"
                    />
                  </view>

                  {/* Visual indicators for notes */}
                  {(hasFootnotes || hasLiturgy) && (
                    <view className="flex flex-col gap-1.5 mt-0.5">
                      {hasFootnotes && (
                        <view className="w-2 h-2 rounded-full bg-primary border border-primary/40" />
                      )}
                      {hasLiturgy && (
                        <view className="w-2 h-2 rounded-full bg-accent border border-accent/40" />
                      )}
                    </view>
                  )}
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

      {/* Footnote Sheet */}
      <BottomSheet
        isOpen={footnoteSheet.isOpen}
        onClose={() => setFootnoteSheet({ isOpen: false, id: null })}
        title="Study Notes"
      >
        {renderFootnote()}
      </BottomSheet>

      {/* Liturgy Sheet */}
      <BottomSheet
        isOpen={liturgySheet.isOpen}
        onClose={() => setLiturgySheet({ isOpen: false, id: null })}
        title="Lectionary Reading"
      >
        {renderLiturgy()}
      </BottomSheet>

      {/* Cross-Reference Panel */}
      <CrossReferencePanel
        isOpen={crossRefPanel.isOpen}
        onClose={() => setCrossRefPanel({ isOpen: false, id: null })}
        crossRefId={crossRefPanel.id}
        crossRefs={bibleData.cross_refs || {}}
        onNavigate={handleCrossRefNavigate}
      />
    </Column>
  );
}
