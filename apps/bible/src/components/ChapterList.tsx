import { useState } from '@lynx-js/react';
import { useBibleStore } from '../store/bible-store';
import { Button, Card, Column, Row, Icon } from '@ariob/ui';
import { useTheme } from '@ariob/ui';

export function ChapterList() {
  const { bibleData, currentReference, navigateToChapter, goBack } = useBibleStore();
  const { withTheme } = useTheme();
  const [expandedMetadata, setExpandedMetadata] = useState<number[]>([]);
  const [expandedLessons, setExpandedLessons] = useState<number[]>([]);

  const toggleMetadata = (index: number) => {
    setExpandedMetadata((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const toggleLesson = (index: number) => {
    setExpandedLessons((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  if (!bibleData) return null;

  const book = bibleData.books[currentReference.bookIndex];

  if (!book) return null;

  // Create array of chapter numbers
  const chapters = Array.from({ length: book.ch_count }, (_, i) => i + 1);

  return (
    <Column width="full" height="full" className={withTheme('bg-background', 'dark bg-background')}>
      {/* Header */}
      <view className="px-4 py-3 border-b border-border">
        <Row align="center" spacing="md" width="full">
          <Button variant="ghost" size="icon" icon="chevron-left" onClick={goBack} />
          <Column spacing="xs" className="flex-1">
            <text className="text-xl font-bold text-foreground">{book.en_name}</text>
            <text className="text-xs text-muted-foreground">
              Select a chapter to read
            </text>
          </Column>
        </Row>
      </view>

      {/* Book Info (if available) */}
      {book.metadata && book.metadata.length > 0 && (
        <scroll-view scroll-y className="max-h-80 border-b border-border">
          <Column spacing="sm" className="p-4">
            {book.metadata.map((info, index) => {
              // Skip rendering if no content
              if (!info.content_parts && !info.list) return null;
              const isExpanded = expandedMetadata.includes(index);

              return (
                <Card key={index} className="overflow-hidden">
                  <view
                    className="cursor-pointer active:bg-muted/50 transition-colors"
                    bindtap={() => toggleMetadata(index)}
                  >
                    <Row align="center" justify="between" className="p-4">
                      <text className="text-sm font-bold text-foreground flex-1">
                        {info.title}
                      </text>
                      <Icon
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        className="text-muted-foreground"
                      />
                    </Row>
                  </view>
                  {isExpanded && (
                    <view className="px-4 pb-4 border-t border-border/50">
                      <Column spacing="sm" className="pt-3">
                        {info.content_parts && (
                          <text className="text-sm text-muted-foreground leading-relaxed">
                            {info.content_parts
                              .map((part) => part.text.replace(/^[—-]\s*/, ''))
                              .join('')
                              .trim()}
                          </text>
                        )}
                        {info.list && (
                          <Column spacing="xs" className="mt-2">
                            {info.list.map((item, itemIndex) => (
                              <text key={itemIndex} className="text-sm text-muted-foreground pl-4">
                                • {item.map((part) => part.text.replace(/^[—-]\s*/, '')).join('').trim()}
                              </text>
                            ))}
                          </Column>
                        )}
                      </Column>
                    </view>
                  )}
                </Card>
              );
            })}
          </Column>
        </scroll-view>
      )}

      {/* Lessons/Commentary (if available) */}
      {book.lessons && book.lessons.length > 0 && (
        <scroll-view scroll-y className="max-h-96 border-b border-border">
          <Column spacing="sm" className="p-4">
            <text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 mb-1">
              Study & Commentary
            </text>
            {book.lessons.map((lesson, lessonIndex) => {
              const isExpanded = expandedLessons.includes(lessonIndex);

              return (
                <Card key={lessonIndex} className="overflow-hidden">
                  <view
                    className="cursor-pointer active:bg-muted/50 transition-colors"
                    bindtap={() => toggleLesson(lessonIndex)}
                  >
                    <Row align="center" justify="between" className="p-4">
                      <text className="text-sm font-bold text-foreground flex-1">
                        {lesson.title}
                      </text>
                      <Icon
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        className="text-muted-foreground"
                      />
                    </Row>
                  </view>
                  {isExpanded && (
                    <view className="px-4 pb-4 border-t border-border/50">
                      <Column spacing="md" className="pt-3">
                        {lesson.entries.map((entry, entryIndex) => {
                          // Group consecutive string parts to avoid single-letter splits
                          const groupedParts: Array<{ type: 'text' | 'italic' | 'cross_ref', content: string }> = [];
                          let textBuffer = '';

                          entry.parts.forEach((part, idx) => {
                            if (typeof part === 'string') {
                              textBuffer += part;
                            } else {
                              // Flush text buffer if we have one
                              if (textBuffer) {
                                groupedParts.push({ type: 'text', content: textBuffer });
                                textBuffer = '';
                              }

                              if ('italic' in part) {
                                groupedParts.push({ type: 'italic', content: part.italic });
                              } else if ('cross_ref' in part) {
                                groupedParts.push({ type: 'cross_ref', content: part.text });
                              }
                            }

                            // Flush remaining text at the end
                            if (idx === entry.parts.length - 1 && textBuffer) {
                              groupedParts.push({ type: 'text', content: textBuffer });
                            }
                          });

                          return (
                            <view key={entryIndex} className="flex flex-row flex-wrap gap-1">
                              {groupedParts.map((part, partIndex) => {
                                if (part.type === 'text') {
                                  return (
                                    <text key={partIndex} className="text-sm text-muted-foreground leading-relaxed">
                                      {part.content}
                                    </text>
                                  );
                                }
                                if (part.type === 'italic') {
                                  return (
                                    <text key={partIndex} className="text-sm text-muted-foreground leading-relaxed italic">
                                      {part.content}
                                    </text>
                                  );
                                }
                                if (part.type === 'cross_ref') {
                                  return (
                                    <text key={partIndex} className="text-sm text-primary underline">
                                      {part.content}
                                    </text>
                                  );
                                }
                                return null;
                              })}
                            </view>
                          );
                        })}
                      </Column>
                    </view>
                  )}
                </Card>
              );
            })}
          </Column>
        </scroll-view>
      )}

      {/* Chapters Grid */}
      <scroll-view scroll-y className="flex-1 w-full">
        <view className="p-4 flex flex-row flex-wrap justify-center gap-3">
            {chapters.map((chapterNum) => {
              const chapterIndex = chapterNum - 1;
              const chapter = book.chapters[chapterIndex];
              const verseCount = chapter?.verses_count || chapter?.verses?.length || 0;

              return (
                <Card
                  key={chapterNum}
                  className="active:scale-95 transition-transform shadow-md"
                  bindtap={() => navigateToChapter(currentReference.bookIndex, chapterIndex)}
                >
                  <Column
                    align="center"
                    justify="center"
                    spacing="xs"
                    className="w-16 h-16 p-2"
                  >
                    <text className="text-xl font-bold text-foreground">
                      {chapterNum}
                    </text>
                    {verseCount > 0 && (
                      <text className="text-xs text-muted-foreground text-center">
                        {verseCount}
                      </text>
                    )}
                  </Column>
                </Card>
              );
            })}
        </view>
      </scroll-view>
    </Column>
  );
}
