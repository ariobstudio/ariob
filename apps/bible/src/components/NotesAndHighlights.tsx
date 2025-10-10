import { useState } from '@lynx-js/react';
import { useBibleStore } from '../store/bible-store';
import { Button, Card, Column, Row, Icon } from '@ariob/ui';
import { useTheme } from '@ariob/ui';

type ViewTab = 'bookmarks' | 'highlights' | 'notes';

export function NotesAndHighlights() {
  const {
    bibleData,
    goBack,
    navigateToVerse,
    bookmarks,
    highlights,
    notes,
    removeBookmark,
    removeHighlight,
    removeNote
  } = useBibleStore();
  const { withTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<ViewTab>('bookmarks');

  if (!bibleData) return null;

  // Helper to get book/chapter name from indices
  const getBookName = (bookIndex: number) => bibleData.books[bookIndex]?.en_name || 'Unknown';
  const getChapterNum = (bookIndex: number, chapterIndex: number) =>
    bibleData.books[bookIndex]?.chapters[chapterIndex]?.chapter_num || chapterIndex + 1;

  const handleItemClick = (bookIndex: number, chapterIndex: number, verseNumber: number) => {
    navigateToVerse(bookIndex, chapterIndex, verseNumber);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Column width="full" height="full" className={withTheme('bg-background', 'dark bg-background')}>
      {/* Header */}
      <view className="px-4 py-3 border-b border-border bg-card">
        <Row align="center" spacing="md" width="full">
          <Button variant="ghost" size="icon" icon="chevron-left" onClick={goBack} />
          <Column spacing="xs" className="flex-1">
            <text className="text-xl font-bold text-foreground">My Library</text>
            <text className="text-xs text-muted-foreground">
              {activeTab === 'bookmarks' && `${bookmarks.length} bookmarks`}
              {activeTab === 'highlights' && `${highlights.length} highlights`}
              {activeTab === 'notes' && `${notes.length} notes`}
            </text>
          </Column>
        </Row>
      </view>

      {/* Tabs */}
      <view className="px-4 py-2 border-b border-border">
        <Row spacing="sm" width="full">
          <Button
            variant={activeTab === 'bookmarks' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('bookmarks')}
            className="flex-1"
            size="sm"
          >
            <text>Bookmarks</text>
          </Button>
          <Button
            variant={activeTab === 'highlights' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('highlights')}
            className="flex-1"
            size="sm"
          >
            <text>Highlights</text>
          </Button>
          <Button
            variant={activeTab === 'notes' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('notes')}
            className="flex-1"
            size="sm"
          >
            <text>Notes</text>
          </Button>
        </Row>
      </view>

      {/* Content */}
      <scroll-view scroll-y className="flex-1 w-full">
        {activeTab === 'bookmarks' && (
          <Column width="full" spacing="sm" className="p-4">
            {bookmarks.length > 0 ? (
              bookmarks
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((bookmark) => (
                  <Card key={bookmark.id} className="overflow-hidden">
                    <Row align="center" className="p-4">
                      <view
                        className="flex-1 cursor-pointer"
                        bindtap={() =>
                          handleItemClick(bookmark.bookIndex, bookmark.chapterIndex, bookmark.verseNumber)
                        }
                      >
                        <Column spacing="xs">
                          <text className="text-sm font-semibold text-foreground">
                            {getBookName(bookmark.bookIndex)}{' '}
                            {getChapterNum(bookmark.bookIndex, bookmark.chapterIndex)}:{bookmark.verseNumber}
                          </text>
                          <text className="text-xs text-muted-foreground">
                            {formatDate(bookmark.timestamp)}
                          </text>
                        </Column>
                      </view>
                      <Button
                        variant="ghost"
                        size="icon"
                        icon="trash"
                        onClick={() => removeBookmark(bookmark.id)}
                      />
                    </Row>
                  </Card>
                ))
            ) : (
              <Column align="center" justify="center" className="p-8">
                <Icon name="bookmark" className="text-muted-foreground mb-4 text-4xl" />
                <text className="text-muted-foreground text-center">
                  No bookmarks yet. Long-press a verse to add one.
                </text>
              </Column>
            )}
          </Column>
        )}

        {activeTab === 'highlights' && (
          <Column width="full" spacing="sm" className="p-4">
            {highlights.length > 0 ? (
              highlights
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((highlight) => (
                  <Card key={highlight.id} className="overflow-hidden">
                    <Row align="center" className="p-4">
                      <view
                        className="flex-1 cursor-pointer"
                        bindtap={() =>
                          handleItemClick(highlight.bookIndex, highlight.chapterIndex, highlight.verseNumber)
                        }
                      >
                        <Column spacing="xs">
                          <Row align="center" spacing="sm">
                            <view
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: highlight.color }}
                            />
                            <text className="text-sm font-semibold text-foreground">
                              {getBookName(highlight.bookIndex)}{' '}
                              {getChapterNum(highlight.bookIndex, highlight.chapterIndex)}:{highlight.verseNumber}
                            </text>
                          </Row>
                          <text className="text-xs text-muted-foreground">
                            {formatDate(highlight.timestamp)}
                          </text>
                        </Column>
                      </view>
                      <Button
                        variant="ghost"
                        size="icon"
                        icon="trash"
                        onClick={() => removeHighlight(highlight.id)}
                      />
                    </Row>
                  </Card>
                ))
            ) : (
              <Column align="center" justify="center" className="p-8">
                <Icon name="pen" className="text-muted-foreground mb-4 text-4xl" />
                <text className="text-muted-foreground text-center">
                  No highlights yet. Long-press a verse to add one.
                </text>
              </Column>
            )}
          </Column>
        )}

        {activeTab === 'notes' && (
          <Column width="full" spacing="sm" className="p-4">
            {notes.length > 0 ? (
              notes
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((note) => (
                  <Card key={note.id} className="overflow-hidden">
                    <Row align="start" className="p-4">
                      <view
                        className="flex-1 cursor-pointer"
                        bindtap={() => handleItemClick(note.bookIndex, note.chapterIndex, note.verseNumber)}
                      >
                        <Column spacing="sm">
                          <text className="text-sm font-semibold text-foreground">
                            {getBookName(note.bookIndex)}{' '}
                            {getChapterNum(note.bookIndex, note.chapterIndex)}:{note.verseNumber}
                          </text>
                          <text className="text-sm text-foreground leading-relaxed">{note.text}</text>
                          <text className="text-xs text-muted-foreground">{formatDate(note.timestamp)}</text>
                        </Column>
                      </view>
                      <Button variant="ghost" size="icon" icon="trash" onClick={() => removeNote(note.id)} />
                    </Row>
                  </Card>
                ))
            ) : (
              <Column align="center" justify="center" className="p-8">
                <Icon name="file-text" className="text-muted-foreground mb-4 text-4xl" />
                <text className="text-muted-foreground text-center">
                  No notes yet. Long-press a verse to add one.
                </text>
              </Column>
            )}
          </Column>
        )}
      </scroll-view>
    </Column>
  );
}
