import { useState } from '@lynx-js/react';
import { useBibleStore } from '../store/bible-store';
import { bibleService } from '../services/bible-service';
import { Button, Card, Column, Row, Input, Icon } from '@ariob/ui';
import { useTheme } from '@ariob/ui';

interface SearchResult {
  bookName: string;
  bookIndex: number;
  chapterNum: number;
  chapterIndex: number;
  verseNum: number;
  text: string;
}

interface GroupedResults {
  [bookChapter: string]: {
    bookName: string;
    bookIndex: number;
    chapterNum: number;
    chapterIndex: number;
    results: SearchResult[];
  };
}

export function SearchView() {
  const { goBack, navigateToVerse, bibleData } = useBibleStore();
  const { withTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

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

  const handleResultClick = (result: SearchResult) => {
    console.log('[SearchView] handleResultClick called');
    console.log('[SearchView] Navigating to verse:', {
      bookIndex: result.bookIndex,
      chapterIndex: result.chapterIndex,
      verseNum: result.verseNum,
      bookName: result.bookName
    });
    navigateToVerse(result.bookIndex, result.chapterIndex, result.verseNum);
  };

  // Group results by book and chapter
  const groupedResults: GroupedResults = searchResults.reduce((acc, result) => {
    const key = `${result.bookName}-${result.chapterNum}`;
    if (!acc[key]) {
      acc[key] = {
        bookName: result.bookName,
        bookIndex: result.bookIndex,
        chapterNum: result.chapterNum,
        chapterIndex: result.chapterIndex,
        results: []
      };
    }
    acc[key].results.push(result);
    return acc;
  }, {} as GroupedResults);

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Highlight search term in text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts;
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
            {Object.entries(groupedResults).map(([key, group]) => {
              const isExpanded = expandedGroups.includes(key);

              return (
                <Card key={key} className="overflow-hidden">
                  {/* Group Header */}
                  <view
                    className="cursor-pointer active:bg-muted/50 transition-colors"
                    bindtap={() => toggleGroup(key)}
                  >
                    <Row align="center" justify="between" className="p-4">
                      <Column spacing="xs">
                        <text className="text-sm font-bold text-foreground">
                          {group.bookName} {group.chapterNum}
                        </text>
                        <text className="text-xs text-muted-foreground">
                          {group.results.length} {group.results.length === 1 ? 'verse' : 'verses'}
                        </text>
                      </Column>
                      <Icon
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        className="text-muted-foreground"
                      />
                    </Row>
                  </view>

                  {/* Group Results */}
                  {isExpanded && (
                    <view className="border-t border-border/50">
                      <Column spacing="xs" className="p-2">
                        {group.results.map((result, idx) => {
                          const textParts = highlightText(result.text, searchQuery);

                          return (
                            <view
                              key={idx}
                              className="p-3 rounded-lg active:bg-muted/30 transition-colors cursor-pointer"
                              bindtap={() => handleResultClick(result)}
                            >
                              <Column spacing="sm">
                                <Row align="center" justify="between">
                                  <text className="text-xs font-semibold text-primary">
                                    Verse {result.verseNum}
                                  </text>
                                  <Icon name="chevron-right" className="text-muted-foreground text-xs" />
                                </Row>
                                <view className="flex flex-row flex-wrap">
                                  {textParts.map((part, partIdx) => (
                                    <text
                                      key={partIdx}
                                      className={
                                        part.toLowerCase() === searchQuery.toLowerCase()
                                          ? 'text-sm text-foreground bg-primary/20 font-semibold'
                                          : 'text-sm text-foreground'
                                      }
                                    >
                                      {part.length > 150 && partIdx === 0
                                        ? `...${part.substring(part.length - 150)}`
                                        : part.length > 150
                                        ? `${part.substring(0, 150)}...`
                                        : part}
                                    </text>
                                  ))}
                                </view>
                              </Column>
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
