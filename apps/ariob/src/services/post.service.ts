// src/gun/services/post.service.ts
import { createThingService } from '@/gun/services/thing.service';
import { PostSchema, Post } from '@/schema/post.schema';
import * as whoService from '@/gun/services/who.service';
import gun from '@/gun/core/gun';

// Create base thing service for posts
const baseThingService = createThingService(PostSchema, 'posts');

// Create a new post (using the current user)
const createPost = async (postData: Omit<Post, 'id' | 'createdAt' | 'createdBy' | 'soul' | 'schema' | 'version'>): Promise<Post> => {
  const currentUser = await whoService.getCurrentUser();
  
  if (!currentUser) {
    throw new Error('Must be logged in to create a post');
  }
  
  // Use the base service create method but add the user info and schema
  return PostSchema.parse(await baseThingService.create({
    ...postData,
    createdBy: currentUser.pub,
    schema: 'post'
  }));
};

// Get posts by topic
const getByTopic = async (topic: string): Promise<Post[]> => {
  const allPosts = await baseThingService.list();
  return allPosts
    .map(post => PostSchema.parse(post))
    .filter(post => post.topic === topic);
};

// Get posts by user
const getByUser = async (userPub: string): Promise<Post[]> => {
  const allPosts = await baseThingService.list();
  return allPosts
    .map(post => PostSchema.parse(post))
    .filter(post => post.createdBy === userPub);
};

// Vote on a post
const vote = async (postId: string, voteType: 'up' | 'down'): Promise<Post | null> => {
  const currentUser = await whoService.getCurrentUser();
  
  if (!currentUser) {
    throw new Error('Must be logged in to vote');
  }
  
  const post = await baseThingService.get(postId);
  
  if (!post) {
    return null;
  }
  
  const validatedPost = PostSchema.parse(post);
  
  // Record the vote in a votes collection
  const voteNode = gun.get(`votes/${postId}`).get(currentUser.pub);
  voteNode.put({ type: voteType, timestamp: Date.now() });
  
  // Update the post with the new vote count
  const updates: Partial<Post> = {};
  
  if (voteType === 'up') {
    updates.upvotes = (validatedPost.upvotes || 0) + 1;
  } else {
    updates.downvotes = (validatedPost.downvotes || 0) + 1;
  }
  
  // Use the base service to update the post
  return PostSchema.parse(await baseThingService.update(postId, updates));
};

// Export the service with all the base methods plus the specialized ones
export const postService = {
  ...baseThingService,  // Spread all base methods
  createPost,
  getByTopic,
  getByUser,
  vote
};
