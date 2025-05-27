import { Post, PostSchema } from '@/schema/post.schema';
import { gun, make, who } from '@ariob/core';
import * as Err from '@ariob/core';
import { Result, err, ok } from 'neverthrow';

// Create base thing service for posts
const postThing = make(PostSchema, 'posts');

// Create a new post (using the current user)
const createPost = async (
  postData: Omit<
    Post,
    'id' | 'createdAt' | 'createdBy' | 'soul' | 'schema' | 'version'
  >,
): Promise<Result<Post, Err.AppError>> => {
  const currentUser = await who.current();
  console.log('currentUser', currentUser);
  if (currentUser.isErr()) {
    return err(currentUser.error);
  }

  const user = currentUser.value;
  if (!user) {
    return err(Err.auth('Must be logged in to create a post'));
  }

  // Add the schema and user data
  const data = {
    ...postData,
    createdBy: user.pub,
    schema: 'post' as const,
  };

  const postResult = await postThing.create(data);
  if (postResult.isErr()) {
    return err(postResult.error);
  }

  return ok(postResult.value as Post);
};

// Get posts by topic
const getByTopic = async (
  topic: string,
): Promise<Result<Post[], Err.AppError>> => {
  const result = await postThing.list();

  if (result.isErr()) {
    return err(result.error);
  }

  // Filter to only posts with matching topic
  const filtered = result.value.filter(
    (post) => 'topic' in post && post.topic === topic,
  ) as Post[];

  return ok(filtered);
};

// Get posts by user
const getByUser = async (
  userPub: string,
): Promise<Result<Post[], Err.AppError>> => {
  const result = await postThing.list();

  if (result.isErr()) {
    return err(result.error);
  }

  // Filter to only posts with matching createdBy
  const filtered = result.value.filter(
    (post) => post.createdBy === userPub,
  ) as Post[];

  return ok(filtered);
};

// Vote on a post
const vote = async (
  postId: string,
  voteType: 'up' | 'down',
): Promise<Result<Post | null, Err.AppError>> => {
  const currentUser = await who.current();

  if (currentUser.isErr()) {
    return err(currentUser.error);
  }

  const user = currentUser.value;
  if (!user) {
    return err(Err.auth('Must be logged in to vote'));
  }

  const postResult = await postThing.get(postId);

  if (postResult.isErr()) {
    return err(postResult.error);
  }

  const post = postResult.value as Post;
  if (!post) {
    return ok(null);
  }

  // Record the vote in a votes collection
  const voteNode = gun.get(`votes/${postId}`).get(user.pub);
  voteNode.put({ type: voteType, timestamp: Date.now() });

  // Update the post with the new vote count
  const updates: Partial<Post> = {};

  if (voteType === 'up') {
    updates.likes = (post.likes || 0) + 1;
  } else {
    updates.likes = (post.likes || 0) - 1;
  }

  // Use the base service to update the post
  const updateResult = await postThing.update(postId, updates);
  if (updateResult.isErr()) {
    return err(updateResult.error);
  }

  return ok(updateResult.value as Post);
};

// Export the service with all the base methods plus the specialized ones
export const postService = {
  ...postThing, // Spread all base methods
  createPost,
  getByTopic,
  getByUser,
  vote,
};
