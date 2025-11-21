/**
 * Enhanced Mock Data Generator
 *
 * Generates realistic mock data using real media URLs.
 */

import type {
  FeedItem,
  Post,
  ImagePost,
  VideoPost,
  Poll,
  Share,
  ThreadMetadata,
} from '@ariob/ripple';
import {
  getRandomImages,
  getRandomVideo,
  getImagesByCategory,
  type MediaItem,
} from './mockMedia';

// Sample authors
const AUTHORS = [
  { alias: 'Alice', pub: 'alice-pub-key-123' },
  { alias: 'Bob', pub: 'bob-pub-key-456' },
  { alias: 'Carol', pub: 'carol-pub-key-789' },
  { alias: 'David', pub: 'david-pub-key-101' },
  { alias: 'Eve', pub: 'eve-pub-key-112' },
  { alias: 'Frank', pub: 'frank-pub-key-131' },
  { alias: 'Grace', pub: 'grace-pub-key-415' },
  { alias: 'Henry', pub: 'henry-pub-key-161' },
];

// Sample captions/content
const TEXT_SAMPLES = [
  'Just had an amazing experience! Sometimes the best moments are the unexpected ones. 🌟',
  'Reflecting on this journey and all the lessons learned along the way. Growth is a beautiful thing.',
  "Can't believe how stunning this view is. Nature always reminds me to slow down and appreciate the present.",
  'Working on something exciting! Stay tuned for updates. The creative process is such a wild ride.',
  'Thoughts on building in public? Curious what everyone thinks about sharing progress openly.',
  'Found the perfect spot for morning coffee today. These are the moments that matter most.',
  'Experimenting with new ideas. Failure is just feedback, right? Let me know your thoughts!',
  'Grateful for the community here. You all inspire me every day to keep pushing forward.',
];

const VIDEO_CAPTIONS = [
  'Watch till the end! 👀',
  'This was absolutely mind-blowing',
  'Had to share this moment with you all',
  "You won't believe what happened next",
  'Pure magic captured on camera ✨',
  'This made my day, hope it makes yours too',
];

const POLL_QUESTIONS = [
  {
    question: 'What would you rather have?',
    options: [
      { id: '1', text: 'Ability to fly', votes: 42, voters: [] },
      { id: '2', text: 'Ability to read minds', votes: 38, voters: [] },
      { id: '3', text: 'Ability to time travel', votes: 67, voters: [] },
    ],
  },
  {
    question: 'Best way to start your day?',
    options: [
      { id: '1', text: 'Coffee', votes: 156, voters: [] },
      { id: '2', text: 'Exercise', votes: 89, voters: [] },
      { id: '3', text: 'Meditation', votes: 45, voters: [] },
      { id: '4', text: 'Sleep more', votes: 203, voters: [] },
    ],
  },
  {
    question: 'Which superpower would you choose?',
    options: [
      { id: '1', text: 'Invisibility', votes: 78, voters: [] },
      { id: '2', text: 'Super strength', votes: 45, voters: [] },
      { id: '3', text: 'Teleportation', votes: 123, voters: [] },
    ],
  },
];

// Helper to get random author
function getRandomAuthor() {
  return AUTHORS[Math.floor(Math.random() * AUTHORS.length)];
}

// Helper to get random timestamp (last 7 days)
function getRandomTimestamp() {
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  return sevenDaysAgo + Math.random() * (now - sevenDaysAgo);
}

// Helper to get random degree
function getRandomDegree(): '0' | '1' | '2' | '3' {
  const degrees: Array<'0' | '1' | '2' | '3'> = ['1', '1', '1', '2', '2', '3']; // Weighted
  return degrees[Math.floor(Math.random() * degrees.length)];
}

/**
 * Generate text posts
 */
export function generateTextPosts(count: number = 10): Post[] {
  return Array.from({ length: count }, (_, i) => {
    const author = getRandomAuthor();
    const content = TEXT_SAMPLES[Math.floor(Math.random() * TEXT_SAMPLES.length)];

    return {
      '#': `post-${Date.now()}-${i}`,
      type: 'post' as const,
      author: author.pub,
      authorAlias: author.alias,
      content,
      created: getRandomTimestamp(),
      degree: getRandomDegree(),
      tags: Math.random() > 0.5 ? ['thoughts', 'life'] : undefined,
    };
  });
}

