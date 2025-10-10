import { useState } from '@lynx-js/react';
import { useBibleStore } from '../store/bible-store';
import { Button, Card, Column, Row, Icon } from '@ariob/ui';
import { useTheme } from '@ariob/ui';
import { VersePartRenderer } from './VersePartRenderer';

export function Lessons() {
  const { bibleData, goBack } = useBibleStore();
  const { withTheme } = useTheme();
  const [selectedBookIndex, setSelectedBookIndex] = useState<number | null>(null);
  const [expandedLessons, setExpandedLessons] = useState<number[]>([]);

  if (!bibleData) return null;

  // Get books that have lessons
  const booksWithLessons = bibleData.books
    .map((book, index) => ({ book, index }))
    .filter(({ book }) => book.lessons && book.lessons.length > 0);

  const toggleLesson = (index: number) => {
    setExpandedLessons((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // If a book is selected, show its lessons
  if (selectedBookIndex !== null) {
    const book = bibleData.books[selectedBookIndex];

    return (
      <Column width="full" height="full" className={withTheme('bg-background', 'dark bg-background')}>
        {/* Header */}
        <view className="px-4 py-3 border-b border-border bg-card">
          <Row align="center" spacing="md" width="full">
            <Button variant="ghost" size="icon" icon="chevron-left" onClick={() => setSelectedBookIndex(null)} />
            <Column spacing="xs" className="flex-1">
              <text className="text-xl font-bold text-foreground">{book.en_name}</text>
              <text className="text-xs text-muted-foreground">
                {book.lessons?.length || 0} {book.lessons?.length === 1 ? 'lesson' : 'lessons'}
              </text>
            </Column>
          </Row>
        </view>

        {/* Lessons */}
        <scroll-view scroll-y className="flex-1 w-full">
          <Column spacing="sm" className="p-4">
            {book.lessons?.map((lesson, lessonIndex) => {
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
                        {lesson.entries.map((entry, entryIndex) => (
                          <view key={entryIndex}>
                            <VersePartRenderer
                              parts={entry.parts}
                              className="text-sm text-muted-foreground leading-relaxed"
                            />
                          </view>
                        ))}
                      </Column>
                    </view>
                  )}
                </Card>
              );
            })}
          </Column>
        </scroll-view>
      </Column>
    );
  }

  // Show list of books with lessons
  return (
    <Column width="full" height="full" className={withTheme('bg-background', 'dark bg-background')}>
      {/* Header */}
      <view className="px-4 py-3 border-b border-border bg-card">
        <Row align="center" spacing="md" width="full">
          <Button variant="ghost" size="icon" icon="chevron-left" onClick={goBack} />
          <Column spacing="xs" className="flex-1">
            <text className="text-xl font-bold text-foreground">Study & Commentary</text>
            <text className="text-xs text-muted-foreground">
              {booksWithLessons.length} {booksWithLessons.length === 1 ? 'book' : 'books'} with lessons
            </text>
          </Column>
        </Row>
      </view>

      {/* Books List */}
      <scroll-view scroll-y className="flex-1 w-full">
        {booksWithLessons.length > 0 ? (
          <Column spacing="sm" className="p-4">
            {booksWithLessons.map(({ book, index }) => (
              <Card
                key={index}
                className="active:scale-95 transition-transform shadow-md"
                bindtap={() => setSelectedBookIndex(index)}
              >
                <Row align="center" justify="between" className="p-4">
                  <Column spacing="xs" className="flex-1">
                    <text className="text-base font-bold text-foreground">{book.en_name}</text>
                    <text className="text-xs text-muted-foreground">
                      {book.lessons?.length || 0} {book.lessons?.length === 1 ? 'lesson' : 'lessons'}
                    </text>
                  </Column>
                  <Icon name="chevron-right" className="text-muted-foreground" />
                </Row>
              </Card>
            ))}
          </Column>
        ) : (
          <Column align="center" justify="center" className="p-8">
            <text className="text-muted-foreground text-center">
              No lessons available
            </text>
          </Column>
        )}
      </scroll-view>
    </Column>
  );
}
