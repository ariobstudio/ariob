/**
 * Search Screen
 *
 * Full-screen search interface for finding users and posts.
 * Displays as a bottom sheet with search input and results.
 */

import { useState } from '@lynx-js/react';
import { Column, Row, Text, Input, Icon } from '@ariob/ui';

export function Search() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchInput = (e: any) => {
    'background only';
    const value = e.detail?.value || '';
    setSearchQuery(value);
    console.log('[Search] Query:', value);
  };

  const handleClearSearch = () => {
    'background only';
    setSearchQuery('');
  };

  return (
    <Column className="w-full h-full" spacing="none">
      {/* Search Input */}
      <view className="w-full px-4 py-3 border-b border-border">
        <Row className="items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg">
          <Icon name="search" size="sm" className="text-muted-foreground" />
          <input
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none border-none"
            placeholder="Search users and posts..."
            value={searchQuery}
            bindinput={handleSearchInput}
            type="text"
          />
          {searchQuery && (
            <view
              className="w-5 h-5 flex items-center justify-center cursor-pointer"
              bindtap={handleClearSearch}
            >
              <Icon name="x" size="sm" className="text-muted-foreground" />
            </view>
          )}
        </Row>
      </view>

      {/* Search Results */}
      <scroll-view
        className="flex-1 w-full"
        scroll-orientation="vertical"
        enable-scroll={true}
      >
        <Column className="w-full px-4 py-6" spacing="md">
          {!searchQuery ? (
            // Empty state
            <view className="w-full py-12 flex items-center justify-center">
              <Column spacing="sm" className="items-center">
                <view className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center">
                  <Icon name="search" size="lg" className="text-muted-foreground" />
                </view>
                <Text size="lg" weight="semibold" className="text-center">
                  Search Ripple
                </Text>
                <Text size="sm" variant="muted" className="text-center max-w-[280px]">
                  Find users, posts, and conversations across your network
                </Text>
              </Column>
            </view>
          ) : (
            // Search results placeholder
            <view className="w-full py-12 flex items-center justify-center">
              <Column spacing="sm" className="items-center">
                <Icon name="inbox" size="lg" className="text-muted-foreground" />
                <Text size="sm" variant="muted" className="text-center">
                  No results found for "{searchQuery}"
                </Text>
              </Column>
            </view>
          )}
        </Column>
      </scroll-view>
    </Column>
  );
}
