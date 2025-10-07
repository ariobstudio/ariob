import { useBibleStore } from '../store/bible-store';
import { Button, Card, Column, Row, Icon } from '@ariob/ui';
import { useTheme } from '@ariob/ui';

export function BookList() {
  const { bibleData, navigateToBook, setViewMode } = useBibleStore();
  const { withTheme } = useTheme();

  console.log('[BookList] Component rendered');
  console.log('[BookList] bibleData exists:', !!bibleData);

  if (!bibleData) {
    console.log('[BookList] No bible data, showing loading state');
    return (
      <Column width="full" height="full" align="center" justify="center">
        <text className="text-muted-foreground">Loading Bible...</text>
      </Column>
    );
  }

  // Group books by testament (Old Testament: first 39 books, New Testament: rest)
  const oldTestament = bibleData.books.slice(0, 39);
  const newTestament = bibleData.books.slice(39);

  console.log('[BookList] Total books:', bibleData.books.length);
  console.log('[BookList] Old Testament books:', oldTestament.length);
  console.log('[BookList] New Testament books:', newTestament.length);
  console.log('[BookList] First OT book:', oldTestament[0]?.en_name);
  console.log('[BookList] Last OT book:', oldTestament[oldTestament.length - 1]?.en_name);
  console.log('[BookList] Full OT books:', oldTestament.map(b => b.en_name));

  return (
    <Column width="full" height="full" className={withTheme('bg-background', 'dark bg-background')}>
      {/* Header */}
      <view className="px-4 py-3 border-b border-border">
        <Row align="center" justify="between" width="full">
          <text className="text-xl font-bold text-foreground">
            {bibleData.version} Bible
          </text>
          <Button
            variant="ghost"
            size="icon"
            icon="search"
            onClick={() => setViewMode('search')}
          />
        </Row>
      </view>

      {/* Books List */}
      <scroll-view scroll-y className="flex-1 w-full">
        <Column width="full" spacing="lg" className="p-4">
          {/* Old Testament */}
          <Column spacing="sm">
            <text className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-2">
              Old Testament
            </text>
            <Column spacing="xs" width="full">
              {oldTestament.map((book, index) => {
                console.log('[BookList] Rendering OT book:', book.en_name, 'at index:', index);
                return (
                  <Card
                    key={book.en_name}
                    className="active:scale-95 transition-transform shadow-md"
                    bindtap={() => {
                      console.log('[BookList] Old Testament book clicked');
                      console.log('[BookList] Book name:', book.en_name);
                      console.log('[BookList] Index in oldTestament array:', index);
                      console.log('[BookList] Passing to navigateToBook:', index);
                      navigateToBook(index);
                    }}
                  >
                    <Row align="center" justify="between" spacing="md" className="p-4">
                      <Column spacing="xs" className="flex-1">
                        <text className="text-base font-semibold text-foreground">
                          {book.en_name}
                        </text>
                        <text className="text-xs text-muted-foreground">
                          {book.ch_count} {book.ch_count === 1 ? 'chapter' : 'chapters'}
                        </text>
                      </Column>
                      <Icon name="chevron-right" className="text-muted-foreground" />
                    </Row>
                  </Card>
                );
              })}
            </Column>
          </Column>

          {/* New Testament */}
          <Column spacing="sm">
            <text className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-2">
              New Testament
            </text>
            <Column spacing="xs" width="full">
              {newTestament.map((book, index) => (
                <Card
                  key={book.en_name}
                  className="active:scale-95 transition-transform shadow-md"
                  bindtap={() => {
                    console.log('[BookList] New Testament book clicked');
                    console.log('[BookList] Book name:', book.en_name);
                    console.log('[BookList] Index in newTestament array:', index);
                    console.log('[BookList] Passing to navigateToBook:', 39 + index);
                    navigateToBook(39 + index);
                  }}
                >
                  <Row align="center" justify="between" spacing="md" className="p-4">
                    <Column spacing="xs" className="flex-1">
                      <text className="text-base font-semibold text-foreground">
                        {book.en_name}
                      </text>
                      <text className="text-xs text-muted-foreground">
                        {book.ch_count} {book.ch_count === 1 ? 'chapter' : 'chapters'}
                      </text>
                    </Column>
                    <Icon name="chevron-right" className="text-muted-foreground" />
                  </Row>
                </Card>
              ))}
            </Column>
          </Column>
        </Column>
      </scroll-view>
    </Column>
  );
}
