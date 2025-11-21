/**
 * Mock Data for Ripple Development
 *
 * Realistic posts, notifications, and user data for testing the unified feed.
 */

export interface MockProfile {
  pub: string;
  alias: string;
  bio?: string;
  avatar?: string;
}

export type ContentType = 'post' | 'image-post' | 'video-post' | 'poll' | 'share';

export interface MockPost {
  id: string;
  type: ContentType;
  author: string;
  authorAlias: string;
  content: string;
  created: number;
  degree: 0 | 1 | 2 | 3 | 4;
  tags?: string[];
  reactions?: number;
  replies?: number;
  isDraft?: boolean;
  // For image posts
  images?: string[];
  // For video posts
  videoUrl?: string;
  // For polls
  pollQuestion?: string;
  pollOptions?: { text: string; votes: number }[];
  // For shares
  originalAuthor?: string;
}

export interface MockNotification {
  id: string;
  type: 'notification';
  kind: 'reaction' | 'reply' | 'connection' | 'mention';
  from: string;
  fromAlias: string;
  content: string;
  created: number;
  read: boolean;
  postId?: string;
}

export interface MockMessage {
  id: string;
  type: 'message';
  threadId: string;
  from: string;
  fromAlias: string;
  content: string;
  created: number;
  read: boolean;
}

// Mock user profiles
export const mockProfiles: MockProfile[] = [
  {
    pub: 'user-current',
    alias: 'You',
    bio: 'Just exploring Ripple and loving the vibe ✨',
  },
  {
    pub: 'user-alice',
    alias: 'Alice Chen',
    bio: 'Designer • Building calm technology',
  },
  {
    pub: 'user-bob',
    alias: 'Bob Martinez',
    bio: 'Photographer capturing everyday moments',
  },
  {
    pub: 'user-charlie',
    alias: 'Charlie Kim',
    bio: 'Writer exploring decentralized futures',
  },
  {
    pub: 'user-diana',
    alias: 'Diana Okonkwo',
    bio: 'Artist • Digital + Physical',
  },
  {
    pub: 'user-eve',
    alias: 'Eve Anderson',
    bio: 'Developer making things people love',
  },
  {
    pub: 'user-frank',
    alias: 'Frank Zhang',
    bio: 'Musician • Experimental sounds',
  },
];

