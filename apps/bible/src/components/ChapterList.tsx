import { useBibleStore } from '../store/bible-store';
import { Button, Card, Column, Row, Icon } from '@ariob/ui';
import { useTheme } from '@ariob/ui';

export function ChapterList() {
  const { bibleData, currentReference, navigateToChapter, goBack } = useBibleStore();
  const { withTheme } = useTheme();

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
        <view className="px-4 py-3 border-b border-border bg-muted/30">
          <Column spacing="md">
            {book.metadata.map((info, index) => {
              // Skip rendering if no content
              if (!info.content_parts && !info.list) return null;

              return (
                <view key={index}>
                  <text className="text-sm font-bold text-foreground mb-1">
                    {info.title}
                  </text>
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
                </view>
              );
            })}
          </Column>
        </view>
      )}

      {/* Lessons/Commentary (if available) */}
      {book.lessons && book.lessons.length > 0 && (
        <view className="px-4 py-3 border-b border-border bg-card">
          <Column spacing="lg">
            <text className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Study & Commentary
            </text>
            {book.lessons.map((lesson, lessonIndex) => (
              <Column key={lessonIndex} spacing="sm">
                <text className="text-base font-bold text-foreground">
                  {lesson.title}
                </text>
                {lesson.entries.map((entry, entryIndex) => (
                  <view key={entryIndex} className="flex flex-row flex-wrap gap-1">
                    {entry.parts.map((part, partIndex) => {
                      if (typeof part === 'string') {
                        return (
                          <text key={partIndex} className="text-sm text-muted-foreground leading-relaxed">
                            {part}
                          </text>
                        );
                      }
                      if ('italic' in part) {
                        return (
                          <text key={partIndex} className="text-sm text-muted-foreground leading-relaxed italic">
                            {part.italic}
                          </text>
                        );
                      }
                      if ('cross_ref' in part) {
                        return (
                          <text key={partIndex} className="text-sm text-primary underline">
                            {part.text}
                          </text>
                        );
                      }
                      return null;
                    })}
                  </view>
                ))}
              </Column>
            ))}
          </Column>
        </view>
      )}

      {/* Chapters Grid */}
      <scroll-view scroll-y className="flex-1 w-full">
        <view className="p-4 flex flex-row flex-wrap gap-2">
            {chapters.map((chapterNum) => {
              const chapterIndex = chapterNum - 1;
              const chapter = book.chapters[chapterIndex];

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
                    className="w-20 h-20 p-4"
                  >
                    <text className="text-2xl font-bold text-foreground">
                      {chapterNum}
                    </text>
                    <text className="text-[10px] text-muted-foreground">
                      {chapter?.verses_count || 0} verses
                    </text>
                  </Column>
                </Card>
              );
            })}
        </view>
      </scroll-view>
    </Column>
  );
}
