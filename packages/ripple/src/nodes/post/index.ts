/**
 * Post Node
 *
 * Self-contained module for text post nodes.
 * Importing this module auto-registers post actions.
 */

// Auto-register actions on import
import './post.actions';

// Component
export { Post, type PostData } from './Post';

// Schema
export { PostSchema, type Post as PostNode, isPost, createPost, POST_ACTIONS } from './post.schema';

// Actions
export { postActions } from './post.actions';

// Styles
export { postStyles } from './post.styles';
