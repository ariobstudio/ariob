// src/gun/services/comment.service.ts
import { createThingService } from '@/gun/services/thing.service';
import { CommentSchema, Comment } from '@/schema/comment.schema';
import { PostSchema, Post } from '@/schema/post.schema';
import * as whoService from '@/gun/services/who.service';
import { postService } from '@/services/post.service';

// Create base thing service for comments
const baseThingService = createThingService(CommentSchema, 'comments');

// Create a new comment
const createComment = async (commentData: Omit<Comment, 'id' | 'createdAt' | 'createdBy' | 'soul' | 'schema' | 'version'>): Promise<Comment> => {
  const currentUser = await whoService.getCurrentUser();
  
  if (!currentUser) {
    throw new Error('Must be logged in to create a comment');
  }
  
  // Check that the post exists
  const post = await postService.get(commentData.postId);
  if (!post) {
    throw new Error('Post not found');
  }
  
  const validatedPost = PostSchema.parse(post);
  
  // Use the base service but add the user and schema
  const comment = await baseThingService.create({
    ...commentData,
    createdBy: currentUser.pub,
    schema: 'comment'
  });
  
  const validatedComment = CommentSchema.parse(comment);
  
  // Update the post's comment count
  await postService.update(commentData.postId, {
    commentCount: (validatedPost.commentCount || 0) + 1
  } as Partial<Post>);
  
  return validatedComment;
};

// Get comments for a post
const getByPost = async (postId: string): Promise<Comment[]> => {
  // Get all comments
  const allComments = await baseThingService.list();
  
  // Filter by post ID
  return allComments
    .map(comment => CommentSchema.parse(comment))
    .filter(comment => comment.postId === postId);
};

// Delete a comment
const deleteComment = async (commentId: string): Promise<boolean> => {
  const currentUser = await whoService.getCurrentUser();
  
  if (!currentUser) {
    throw new Error('Must be logged in to delete a comment');
  }
  
  // Get the comment
  const comment = await baseThingService.get(commentId);
  
  if (!comment) {
    return false;
  }
  
  const validatedComment = CommentSchema.parse(comment);
  
  // Check permission (only owner can delete)
  if (validatedComment.createdBy !== currentUser.pub) {
    throw new Error('You can only delete your own comments');
  }
  
  // Mark as deleted instead of actually removing it
  await baseThingService.update(commentId, {
    isDeleted: true,
    body: '[deleted]'
  } as Partial<Comment>);
  
  return true;
};

// Export the service with all the base methods plus the specialized ones
export const commentService = {
  ...baseThingService,  // Spread all base methods
  createComment,
  getByPost,
  deleteComment
};
