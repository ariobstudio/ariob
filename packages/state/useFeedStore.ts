import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { gunService } from '../data/gunService';
import { v4 as uuid } from 'uuid';

// Post type definition
export type Post = {
  id: string;
  author: string;
  text: string;
  imageCID?: string;
  timestamp: number;
};

// Feed state interface
interface FeedState {
  posts: Post[];
  loading: boolean;
  error: Error | null;
  // Actions
  subscribe: () => void;
  unsubscribe: () => void;
  createPost: (text: string, imageCID?: string) => Promise<void>;
  updatePost: (id: string, updates: Partial<Post>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
}

/**
 * Feed store for post management using Gun and Zustand
 * Follows ChainGun-inspired patterns for efficient state management
 */
export const useFeedStore = create<FeedState>(
  persist(
    (set, get) => {
      // Keep track of subscription status to avoid duplicate subscriptions
      let isSubscribed = false;
      let postsRef = gunService.path('posts');
      
      return {
        posts: [],
        loading: false,
        error: null,

        // Subscribe to posts feed
        subscribe: () => {
          if (isSubscribed) return;
          
          set({ loading: true });
          
          // First fetch all posts once
          postsRef.map().once((post: Post) => {
            if (!post || !post.id) return;
            
            set(state => {
              const exists = state.posts.find(p => p.id === post.id);
              if (exists) return state;
              
              return { 
                posts: [...state.posts, post].sort((a, b) => b.timestamp - a.timestamp),
                loading: false
              };
            });
          });
          
          // Then subscribe to real-time updates
          postsRef.map().on((post: Post, key) => {
            if (!post || !post.id) return;
            
            set(state => {
              // Remove previous version of this post if it exists
              const filteredPosts = state.posts.filter(p => p.id !== post.id);
              
              // Add updated post and keep sorted by timestamp
              return {
                posts: [post, ...filteredPosts].sort((a, b) => b.timestamp - a.timestamp),
                loading: false
              };
            });
          });
          
          isSubscribed = true;
        },
        
        // Unsubscribe from posts feed
        unsubscribe: () => {
          if (!isSubscribed) return;
          
          // Gun doesn't have a direct way to unsubscribe, but we can ignore updates
          isSubscribed = false;
          
          // Clear posts when unsubscribing
          set({ posts: [], loading: false });
        },
        
        // Create a new post
        createPost: async (text: string, imageCID?: string) => {
          try {
            const user = gunService.user().is;
            if (!user) {
              throw new Error('User must be authenticated to create posts');
            }
            
            const id = uuid();
            const post: Post = {
              id,
              author: user.alias || 'anonymous',
              text,
              ...(imageCID ? { imageCID } : {}),
              timestamp: Date.now()
            };
            
            await gunService.put(postsRef.get(id), post);
          } catch (error) {
            set({ error: error instanceof Error ? error : new Error(String(error)) });
            throw error;
          }
        },
        
        // Update an existing post
        updatePost: async (id: string, updates: Partial<Post>) => {
          try {
            const user = gunService.user().is;
            if (!user) {
              throw new Error('User must be authenticated to update posts');
            }
            
            // Get current post
            const postRef = postsRef.get(id);
            const currentPost = await gunService.once<Post>(postRef);
            
            if (!currentPost) {
              throw new Error(`Post with ID ${id} not found`);
            }
            
            // Check if user is the author
            if (currentPost.author !== user.alias) {
              throw new Error('You can only update your own posts');
            }
            
            // Apply updates
            await gunService.put(postRef, {
              ...updates,
              timestamp: Date.now() // Update timestamp
            });
          } catch (error) {
            set({ error: error instanceof Error ? error : new Error(String(error)) });
            throw error;
          }
        },
        
        // Delete a post
        deletePost: async (id: string) => {
          try {
            const user = gunService.user().is;
            if (!user) {
              throw new Error('User must be authenticated to delete posts');
            }
            
            // Get current post
            const postRef = postsRef.get(id);
            const currentPost = await gunService.once<Post>(postRef);
            
            if (!currentPost) {
              throw new Error(`Post with ID ${id} not found`);
            }
            
            // Check if user is the author
            if (currentPost.author !== user.alias) {
              throw new Error('You can only delete your own posts');
            }
            
            // In Gun, we "delete" by setting to null
            await gunService.put(postRef, null);
            
            // Update local state
            set(state => ({
              posts: state.posts.filter(p => p.id !== id)
            }));
          } catch (error) {
            set({ error: error instanceof Error ? error : new Error(String(error)) });
            throw error;
          }
        }
      };
    },
    {
      name: 'ariob-feed-store',
      partialize: (state) => ({
        // Don't persist everything, just posts if needed
        // Or set to empty object to not persist anything
        posts: []
      })
    }
  )
);

export default useFeedStore;
