import { Column, Row, Card, Button } from '@ariob/ui';
import { useTheme } from '@ariob/ui';
import { useBibleStore } from '../store/bible-store';

/**
 * Home - Landing screen with quick actions
 */
export function Home() {
  const {
    bibleData,
    lastLocation,
    bookmarks,
    notes,
    highlights,
    setViewMode,
    navigateToChapter,
    navigateToVerse
  } = useBibleStore();
  const { withTheme } = useTheme();

  const handleContinueReading = async () => {
    if (!lastLocation) {
      setViewMode('books');
      return;
    }

    if (lastLocation.verseNumber !== undefined) {
      await navigateToVerse(
        lastLocation.bookIndex,
        lastLocation.chapterIndex,
        lastLocation.verseNumber
      );
    } else {
      await navigateToChapter(
        lastLocation.bookIndex,
        lastLocation.chapterIndex
      );
    }
  };

  const getLocationText = () => {
    if (!lastLocation || !bibleData) return 'Start Reading';

    const book = bibleData.books[lastLocation.bookIndex];
    const chapter = book?.chapters[lastLocation.chapterIndex];

    if (!book || !chapter) return 'Start Reading';

    if (lastLocation.verseNumber) {
      return `${book.en_name} ${chapter.chapter_num}:${lastLocation.verseNumber}`;
    }
    return `${book.en_name} ${chapter.chapter_num}`;
  };

  return (
    <Column width="full" height="full" className={withTheme('bg-background', 'dark bg-background')}>
      {/* Header */}
      <view className="px-4 py-6 border-b border-border">
        <Row align="center" justify="between">
          <Column spacing="xs">
            <text className="text-2xl font-bold text-foreground">
              {bibleData?.version || 'Bible'}
            </text>
            <text className="text-sm text-muted-foreground">
              Orthodox Study Bible
            </text>
          </Column>
          <Button
            variant="ghost"
            size="icon"
            icon="settings"
            onClick={() => setViewMode('settings')}
          />
        </Row>
      </view>

      {/* Content */}
      <scroll-view scroll-y className="flex-1 w-full">
        <Column width="full" spacing="lg" className="p-4">
          {/* Continue Reading */}
          <Card
            className="active:scale-[0.98] transition-transform bg-primary/5 border-primary/20"
            bindtap={handleContinueReading}
          >
            <Column spacing="sm" className="p-6">
              <Row align="center" spacing="sm">
                <text className="text-4xl">📖</text>
                <Column spacing="xs" className="flex-1">
                  <text className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Continue Reading
                  </text>
                  <text className="text-lg font-bold text-foreground">
                    {getLocationText()}
                  </text>
                </Column>
              </Row>
            </Column>
          </Card>

          {/* Quick Actions */}
          <Column spacing="sm">
            <text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
              Quick Actions
            </text>

            <Row spacing="sm" width="full">
              <Card
                className="flex-1 active:scale-95 transition-transform"
                bindtap={() => setViewMode('books')}
              >
                <Column align="center" spacing="sm" className="p-4">
                  <text className="text-3xl">📚</text>
                  <text className="text-sm font-medium text-foreground">Browse</text>
                </Column>
              </Card>

              <Card
                className="flex-1 active:scale-95 transition-transform"
                bindtap={() => setViewMode('search')}
              >
                <Column align="center" spacing="sm" className="p-4">
                  <text className="text-3xl">🔍</text>
                  <text className="text-sm font-medium text-foreground">Search</text>
                </Column>
              </Card>
            </Row>

            <Row spacing="sm" width="full">
              <Card
                className="flex-1 active:scale-95 transition-transform"
                bindtap={() => setViewMode('notes')}
              >
                <Column align="center" spacing="sm" className="p-4">
                  <text className="text-3xl">📝</text>
                  <Column align="center" spacing="xs">
                    <text className="text-sm font-medium text-foreground">Notes</text>
                    {(notes.length > 0 || highlights.length > 0 || bookmarks.length > 0) && (
                      <text className="text-xs text-muted-foreground">
                        {notes.length + highlights.length + bookmarks.length}
                      </text>
                    )}
                  </Column>
                </Column>
              </Card>

              <Card
                className="flex-1 active:scale-95 transition-transform"
                bindtap={() => {
                  // TODO: Navigate to lessons for current/selected book
                  setViewMode('books');
                }}
              >
                <Column align="center" spacing="sm" className="p-4">
                  <text className="text-3xl">🎓</text>
                  <text className="text-sm font-medium text-foreground">Lessons</text>
                </Column>
              </Card>
            </Row>
          </Column>

          {/* Recent Activity */}
          {(bookmarks.length > 0 || notes.length > 0) && (
            <Column spacing="sm">
              <text className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
                Recent Activity
              </text>

              {bookmarks.slice(0, 3).map((bookmark) => {
                if (!bibleData) return null;
                const book = bibleData.books[bookmark.bookIndex];
                const chapter = book?.chapters[bookmark.chapterIndex];

                return (
                  <Card
                    key={bookmark.id}
                    className="active:scale-95 transition-transform"
                    bindtap={() => navigateToVerse(
                      bookmark.bookIndex,
                      bookmark.chapterIndex,
                      bookmark.verseNumber
                    )}
                  >
                    <Row align="center" spacing="md" className="p-4">
                      <text className="text-2xl">🔖</text>
                      <Column spacing="xs" className="flex-1">
                        <text className="text-sm font-medium text-foreground">
                          {book?.en_name} {chapter?.chapter_num}:{bookmark.verseNumber}
                        </text>
                        <text className="text-xs text-muted-foreground">
                          Bookmark
                        </text>
                      </Column>
                    </Row>
                  </Card>
                );
              })}

              {notes.slice(0, 3).map((note) => {
                if (!bibleData) return null;
                const book = bibleData.books[note.bookIndex];
                const chapter = book?.chapters[note.chapterIndex];

                return (
                  <Card
                    key={note.id}
                    className="active:scale-95 transition-transform"
                    bindtap={() => navigateToVerse(
                      note.bookIndex,
                      note.chapterIndex,
                      note.verseNumber
                    )}
                  >
                    <Row align="center" spacing="md" className="p-4">
                      <text className="text-2xl">📝</text>
                      <Column spacing="xs" className="flex-1">
                        <text className="text-sm font-medium text-foreground">
                          {book?.en_name} {chapter?.chapter_num}:{note.verseNumber}
                        </text>
                        <text className="text-xs text-muted-foreground line-clamp-1">
                          {note.text}
                        </text>
                      </Column>
                    </Row>
                  </Card>
                );
              })}
            </Column>
          )}
        </Column>
      </scroll-view>
    </Column>
  );
}
