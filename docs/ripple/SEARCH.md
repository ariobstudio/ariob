# Decentralized Search

> Three-tier search system for decentralized content discovery

---

## Overview

@ariob/ripple provides a decentralized search infrastructure that works with Gun's peer-to-peer database:

| Tier | Function | Data Source |
|------|----------|-------------|
| **User Search** | Find users by username/alias | Public profile index |
| **Hashtag Search** | Find posts by hashtag | Hashtag index |
| **Client-Side** | Filter loaded content | Local state |

---

## Quick Start

### Search Users

```typescript
import { useUserSearch } from '@ariob/ripple';

function UserSearch() {
  const { results, isLoading, error } = useUserSearch('alice');

  return (
    <FlatList
      data={results}
      renderItem={({ item }) => (
        <View>
          <Text>{item.alias}</Text>
          <Text>{item.name}</Text>
        </View>
      )}
    />
  );
}
```

### Search Hashtags

```typescript
import { useHashtagSearch } from '@ariob/ripple';

function HashtagSearch() {
  const { refs, posts, isLoading } = useHashtagSearch('ripple');

  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => <PostCard post={item} />}
    />
  );
}
```

### Combined Search

```typescript
import { useSearch } from '@ariob/ripple';

function UnifiedSearch() {
  const search = useSearch({
    type: 'all',
    debounce: 300,
    minLength: 2,
  });

  return (
    <>
      <TextInput
        value={search.query}
        onChangeText={search.setQuery}
        placeholder="Search users or hashtags..."
      />

      {search.type === 'users' && (
        <UserResults users={search.results.users} />
      )}

      {search.type === 'hashtags' && (
        <HashtagResults posts={search.results.posts} />
      )}
    </>
  );
}
```

---

## API Reference

### Hooks

#### useSearch

Unified search hook with type switching and debouncing.

```typescript
interface SearchConfig {
  type?: SearchType;        // 'users' | 'hashtags' | 'all'
  debounce?: number;        // Debounce delay in ms (default: 300)
  minLength?: number;       // Minimum query length (default: 2)
  enabled?: boolean;        // Enable/disable search
}

interface Search {
  query: string;
  setQuery: (query: string) => void;
  type: SearchType;
  setType: (type: SearchType) => void;
  results: SearchResults;
  isSearching: boolean;
  error: Error | null;
  clear: () => void;
}

const search = useSearch(config?: SearchConfig): Search;
```

**Example:**

```typescript
const search = useSearch({
  type: 'users',
  debounce: 500,
  minLength: 3,
});

// Use search
search.setQuery('alice');
console.log(search.results.users);

// Switch type
search.setType('hashtags');
```

#### useUserSearch

Focused hook for user search.

```typescript
interface UserSearch {
  results: UserSearchResult[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const userSearch = useUserSearch(query: string): UserSearch;
```

**Example:**

```typescript
const { results, isLoading } = useUserSearch('bob');

// results: [{ pub, alias, name, avatar, bio }, ...]
```

#### useHashtagSearch

Focused hook for hashtag search.

```typescript
interface HashtagSearch {
  refs: HashtagRef[];
  posts: Post[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const hashtagSearch = useHashtagSearch(tag: string): HashtagSearch;
```

**Example:**

```typescript
const { posts, isLoading } = useHashtagSearch('crypto');

// posts: [{ id, type, content, author, ... }, ...]
```

---

### Functions

#### searchUsers

Search the public user profile index.

```typescript
async function searchUsers(query: string): Promise<UserSearchResult[]>

interface UserSearchResult {
  pub: string;           // Public key
  alias: string;         // Username
  name?: string;         // Display name
  avatar?: string;       // Avatar URL
  bio?: string;          // Bio/description
}
```

**Example:**

```typescript
import { searchUsers } from '@ariob/ripple';

const users = await searchUsers('alice');
// [{ pub: 'abc123...', alias: 'alice', name: 'Alice Smith', ... }]
```

#### searchByHashtag

Search posts by hashtag from the hashtag index.

```typescript
async function searchByHashtag(tag: string): Promise<HashtagRef[]>

interface HashtagRef {
  postId: string;        // Post ID
  postAuthor: string;    // Author's public key
  created: number;       // Timestamp
}
```

**Example:**

```typescript
import { searchByHashtag } from '@ariob/ripple';

const refs = await searchByHashtag('ripple');
// [{ postId: 'post-123', postAuthor: 'pub-456', created: 1699900000 }]
```

#### fetchPostsFromRefs

Fetch full post data from hashtag references.

```typescript
async function fetchPostsFromRefs(refs: HashtagRef[]): Promise<Post[]>
```

**Example:**

```typescript
import { searchByHashtag, fetchPostsFromRefs } from '@ariob/ripple';

const refs = await searchByHashtag('defi');
const posts = await fetchPostsFromRefs(refs);
// Full Post objects with content, images, etc.
```

#### extractHashtags

Parse hashtags from text content.

```typescript
function extractHashtags(text: string): string[]
```

**Example:**

```typescript
import { extractHashtags } from '@ariob/ripple';

const tags = extractHashtags('Hello #world! Check out #ariob and #ripple');
// ['world', 'ariob', 'ripple']
```

#### extractMentions

Parse @mentions from text content.

```typescript
function extractMentions(text: string): string[]
```

**Example:**

```typescript
import { extractMentions } from '@ariob/ripple';

const mentions = extractMentions('Hey @alice and @bob!');
// ['alice', 'bob']
```

---

### Indexing Functions

#### indexMyProfile

Index the current user's profile for discoverability.