/**
 * Generate image posts
 */
export function generateImagePosts(count: number = 5): ImagePost[] {
  return Array.from({ length: count }, (_, i) => {
    const author = getRandomAuthor();
    const imageCount = Math.floor(Math.random() * 3) + 1; // 1-3 images
    const images = getRandomImages(imageCount).map((img) => ({
      url: img.url,
      type: 'image' as const,
      width: img.width,
      height: img.height,
      altText: 'Beautiful image',
    }));

    return {
      '#': `image-post-${Date.now()}-${i}`,
      type: 'image-post' as const,
      author: author.pub,
      authorAlias: author.alias,
      images,
      caption: TEXT_SAMPLES[Math.floor(Math.random() * TEXT_SAMPLES.length)],
      created: getRandomTimestamp(),
      degree: getRandomDegree(),
      tags: ['photography', 'art'],
    };
  });
}

/**
 * Generate video posts
 */
export function generateVideoPosts(count: number = 5): VideoPost[] {
  return Array.from({ length: count }, (_, i) => {
    const author = getRandomAuthor();
    const videoData = getRandomVideo();

    return {
      '#': `video-post-${Date.now()}-${i}`,
      type: 'video-post' as const,
      author: author.pub,
      authorAlias: author.alias,
      video: {
        url: videoData.url,
        type: 'video' as const,
        thumbnail: videoData.thumbnail,
        duration: videoData.duration,
        width: 1080,
        height: 1920,
      },
      caption: VIDEO_CAPTIONS[Math.floor(Math.random() * VIDEO_CAPTIONS.length)],
      created: getRandomTimestamp(),
      degree: getRandomDegree(),
      tags: ['video', 'content'],
    };
  });
}

/**
 * Generate polls
 */
export function generatePolls(count: number = 3): Poll[] {
  return Array.from({ length: count }, (_, i) => {
    const author = getRandomAuthor();
    const pollData = POLL_QUESTIONS[i % POLL_QUESTIONS.length];

    return {
      '#': `poll-${Date.now()}-${i}`,
      type: 'poll' as const,
      author: author.pub,
      authorAlias: author.alias,
      question: pollData.question,
      options: pollData.options,
      created: getRandomTimestamp(),
      degree: getRandomDegree(),
      totalVotes: pollData.options.reduce((sum, opt) => sum + opt.votes, 0),
      multipleChoice: false,
    };
  });
}

/**
 * Generate message threads
 */
export function generateThreads(count: number = 5): ThreadMetadata[] {
  return Array.from({ length: count }, (_, i) => {
    const author = getRandomAuthor();
    const otherAuthor = AUTHORS[(AUTHORS.indexOf(author) + 1) % AUTHORS.length];

    return {
      '#': `thread-${Date.now()}-${i}`,
      type: 'thread' as const,
      threadId: `thread-${author.pub}-${otherAuthor.pub}`,
      participants: [author.pub, otherAuthor.pub],
      lastMessage: 'Hey! How are you doing?',
      lastMessageAt: getRandomTimestamp(),
      unreadCount: Math.floor(Math.random() * 5),
      created: getRandomTimestamp() - 1000000,
    };
  });
}

/**
 * Generate mixed feed
 */
export function generateMixedFeed(count: number = 30): FeedItem[] {
  const textPosts = generateTextPosts(Math.floor(count * 0.4));
  const imagePosts = generateImagePosts(Math.floor(count * 0.3));
  const videoPosts = generateVideoPosts(Math.floor(count * 0.15));
  const polls = generatePolls(Math.floor(count * 0.1));
  const threads = generateThreads(Math.floor(count * 0.05));

  const mixed: FeedItem[] = [
    ...textPosts,
    ...imagePosts,
    ...videoPosts,
    ...polls,
    ...threads,
  ];

  // Sort by created timestamp (newest first)
  return mixed.sort((a, b) => b.created - a.created);
}
