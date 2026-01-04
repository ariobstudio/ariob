/**
 * Search Module - Decentralized search for Ariob
 *
 * In a local-first system, search works through:
 * 1. Public profile index - users opt-in to be discoverable
 * 2. Hashtag index - posts tagged for topic discovery
 * 3. Client-side filtering - search within loaded content
 *
 * @module search
 */

// User search
export { searchUsers } from './searchUsers';

// Hashtag search
export { searchByHashtag, fetchPostsFromRefs } from './searchHashtags';

// Content parsing
export { extractHashtags, extractMentions } from './extractHashtags';

// Profile indexing
export { indexMyProfile, indexPostHashtags } from './indexProfile';
