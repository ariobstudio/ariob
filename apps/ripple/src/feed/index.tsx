/**
 * Feed Feature Bundle
 *
 * Main pillar - unified feed with posts and DMs, degree filtering.
 * Uses native iOS pager for horizontal degree switching with automatic
 * gesture conflict resolution between vertical scrolling and horizontal paging.
 */

import { root, useState, useMemo } from '@lynx-js/react';
import {
  Column,
  Row,
  Text,
  cn,
  useTheme,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  PagerView,
} from '@ariob/ui';
import { useAuth, graph } from '@ariob/core';
import type { IGunChainReference } from '@ariob/core';
import { useProfile } from '../utils/profile';
import type { Degree, Post } from '@ariob/ripple';
import type { Navigator } from '../components';
import { createNavigator } from '../components';

// Import shared components
import { DiscoveryBar } from '../components/Layout/DiscoveryBar';
import { ComposeDock } from '../components/Layout/ComposeDock';
import { FeedItemWrapper } from '../components/FeedItem/FeedItemWrapper';
import { TextPostPreview } from '../components/FeedItem/TextPostPreview';
import { Search } from '../screens/Search';

export interface FeedFeatureProps {
  data?: any;
  navigator: Navigator;
  graph: IGunChainReference;
}

/**
 * Mock data for development - no Gun API calls
 */
