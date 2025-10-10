import { useState } from '@lynx-js/react';
import { useBibleStore } from '../store/bible-store';
import { Button, Card, Column, Row, Icon } from '@ariob/ui';
import { useTheme } from '@ariob/ui';

export function BookInfo() {
  const { bibleData, goBack } = useBibleStore();
  const { withTheme } = useTheme();
  const [selectedBookIndex, setSelectedBookIndex] = useState<number | null>(null);
  const [expandedMetadata, setExpandedMetadata] = useState<number[]>([]);

  if (!bibleData) return null;

  // Get books that have metadata
  const booksWithMetadata = bibleData.books
    .map((book, index) => ({ book, index }))
    .filter(({ book }) => book.metadata && book.metadata.length > 0);

  const toggleMetadata = (index: number) => {
    setExpandedMetadata((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // If a book is selected, show its metadata
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
              <text className="text-xs text-muted-foreground">Book Information</text>
            </Column>
          </Row>
        </view>

        {/* Metadata */}
        <scroll-view scroll-y className="flex-1 w-full">
          <Column spacing="sm" className="p-4">
            {book.metadata?.map((info, index) => {
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
                              .map((part) => part.text.replace(/^[—-]\\s*/, ''))
                              .join('')
                              .trim()}
                          </text>
                        )}
                        {info.list && (
                          <Column spacing="xs" className="mt-2">
                            {info.list.map((item, itemIndex) => (
                              <text key={itemIndex} className="text-sm text-muted-foreground pl-4">
                                • {item.map((part) => part.text.replace(/^[—-]\\s*/, '')).join('').trim()}
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
      </Column>
    );
  }

  // Show list of books with metadata
  return (
    <Column width="full" height="full" className={withTheme('bg-background', 'dark bg-background')}>
      {/* Header */}
      <view className="px-4 py-3 border-b border-border bg-card">
        <Row align="center" spacing="md" width="full">
          <Button variant="ghost" size="icon" icon="chevron-left" onClick={goBack} />
          <Column spacing="xs" className="flex-1">
            <text className="text-xl font-bold text-foreground">Book Information</text>
            <text className="text-xs text-muted-foreground">
              {booksWithMetadata.length} {booksWithMetadata.length === 1 ? 'book' : 'books'} with introductions
            </text>
          </Column>
        </Row>
      </view>

      {/* Books List */}
      <scroll-view scroll-y className="flex-1 w-full">
        {booksWithMetadata.length > 0 ? (
          <Column spacing="sm" className="p-4">
            {booksWithMetadata.map(({ book, index }) => (
              <Card
                key={index}
                className="active:scale-95 transition-transform shadow-md"
                bindtap={() => setSelectedBookIndex(index)}
              >
                <Row align="center" justify="between" className="p-4">
                  <Column spacing="xs" className="flex-1">
                    <text className="text-base font-bold text-foreground">{book.en_name}</text>
                    <text className="text-xs text-muted-foreground">
                      {book.metadata?.length || 0} {book.metadata?.length === 1 ? 'section' : 'sections'}
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
              No book information available
            </text>
          </Column>
        )}
      </scroll-view>
    </Column>
  );
}