// Mock posts - mix of personal, friends, and network
export const mockPosts: MockPost[] = [
  // Your drafts
  {
    id: 'draft-1',
    type: 'post',
    author: 'user-current',
    authorAlias: 'You',
    content: 'Thinking about how social networks shape our relationships...',
    created: Date.now() - 1000 * 60 * 30, // 30 mins ago
    degree: 0,
    isDraft: true,
  },
  {
    id: 'draft-2',
    type: 'post',
    author: 'user-current',
    authorAlias: 'You',
    content: 'Just discovered this amazing coffee shop downtown. The aesthetics are perfect – minimal, calm, exactly what I needed today.',
    created: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    degree: 0,
    isDraft: true,
  },

  // Your published posts
  {
    id: 'post-me-1',
    type: 'post',
    author: 'user-current',
    authorAlias: 'You',
    content: 'First post on Ripple! Excited to connect with people who value genuine conversation over endless scrolling.',
    created: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
    degree: 0,
    reactions: 12,
    replies: 3,
  },
  {
    id: 'post-me-2',
    type: 'post',
    author: 'user-current',
    authorAlias: 'You',
    content: 'The idea of degree-based filtering is brilliant. Instead of algorithms deciding what I see, I control my context. This is what social media should have been from the start.',
    created: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    degree: 0,
    tags: ['decentralization', 'design'],
    reactions: 28,
    replies: 8,
  },

  // Friends' posts (degree 1)
  {
    id: 'post-alice-1',
    type: 'post',
    author: 'user-alice',
    authorAlias: 'Alice Chen',
    content: 'Been thinking about calm technology lately. The best interfaces disappear – they serve you without demanding attention. Ripple feels like it gets this.',
    created: Date.now() - 1000 * 60 * 20, // 20 mins ago
    degree: 1,
    tags: ['design', 'technology'],
    reactions: 15,
    replies: 4,
  },
  {
    id: 'post-bob-1',
    type: 'image-post',
    author: 'user-bob',
    authorAlias: 'Bob Martinez',
    content: 'Sunrise over the bay this morning. Sometimes the best moments are the quiet ones. 🌅',
    created: Date.now() - 1000 * 60 * 60, // 1 hour ago
    degree: 1,
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
    reactions: 42,
    replies: 7,
  },
  {
    id: 'poll-alice-1',
    type: 'poll',
    author: 'user-alice',
    authorAlias: 'Alice Chen',
    content: '',
    pollQuestion: "What's your preferred social media posting time?",
    pollOptions: [
      { text: 'Morning (6-12)', votes: 12 },
      { text: 'Afternoon (12-18)', votes: 8 },
      { text: 'Evening (18-24)', votes: 15 },
      { text: 'Late night (24-6)', votes: 5 },
    ],
    created: Date.now() - 1000 * 60 * 40, // 40 mins ago
    degree: 1,
    reactions: 40,
    replies: 3,
  },
  {
    id: 'post-charlie-1',
    type: 'post',
    author: 'user-charlie',
    authorAlias: 'Charlie Kim',
    content: "Working on an essay about digital sovereignty. The premise: you can't have free speech without free infrastructure. Centralized platforms will always serve their shareholders first.",
    created: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    degree: 1,
    tags: ['writing', 'decentralization'],
    reactions: 31,
    replies: 12,
  },
  {
    id: 'post-diana-1',
    type: 'post',
    author: 'user-diana',
    authorAlias: 'Diana Okonkwo',
    content: 'New piece finished! Exploring the intersection of physical textures and digital patterns. The gap between tactile and virtual is smaller than we think.',
    created: Date.now() - 1000 * 60 * 60 * 4, // 4 hours ago
    degree: 1,
    tags: ['art'],
    reactions: 56,
    replies: 9,
  },

  // Extended network (degree 2)
  {
    id: 'post-eve-1',
    type: 'post',
    author: 'user-eve',
    authorAlias: 'Eve Anderson',
    content: 'Shipping a new feature is like releasing a song into the world. You pour everything into it, then let it go and hope it resonates.',
    created: Date.now() - 1000 * 60 * 45, // 45 mins ago
    degree: 2,
    reactions: 23,
    replies: 5,
  },
  {
    id: 'video-frank-1',
    type: 'video-post',
    author: 'user-frank',
    authorAlias: 'Frank Zhang',
    content: 'Experimenting with generative ambient music. The algorithm creates variations that I would never think of myself. Collaboration with randomness.',
    videoUrl: 'https://example.com/video1.mp4',
    created: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
    degree: 2,
    tags: ['music', 'creativity'],
    reactions: 18,
    replies: 6,
  },
  {
    id: 'share-diana-1',
    type: 'share',
    author: 'user-diana',
    authorAlias: 'Diana Okonkwo',
    content: 'This resonates so much! 💯',
    originalAuthor: 'Alice Chen',
    created: Date.now() - 1000 * 60 * 90, // 90 mins ago
    degree: 2,
    reactions: 12,
    replies: 2,
  },
  {
    id: 'post-alice-2',
    type: 'post',
    author: 'user-alice',
    authorAlias: 'Alice Chen',
    content: 'Hot take: Most "user research" is just asking people what they think they want, instead of observing what they actually do. Good design comes from understanding behavior, not collecting opinions.',
    created: Date.now() - 1000 * 60 * 60 * 5, // 5 hours ago
    degree: 3,
    tags: ['design', 'research'],
    reactions: 67,
    replies: 23,
  },
  {
    id: 'post-bob-2',
    type: 'post',
    author: 'user-bob',
    authorAlias: 'Bob Martinez',
    content: 'Street photography tip: The best camera is the one you have with you. Composition matters infinitely more than gear.',
    created: Date.now() - 1000 * 60 * 60 * 8, // 8 hours ago
    degree: 3,
    reactions: 34,
    replies: 11,
  },
  {
    id: 'post-charlie-2',
    type: 'post',
    author: 'user-charlie',
    authorAlias: 'Charlie Kim',
    content: "Reading old sci-fi is wild. William Gibson predicted virtual reality and cyberspace, but completely missed that we'd carry supercomputers in our pockets. The future is always weirder than we imagine.",
    created: Date.now() - 1000 * 60 * 60 * 12, // 12 hours ago
    degree: 3,
    tags: ['books', 'technology'],
    reactions: 45,
    replies: 15,
  },
];