const MOCK_POSTS: Record<Degree, Post[]> = {
  '0': [
    {
      type: 'post',
      '#': 'post-0-1',
      content: "Just shipped a new feature! 🚀 The focus lens animation is looking smooth.",
      author: 'XTB42GpQK78t8eNDpn0JI_oDgPg0Wloh1kgO0eLMIjQ.K3CLNgR_ph7aVkZN-a_Byrzi-p3dE3YVNxM3_1xcrvk',
      authorAlias: 'You',
      created: Date.now() - 60000,
      degree: '0',
    },
    {
      type: 'post',
      '#': 'post-0-2',
      content: "Working on the horizontal swiper for Ripple. Snap behavior feels great!",
      author: 'XTB42GpQK78t8eNDpn0JI_oDgPg0Wloh1kgO0eLMIjQ.K3CLNgR_ph7aVkZN-a_Byrzi-p3dE3YVNxM3_1xcrvk',
      authorAlias: 'You',
      created: Date.now() - 120000,
      degree: '0',
    },
    {
      type: 'post',
      '#': 'post-0-3',
      content: "Coffee ☕ + Code = Perfect morning",
      author: 'XTB42GpQK78t8eNDpn0JI_oDgPg0Wloh1kgO0eLMIjQ.K3CLNgR_ph7aVkZN-a_Byrzi-p3dE3YVNxM3_1xcrvk',
      authorAlias: 'You',
      created: Date.now() - 180000,
      degree: '0',
    },
    {
      type: 'post',
      '#': 'post-0-4',
      content: "Building decentralized apps with LynxJS is amazing. The dual-thread architecture makes everything so smooth.",
      author: 'XTB42GpQK78t8eNDpn0JI_oDgPg0Wloh1kgO0eLMIjQ.K3CLNgR_ph7aVkZN-a_Byrzi-p3dE3YVNxM3_1xcrvk',
      authorAlias: 'You',
      created: Date.now() - 240000,
      degree: '0',
    },
    {
      type: 'post',
      '#': 'post-0-5',
      content: "The IFR pattern for instant first renders is a game-changer for UX. No more loading spinners!",
      author: 'XTB42GpQK78t8eNDpn0JI_oDgPg0Wloh1kgO0eLMIjQ.K3CLNgR_ph7aVkZN-a_Byrzi-p3dE3YVNxM3_1xcrvk',
      authorAlias: 'You',
      created: Date.now() - 300000,
      degree: '0',
    },
    {
      type: 'post',
      '#': 'post-0-6',
      content: "P2P databases like Gun are fascinating. True data ownership without central servers. 🌐",
      author: 'XTB42GpQK78t8eNDpn0JI_oDgPg0Wloh1kgO0eLMIjQ.K3CLNgR_ph7aVkZN-a_Byrzi-p3dE3YVNxM3_1xcrvk',
      authorAlias: 'You',
      created: Date.now() - 360000,
      degree: '0',
    },
    {
      type: 'post',
      '#': 'post-0-7',
      content: "Finally nailed the degree filtering UX. Swipe feels natural!",
      author: 'XTB42GpQK78t8eNDpn0JI_oDgPg0Wloh1kgO0eLMIjQ.K3CLNgR_ph7aVkZN-a_Byrzi-p3dE3YVNxM3_1xcrvk',
      authorAlias: 'You',
      created: Date.now() - 420000,
      degree: '0',
    },
    {
      type: 'post',
      '#': 'post-0-8',
      content: "Pro tip: Always test on actual devices. Simulators don't capture the real feel of gestures.",
      author: 'XTB42GpQK78t8eNDpn0JI_oDgPg0Wloh1kgO0eLMIjQ.K3CLNgR_ph7aVkZN-a_Byrzi-p3dE3YVNxM3_1xcrvk',
      authorAlias: 'You',
      created: Date.now() - 480000,
      degree: '0',
    },
  ],
  '1': [
    {
      type: 'post',
      '#': 'post-1-1',
      content: "Who else is excited about Gun.js and P2P technologies?",
      author: 'friend-pub-key-1',
      authorAlias: 'Alice',
      created: Date.now() - 90000,
      degree: '1',
    },
    {
      type: 'post',
      '#': 'post-1-2',
      content: "Hot take: CSS animations are underrated. They're faster than JS and easier to maintain.",
      author: 'friend-pub-key-2',
      authorAlias: 'Bob',
      created: Date.now() - 150000,
      degree: '1',
    },
    {
      type: 'post',
      '#': 'post-1-3',
      content: "Reading about LynxJS dual-thread architecture. Mind = blown 🤯",
      author: 'friend-pub-key-3',
      authorAlias: 'Charlie',
      created: Date.now() - 210000,
      degree: '1',
    },
    {
      type: 'post',
      '#': 'post-1-4',
      content: "React Native is cool, but LynxJS takes it to another level with true native performance.",
      author: 'friend-pub-key-1',
      authorAlias: 'Alice',
      created: Date.now() - 270000,
      degree: '1',
    },
    {
      type: 'post',
      '#': 'post-1-5',
      content: "The color temperature hints for degrees (warm/neutral/cool) are such a nice touch!",
      author: 'friend-pub-key-2',
      authorAlias: 'Bob',
      created: Date.now() - 330000,
      degree: '1',
    },
    {
      type: 'post',
      '#': 'post-1-6',
      content: "Decentralization isn't just a buzzword. It's about giving users control of their data.",
      author: 'friend-pub-key-3',
      authorAlias: 'Charlie',
      created: Date.now() - 390000,
      degree: '1',
    },
  ],
  '2': [
    {
      type: 'post',
      '#': 'post-2-1',
      content: "What's your favorite state management library? I'm team Zustand.",
      author: 'extended-pub-key-1',
      authorAlias: 'Dave',
      created: Date.now() - 100000,
      degree: '2',
    },
    {
      type: 'post',
      '#': 'post-2-2',
      content: "Just discovered the IFR pattern. Game changer for performance!",
      author: 'extended-pub-key-2',
      authorAlias: 'Eve',
      created: Date.now() - 160000,
      degree: '2',
    },
    {
      type: 'post',
      '#': 'post-2-3',
      content: "Building in public is scary but rewarding. Here's to shipping more features!",
      author: 'extended-pub-key-3',
      authorAlias: 'Frank',
      created: Date.now() - 220000,
      degree: '2',
    },
    {
      type: 'post',
      '#': 'post-2-4',
      content: "TypeScript makes refactoring so much safer. Caught 3 bugs before they hit production!",
      author: 'extended-pub-key-1',
      authorAlias: 'Dave',
      created: Date.now() - 280000,
      degree: '2',
    },
    {
      type: 'post',
      '#': 'post-2-5',
      content: "Anyone else obsessed with micro-interactions? They make or break the UX.",
      author: 'extended-pub-key-2',
      authorAlias: 'Eve',
      created: Date.now() - 340000,
      degree: '2',
    },
  ],
};