```typescript
async function indexMyProfile(profile: PublicProfile): Promise<void>

interface PublicProfile {
  pub: string;           // Public key
  alias: string;         // Username
  name?: string;         // Display name
  avatar?: string;       // Avatar URL
  bio?: string;          // Bio/description
  indexed: number;       // Timestamp
}
```

**Example:**

```typescript
import { indexMyProfile } from '@ariob/ripple';

await indexMyProfile({
  pub: myPublicKey,
  alias: 'alice',
  name: 'Alice Smith',
  bio: 'Building on Gun',
  indexed: Date.now(),
});
```

#### indexPostHashtags

Index a post's hashtags for search.

```typescript
async function indexPostHashtags(post: Post): Promise<void>
```

**Example:**

```typescript
import { indexPostHashtags } from '@ariob/ripple';

// After creating a post
const post = await createPost({
  content: 'Hello #world #ariob!',
  author: myPublicKey,
});

await indexPostHashtags(post);
// Now searchable by #world and #ariob
```

---

## Data Structures

### UserSearchResult

```typescript
import { UserSearchResultSchema, type UserSearchResult } from '@ariob/ripple';

// Schema
const UserSearchResultSchema = z.object({
  pub: z.string(),
  alias: z.string(),
  name: z.string().optional(),
  avatar: z.string().optional(),
  bio: z.string().optional(),
});

// Type
interface UserSearchResult {
  pub: string;
  alias: string;
  name?: string;
  avatar?: string;
  bio?: string;
}
```

### HashtagRef

```typescript
import { HashtagRefSchema, type HashtagRef } from '@ariob/ripple';

// Schema
const HashtagRefSchema = z.object({
  postId: z.string(),
  postAuthor: z.string(),
  created: z.number(),
});

// Type
interface HashtagRef {
  postId: string;
  postAuthor: string;
  created: number;
}
```

### PublicProfile

```typescript
import { PublicProfileSchema, type PublicProfile } from '@ariob/ripple';

// Schema
const PublicProfileSchema = z.object({
  pub: z.string(),
  alias: z.string(),
  name: z.string().optional(),
  avatar: z.string().optional(),
  bio: z.string().optional(),
  indexed: z.number(),
});

// Type
interface PublicProfile {
  pub: string;
  alias: string;
  name?: string;
  avatar?: string;
  bio?: string;
  indexed: number;
}
```

---

## Architecture

### Index Structure

```
Gun Database
├── public/
│   ├── profiles/
│   │   ├── {pubKey1}/
│   │   │   └── { alias, name, avatar, bio, indexed }
│   │   ├── {pubKey2}/
│   │   └── ...
│   │
│   └── hashtags/
│       ├── {tag1}/
│       │   ├── {postId1}: { postAuthor, created }
│       │   └── {postId2}: { postAuthor, created }
│       ├── {tag2}/
│       └── ...
│
├── users/
│   └── {pubKey}/
│       └── posts/
│           └── {postId}: { content, created, ... }
```

### Search Flow

```
User Input: "alice"
    │
    ▼
useUserSearch('alice')
    │
    ▼
searchUsers('alice')
    │
    ▼
Gun.get('public/profiles')
    .map()
    .filter(profile => profile.alias.includes('alice'))
    │
    ▼
Return: UserSearchResult[]
```

```
User Input: "#ripple"
    │
    ▼
useHashtagSearch('ripple')
    │
    ▼
searchByHashtag('ripple')
    │
    ▼
Gun.get('public/hashtags/ripple')
    .map()
    │
    ▼
HashtagRef[]
    │
    ▼
fetchPostsFromRefs(refs)
    │
    ▼
For each ref:
    Gun.get(`users/${ref.postAuthor}/posts/${ref.postId}`)
    │
    ▼
Return: Post[]
```

---

## Best Practices

### 1. Index on Create

Always index content when creating:

```typescript
async function createAndIndexPost(content: string) {
  // 1. Create the post
  const post = await createPost({
    content,
    author: myPublicKey,
  });

  // 2. Index hashtags for search
  await indexPostHashtags(post);

  return post;
}
```

### 2. Debounce User Input

Use debouncing to avoid excessive queries:

```typescript
const search = useSearch({
  debounce: 300, // Wait 300ms after typing stops
  minLength: 2,  // Don't search single characters
});
```

### 3. Handle Race Conditions

The hooks handle race conditions internally, but for manual usage:

```typescript
let currentSearch = 0;

async function search(query: string) {
  const thisSearch = ++currentSearch;

  const results = await searchUsers(query);

  // Ignore if a newer search started
  if (thisSearch !== currentSearch) return;

  setResults(results);
}
```

### 4. Profile Updates

Re-index profile when it changes:

```typescript
async function updateProfile(updates: Partial<PublicProfile>) {
  // 1. Update in Gun
  await updateUserProfile(updates);

  // 2. Re-index for search
  await indexMyProfile({
    ...currentProfile,
    ...updates,
    indexed: Date.now(),
  });
}
```

---

## Limitations

1. **Case Sensitivity**: Searches are case-insensitive for aliases but may be case-sensitive for content.

2. **Partial Matches**: User search supports partial matches; hashtag search requires exact tags.

3. **Index Freshness**: Indexes update when content is created. Deleted content may remain indexed until the index is rebuilt.

4. **Query Complexity**: Simple prefix/substring matching only. No fuzzy matching or relevance scoring.

---

## Related Documentation

- [Hooks Reference](./HOOKS.md) - All React hooks
- [Schemas](./API.md) - Data validation schemas
- [Architecture](./ARCHITECTURE.md) - System design
