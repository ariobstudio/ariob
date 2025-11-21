/**
 * Mock Media URLs
 *
 * Real images from Unsplash and public video URLs for testing.
 */

export interface MediaItem {
  url: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  duration?: number; // For videos, in seconds
  aspectRatio?: number;
}

/**
 * Real images from Unsplash
 * Using specific photo IDs for consistency
 */
export const SAMPLE_IMAGES: MediaItem[] = [
  // Portraits
  {
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
    width: 800,
    height: 1000,
    aspectRatio: 4 / 5,
  },
  {
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    width: 800,
    height: 1000,
    aspectRatio: 4 / 5,
  },
  {
    url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80',
    width: 800,
    height: 1000,
    aspectRatio: 4 / 5,
  },

  // Nature & Landscapes
  {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
    width: 1200,
    height: 800,
    aspectRatio: 3 / 2,
  },
  {
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
    width: 1200,
    height: 800,
    aspectRatio: 3 / 2,
  },
  {
    url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&q=80',
    width: 1200,
    height: 800,
    aspectRatio: 3 / 2,
  },

  // Urban & Architecture
  {
    url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200&q=80',
    width: 1200,
    height: 800,
    aspectRatio: 3 / 2,
  },
  {
    url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=80',
    width: 1200,
    height: 800,
    aspectRatio: 3 / 2,
  },

  // Food
  {
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&q=80',
    width: 1000,
    height: 1000,
    aspectRatio: 1,
  },
  {
    url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1000&q=80',
    width: 1000,
    height: 1000,
    aspectRatio: 1,
  },

  // Art & Design
  {
    url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1000&q=80',
    width: 1000,
    height: 1000,
    aspectRatio: 1,
  },
  {
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1000&q=80',
    width: 1000,
    height: 1000,
    aspectRatio: 1,
  },

  // Abstract
  {
    url: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1200&q=80',
    width: 1200,
    height: 800,
    aspectRatio: 3 / 2,
  },
  {
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
    width: 1200,
    height: 800,
    aspectRatio: 3 / 2,
  },
];

/**
 * Real video URLs (vertical format for TikTok-style viewing)
 * Using publicly available test videos
 */
export const SAMPLE_VIDEOS: MediaItem[] = [
  // Sample vertical videos from public sources
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    duration: 15,
    aspectRatio: 9 / 16,
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
    duration: 15,
    aspectRatio: 9 / 16,
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg',
    duration: 60,
    aspectRatio: 9 / 16,
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg',
    duration: 15,
    aspectRatio: 9 / 16,
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg',
    duration: 15,
    aspectRatio: 9 / 16,
  },
];

/**
 * Helper: Get random image(s)
 */
export function getRandomImages(count: number = 1): MediaItem[] {
  const shuffled = [...SAMPLE_IMAGES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Helper: Get random video
 */
export function getRandomVideo(): MediaItem {
  return SAMPLE_VIDEOS[Math.floor(Math.random() * SAMPLE_VIDEOS.length)];
}

/**
 * Helper: Get image by category
 */
export function getImagesByCategory(category: 'portrait' | 'nature' | 'urban' | 'food' | 'art' | 'abstract'): MediaItem[] {
  const ranges: Record<typeof category, [number, number]> = {
    portrait: [0, 2],
    nature: [3, 5],
    urban: [6, 7],
    food: [8, 9],
    art: [10, 11],
    abstract: [12, 13],
  };

  const [start, end] = ranges[category];
  return SAMPLE_IMAGES.slice(start, end + 1);
}