// Mock notifications
export const mockNotifications: MockNotification[] = [
  {
    id: 'notif-1',
    type: 'notification',
    kind: 'reaction',
    from: 'user-alice',
    fromAlias: 'Alice Chen',
    content: 'reacted to your post',
    created: Date.now() - 1000 * 60 * 10, // 10 mins ago
    read: false,
    postId: 'post-me-1',
  },
  {
    id: 'notif-2',
    type: 'notification',
    kind: 'reply',
    from: 'user-bob',
    fromAlias: 'Bob Martinez',
    content: 'replied to your post',
    created: Date.now() - 1000 * 60 * 25, // 25 mins ago
    read: false,
    postId: 'post-me-2',
  },
  {
    id: 'notif-3',
    type: 'notification',
    kind: 'connection',
    from: 'user-eve',
    fromAlias: 'Eve Anderson',
    content: 'wants to connect',
    created: Date.now() - 1000 * 60 * 60, // 1 hour ago
    read: false,
  },
  {
    id: 'notif-4',
    type: 'notification',
    kind: 'mention',
    from: 'user-charlie',
    fromAlias: 'Charlie Kim',
    content: 'mentioned you in a post',
    created: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    read: true,
  },
  {
    id: 'notif-5',
    type: 'notification',
    kind: 'reaction',
    from: 'user-diana',
    fromAlias: 'Diana Okonkwo',
    content: 'reacted to your post',
    created: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
    read: true,
    postId: 'post-me-1',
  },
  {
    id: 'notif-6',
    type: 'notification',
    kind: 'reply',
    from: 'user-frank',
    fromAlias: 'Frank Zhang',
    content: 'replied to your post',
    created: Date.now() - 1000 * 60 * 60 * 6, // 6 hours ago
    read: true,
    postId: 'post-me-2',
  },
];

// Mock messages
export const mockMessages: MockMessage[] = [
  {
    id: 'msg-1',
    type: 'message',
    threadId: 'thread-alice',
    from: 'user-alice',
    fromAlias: 'Alice Chen',
    content: 'Hey! Loved your thoughts on degree-based filtering. Want to grab coffee and chat about it?',
    created: Date.now() - 1000 * 60 * 15, // 15 mins ago
    read: false,
  },
  {
    id: 'msg-2',
    type: 'message',
    threadId: 'thread-charlie',
    from: 'user-charlie',
    fromAlias: 'Charlie Kim',
    content: "I'm working on that essay about digital sovereignty. Mind if I quote your post about algorithms?",
    created: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    read: true,
  },
];

// Helper to get all feed items (posts + notifications) sorted by time
export function getUnifiedFeed(
  degree?: 0 | 1 | 2 | 3 | 4,
  contentType?: 'all' | ContentType
) {
  let posts: MockPost[] = [];

  if (degree !== undefined) {
    // Filter by specific degree
    posts = mockPosts.filter(p => p.degree === degree && !p.isDraft);
  } else {
    // Show all non-draft posts
    posts = mockPosts.filter(p => !p.isDraft);
  }

  // Filter by content type
  if (contentType && contentType !== 'all') {
    posts = posts.filter(p => p.type === contentType);
  }

  // Include notifications for degrees 0-2 (personal to close network)
  const items = degree !== undefined && degree <= 2
    ? [...posts, ...mockNotifications].sort((a, b) => b.created - a.created)
    : posts.sort((a, b) => b.created - a.created);

  return items;
}

// Get user's drafts
export function getDrafts() {
  return mockPosts.filter(p => p.isDraft);
}

// Get user's published posts
export function getUserPosts() {
  return mockPosts.filter(p => p.author === 'user-current' && !p.isDraft);
}

// Format timestamp
export function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}
