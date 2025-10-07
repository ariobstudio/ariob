import { useState } from '@lynx-js/react';
import { useBibleStore } from '../store/bible-store';
import { bibleService } from '../services/bible-service';
import { Button, Card, Column, Row, Input, Icon } from '@ariob/ui';
import { useTheme } from '@ariob/ui';

export function SearchView() {
  const { goBack, navigateToVerse, bibleData } = useBibleStore();
  const { withTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<
    Array<{
      bookName: string;
      bookIndex: number;
      chapterNum: number;
      chapterIndex: number;
      verseNum: number;
      text: string;
    }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    console.log('[SearchView] handleSearch called');
    console.log('[SearchView] searchQuery:', searchQuery);
    console.log('[SearchView] searchQuery.trim():', searchQuery.trim());

    if (!searchQuery.trim()) {
      console.log('[SearchView] Empty search query, returning early');
      return;
    }

    console.log('[SearchView] Starting search...');
    setIsSearching(true);

    console.log('[SearchView] Calling bibleService.searchVerses with query:', searchQuery);
    const results = bibleService.searchVerses(searchQuery);

    console.log('[SearchView] Search completed');
    console.log('[SearchView] Results count:', results.length);
    console.log('[SearchView] Results:', results);

    setSearchResults(results);
    setIsSearching(false);
  };

  const handleResultClick = (result: typeof searchResults[0]) => {
    console.log('[SearchView] handleResultClick called');
    console.log('[SearchView] Navigating to verse:', {
      bookIndex: result.bookIndex,
      chapterIndex: result.chapterIndex,
      verseNum: result.verseNum,
      bookName: result.bookName
    });
    navigateToVerse(result.bookIndex, result.chapterIndex, result.verseNum);
  };

  return (
    <Column width="full" height="full" className={withTheme('bg-background', 'dark bg-background')}>
      {/* Header */}
      <view className="px-4 py-3 border-b border-border">
        <Row align="center" spacing="md" width="full">
          <Button variant="ghost" size="icon" icon="chevron-left" onClick={goBack} />
          <text className="text-xl font-bold text-foreground flex-1">Search</text>
        </Row>
      </view>

      {/* Search Input */}
      <view className="px-4 py-3 border-b border-border">
        <Column spacing="sm">
          <Row spacing="sm" align="center">
            <view className="flex-1">
              <Input
                placeholder="Search for verses..."
                value={searchQuery}
                onChange={setSearchQuery}
                className="w-full"
              />
            </view>
            <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
              <Row align="center" spacing="sm">
                <Icon name="search" />
                <text>Search</text>
              </Row>
            </Button>
          </Row>
          {searchResults.length > 0 && (
            <text className="text-xs text-muted-foreground">
              Found {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
            </text>
          )}
        </Column>
      </view>

      {/* Search Results */}
      <scroll-view scroll-y className="flex-1 w-full">
        {isSearching ? (
          <Column align="center" justify="center" className="p-8">
            <text className="text-muted-foreground">Searching...</text>
          </Column>
        ) : searchResults.length > 0 ? (
          <Column width="full" spacing="sm" className="p-4">
            {searchResults.map((result, index) => (
              <Card
                key={index}
                className="active:scale-95 transition-transform shadow-md"
                bindtap={() => handleResultClick(result)}
              >
                <Column spacing="sm" className="p-4">
                  <Row align="center" justify="between">
                    <text className="text-sm font-semibold text-foreground">
                      {result.bookName} {result.chapterNum}:{result.verseNum}
                    </text>
                    <Icon name="chevron-right" className="text-muted-foreground" />
                  </Row>
                  <text className="text-sm text-foreground leading-relaxed">
                    {result.text.length > 200
                      ? `${result.text.substring(0, 200)}...`
                      : result.text}
                  </text>
                </Column>
              </Card>
            ))}
          </Column>
        ) : searchQuery && !isSearching ? (
          <Column align="center" justify="center" className="p-8">
            <text className="text-muted-foreground text-center">
              No results found for "{searchQuery}"
            </text>
          </Column>
        ) : (
          <Column align="center" justify="center" className="p-8">
            <Icon name="search" className="text-muted-foreground mb-4 text-4xl" />
            <text className="text-muted-foreground text-center">
              Enter a search term to find verses
            </text>
          </Column>
        )}
      </scroll-view>
    </Column>
  );
}