/**
 * Degree to page index conversion
 */
const DEGREES: Degree[] = ['0', '1', '2'];
const degreeToPage = (degree: Degree): number => DEGREES.indexOf(degree);
const pageToDegree = (page: number): Degree => DEGREES[page] || '0';

/**
 * FeedFeature displays the unified feed with degree filtering via horizontal swiper
 */
export function FeedFeature({ navigator, graph }: FeedFeatureProps) {
  const { withTheme } = useTheme();
  const { user } = useAuth(graph);
  const { profile } = useProfile(graph);

  // Current degree state (managed by Tabs component)
  const [degree, setDegree] = useState<Degree>('0');

  // Sheet states
  const [searchOpen, setSearchOpen] = useState(false);

  // Mock data from state (no Gun API)
  const mockData = useMemo(() => MOCK_POSTS, []);

  // Handle degree change from DiscoveryBar or PagerView
  const handleDegreeChange = (value: string | Degree) => {
    'background only';
    if (value === '0' || value === '1' || value === '2') {
      setDegree(value as Degree);
    }
  };

  // Handle page change from PagerView swipe
  const handlePageChange = (page: number) => {
    'background only';
    const newDegree = pageToDegree(page);
    setDegree(newDegree);
  };

  // Handle item tap - navigate to thread viewer
  const handleItemTap = (post: Post) => {
    'background only';
    console.log('[Feed] Post tapped:', post);

    navigator.navigate('thread', {
      type: 'post',
      id: post['#'],
      item: post,
    });
  };

  // Handle compose action
  const handleCompose = (type: 'post' | 'message') => {
    'background only';
    console.log('[Feed] Compose:', type);

    navigator.navigate('composer', { type });
  };

  // Handle search sheet
  const handleSearchTap = () => {
    'background only';
    console.log('[Feed] Opening search sheet');
    setSearchOpen(true);
  };

  // Handle settings navigation
  const handleSettingsTap = () => {
    'background only';
    console.log('[Feed] Navigating to settings');
    navigator.navigate('settings');
  };

  // Render user profile header for degree 0
  const renderProfileHeader = () => {
    // Use the actual user data from Gun profile, with fallback to auth
    const displayName = profile?.alias || user?.alias || 'Loading...';
    const pubKey = user?.pub || '';
    const bio = profile?.bio;

    return (
      <view className="w-full px-4 py-4 border-b border-border/50">
        <Row className="items-center gap-3">
          {/* Profile avatar */}
          <view className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center flex-shrink-0">
            <Text size="xl" weight="bold" className="text-white">
              {displayName[0]?.toUpperCase() || 'U'}
            </Text>
          </view>

          {/* Profile info */}
          <Column spacing="xs" className="flex-1 min-w-0">
            <Text size="lg" weight="semibold" className="truncate">
              {displayName}
            </Text>
            {bio ? (
              <Text size="xs" variant="muted" className="truncate">
                {bio}
              </Text>
            ) : pubKey ? (
              <Text size="xs" variant="muted" className="font-mono truncate">
                {pubKey.slice(0, 16)}...
              </Text>
            ) : null}
          </Column>

          {/* Stats - compact row */}
          <Row className="gap-4 flex-shrink-0">
            <Column spacing="none" className="items-center">
              <Text size="sm" weight="bold">
                {mockData['0'].length}
              </Text>
              <Text size="xs" variant="muted">
                Posts
              </Text>
            </Column>
            <Column spacing="none" className="items-center">
              <Text size="sm" weight="bold">
                {mockData['1'].length}
              </Text>
              <Text size="xs" variant="muted">
                Friends
              </Text>
            </Column>
          </Row>
        </Row>
      </view>
    );
  };

  // Render a single feed page with vertical scrolling
  const renderFeedPage = (feedDegree: Degree) => {
    const posts = mockData[feedDegree] || [];

    return (
      <scroll-view
        className="w-full h-full"
        scroll-orientation="vertical"
        enable-scroll={true}
        scroll-bar-enable={false}
      >
        <Column className="w-full pb-20" spacing="none">
          {/* Show profile header only on degree 0 */}
          {feedDegree === '0' && renderProfileHeader()}

          {/* Feed list */}
          {posts.length === 0 ? (
            <view className="flex-1 w-full flex items-center justify-center p-8">
              <Column className="items-center text-center max-w-sm" spacing="lg">
                <Text variant="muted" size="lg" weight="medium">
                  No items in this feed yet
                </Text>
                <Text variant="muted" size="sm">
                  {feedDegree === '0'
                    ? 'Start sharing your thoughts!'
                    : 'Connect with others to see their content'}
                </Text>
              </Column>
            </view>
          ) : (
            <view className="w-full px-4 py-2">
              {posts.map((post, index) => {
                const postKey = post['#'] || `post-${feedDegree}-${index}`;
                return (
                  <FeedItemWrapper
                    key={postKey}
                    item-key={postKey}
                    id={postKey}
                    isFocused={false}
                    onTap={() => handleItemTap(post)}
                    className="mb-3"
                    style={{
                      animation: `slideIn 400ms cubic-bezier(0.4, 0, 0.2, 1) ${index * 50}ms both`,
                    }}
                  >
                    <TextPostPreview post={post} isFocused={false} />
                  </FeedItemWrapper>
                );
              })}
            </view>
          )}
        </Column>
      </scroll-view>
    );
  };

  return (
    <page
      className={cn(
        withTheme('', 'dark'),
        "bg-background w-full h-full pb-safe-bottom pt-safe-top transition-colors duration-500",
        // degree === '0' && "bg-[var(--degree-0-tint)]",
        // degree === '1' && "bg-[var(--degree-1-tint)]",
        // degree === '2' && "bg-[var(--degree-2-tint)]"
      )}
    >
      <Column className="relative w-full h-full" spacing="none">
        {/* Discovery Bar - Only visible navigation */}
        <DiscoveryBar
          degree={degree}
          onDegreeChange={handleDegreeChange}
          onSearchTap={handleSearchTap}
          onSettingsTap={handleSettingsTap}
        />

        {/* Native Pager - Full screen swipe between degrees */}
        <PagerView
          currentPage={degreeToPage(degree)}
          onPageChange={handlePageChange}
          className="flex-1"
        >
          {renderFeedPage('0')}
          {renderFeedPage('1')}
          {renderFeedPage('2')}
        </PagerView>

        {/* Compose Dock - Fixed at bottom */}
        <ComposeDock
          onCreatePost={() => handleCompose('post')}
          onCreateMessage={() => handleCompose('message')}
        />
      </Column>

      {/* Search Sheet - Full Screen */}
      <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
        <SheetContent
          side="bottom"
          className="pb-safe-bottom"
          style={{ maxHeight: '100vh', height: '100vh', borderRadius: 0 }}
        >
          <SheetHeader showHandle={true} showClose={true}>
            <SheetTitle>Search</SheetTitle>
          </SheetHeader>
          <SheetBody className="flex-1 p-0" style={{ maxHeight: 'calc(100vh - 80px)' }}>
            <Search />
          </SheetBody>
        </SheetContent>
      </Sheet>
    </page>
  );
}

// Default export for direct rendering (standalone mode)
export default function FeedFeatureRoot() {
  const g = graph();
  const navigator = createNavigator('feed');
  return <FeedFeature navigator={navigator} graph={g} />;
}
