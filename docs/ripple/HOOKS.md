# Hooks

React hooks for feed management and navigation.

---

## Overview

| Hook | Purpose |
|------|---------|
| [useFeed](#usefeed) | Subscribe to feed data |
| [useNodeNavigation](#usenodenavigation) | Node-aware navigation |
| [useFeedConfig](#usefeedconfig) | Get degree feed config |
| [useNodeMenu](#usenodemenu) | Get node type menu |
| [useAction](#useaction) | Get single action |

---

## useFeed

Subscribe to and manage feed data from the graph.

### Import

```typescript
import { useFeed } from '@ariob/ripple';
```

### API

```typescript
const feed = useFeed(options: FeedOptions);

interface FeedOptions {
  degree?: number;          // Filter by degree (0-4)
  type?: string;            // Filter by node type
  limit?: number;           // Max items (default: 50)
  enabled?: boolean;        // Enable subscription (default: true)
}

interface FeedResult {
  items: FeedItem[];        // Feed items
  loading: boolean;         // Initial load state
  refreshing: boolean;      // Pull-to-refresh state
  error: Error | null;      // Error state
  hasMore: boolean;         // More items available
  refresh: () => void;      // Trigger refresh
  loadMore: () => void;     // Load more items
  post: (content: string) => Promise<void>;  // Post new content
}
```

### Example

```typescript
function FeedScreen() {
  const [degree, setDegree] = useState(1);

  const {
    items,
    loading,
    refreshing,
    error,
    refresh,
    loadMore,
    post,
  } = useFeed({ degree, limit: 30 });

  if (loading) return <Ghost message="Loading..." />;
  if (error) return <Ghost message="Error loading feed" />;

  return (
    <FlatList
      data={items}
      renderItem={({ item }) => (
        <Shell nodeRef={{ id: item.id, type: item.type }}>
          <Post data={item} />
        </Shell>
      )}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} />
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
    />
  );
}
```

### With Degree Filtering

```typescript
function FilteredFeed() {
  const [degree, setDegree] = useState(1);
  const { items, loading } = useFeed({ degree });

  return (
    <>
      <DegreeFilter value={degree} onChange={setDegree} />
      <FeedList items={items} loading={loading} />
    </>
  );
}
```

### Posting Content

```typescript
function ComposeScreen() {
  const { post } = useFeed({ enabled: false }); // Don't subscribe
  const [content, setContent] = useState('');

  const handleSubmit = async () => {
    await post(content);
    router.back();
  };

  return (
    <Stack gap="md">
      <Input
        value={content}
        onChangeText={setContent}
        multiline
        placeholder="What's happening?"
      />
      <Button onPress={handleSubmit} disabled={!content.trim()}>
        Post
      </Button>
    </Stack>
  );
}
```

---

## useNodeNavigation

Navigation helpers for node-centric routing.

### Import

```typescript
import { useNodeNavigation } from '@ariob/ripple';
```

### API

```typescript
const nav = useNodeNavigation();

interface NodeNavigation {
  navigate: (id: string, mode: ViewMode) => void;
  back: () => void;
  toProfile: (userId: string) => void;
  toThread: (postId: string) => void;
  toMessage: (userId: string) => void;
}

type ViewMode = 'feed' | 'detail' | 'full';
```

### Example

```typescript
function PostCard({ post }) {
  const { navigate, toProfile } = useNodeNavigation();

  return (
    <View>
      <Press onPress={() => toProfile(post.author.id)}>
        <Avatar char={post.author.name[0]} />
        <Text>{post.author.name}</Text>
      </Press>

      <Press onPress={() => navigate(post.id, 'detail')}>
        <Text>{post.content}</Text>
      </Press>
    </View>
  );
}
```

### Navigation Methods

```typescript
const { navigate, back, toProfile, toThread, toMessage } = useNodeNavigation();

// Navigate to any node with view mode
navigate('post-123', 'detail');  // → /thread/post-123
navigate('post-123', 'full');    // → /post/post-123

// Go back
back();  // Router.back() with fallback

// Specific navigations
toProfile('user-456');   // → /user/user-456
toThread('post-123');    // → /thread/post-123
toMessage('user-456');   // → /message/user-456
```

### With Safe Back

```typescript
function ThreadScreen() {
  const { back } = useNodeNavigation();
  const navigation = useNavigation();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      back();
    } else {
      router.replace('/');
    }
  };

  return (
    <View>
      <IconButton icon="arrow-back" onPress={handleBack} />
      {/* ... */}
    </View>
  );
}
```

---

## useFeedConfig

Get the action bar configuration for a degree.

### Import

```typescript
import { useFeedConfig } from '@ariob/ripple';
```

### API

```typescript
const config = useFeedConfig(degree: number);

interface FeedConfig {
  main?: string;                // Primary action
  mainUnauthenticated?: string; // When not logged in
  left?: string;                // Left action
  right?: string;               // Right action
}
```

### Example

```typescript
function FeedBar({ degree }) {
  const config = useFeedConfig(degree);

  return (
    <Row justify="between">
      {config.left && <ActionButton action={config.left} />}
      {config.main && <ActionButton action={config.main} primary />}
      {config.right && <ActionButton action={config.right} />}
    </Row>
  );
}
```

### With Auth State

```typescript
function DynamicFeedBar({ degree }) {
  const config = useFeedConfig(degree);
  const { user } = useAuth();

  const mainAction = user ? config.main : config.mainUnauthenticated;

  return (
    <Row justify="center">
      <ActionButton action={mainAction} primary />
    </Row>
  );
}
```

---

## useNodeMenu

Get the menu configuration for a node type.

### Import

```typescript
import { useNodeMenu } from '@ariob/ripple';
```

### API

```typescript
const menu = useNodeMenu(type: string);

interface NodeMenuConfig {
  quick?: string[];   // Quick actions (swipe)
  detail?: string[];  // Detail view actions
  opts?: string[];    // Options menu
}
```

### Example

```typescript
function NodeActions({ type, mode }) {
  const menu = useNodeMenu(type);

  const actions = mode === 'detail'
    ? menu.detail
    : menu.quick;

  return (
    <Row gap="sm">
      {actions?.map((action) => (
        <ActionButton key={action} action={action} />
      ))}
    </Row>
  );
}
```

### Context Menu Integration

```typescript
function ContextMenu({ nodeRef, visible }) {
  const menu = useNodeMenu(nodeRef.type);
  const allActions = useActions();

  if (!visible) return null;

  return (
    <Card>
      {menu.quick?.map((actionName) => {
        const action = allActions[actionName];
        return (
          <Press key={actionName} onPress={() => handleAction(actionName)}>
            <Row gap="sm">
              <Icon name={action.icon} />
              <Text>{action.label}</Text>
            </Row>
          </Press>
        );
      })}

      <Divider />

      {menu.opts?.map((actionName) => {
        const action = allActions[actionName];
        return (
          <Press key={actionName} onPress={() => handleAction(actionName)}>
            <Row gap="sm">
              <Icon name={action.icon} color={action.danger ? 'danger' : 'text'} />
              <Text color={action.danger ? 'danger' : 'text'}>{action.label}</Text>
            </Row>
          </Press>
        );
      })}
    </Card>
  );
}
```

---

## useAction

Get a single action definition.

### Import

```typescript
import { useAction } from '@ariob/ripple';
```

### API

```typescript
const action = useAction(name: string);

interface Action {
  name: string;
  icon: string;
  label: string;
  sub?: SubAction[];
}
```

### Example

```typescript
function ActionButton({ actionName, onPress }) {
  const action = useAction(actionName);

  if (!action) return null;

  return (
    <Press onPress={() => onPress(action.name)}>
      <Row gap="xs" align="center">
        <Icon name={action.icon} />
        <Text>{action.label}</Text>
      </Row>
    </Press>
  );
}
```

### With Submenu

```typescript
function ActionWithSub({ actionName }) {
  const action = useAction(actionName);
  const [showSub, setShowSub] = useState(false);

  if (!action) return null;

  if (action.sub) {
    return (
      <>
        <Press onPress={() => setShowSub(!showSub)}>
          <Row gap="xs">
            <Icon name={action.icon} />
            <Text>{action.label}</Text>
            <Icon name={showSub ? 'chevron-up' : 'chevron-down'} size="sm" />
          </Row>
        </Press>

        {showSub && (
          <Stack gap="xs" style={{ paddingLeft: 16 }}>
            {action.sub.map((sub) => (
              <Press key={sub.name} onPress={() => handleAction(sub.name)}>
                <Row gap="xs">
                  <Icon name={sub.icon} size="sm" />
                  <Text size="caption">{sub.label}</Text>
                </Row>
              </Press>
            ))}
          </Stack>
        )}
      </>
    );
  }

  return (
    <Press onPress={() => handleAction(action.name)}>
      <Row gap="xs">
        <Icon name={action.icon} />
        <Text>{action.label}</Text>
      </Row>
    </Press>
  );
}
```

---

## Hook Composition

### Feed Screen with All Hooks

```typescript
function FeedScreen() {
  const [degree, setDegree] = useState(1);

  // Data
  const { items, loading, refresh, refreshing } = useFeed({ degree });

  // Navigation
  const { toThread, toProfile } = useNodeNavigation();

  // Config
  const feedConfig = useFeedConfig(degree);

  // Render
  return (
    <View style={{ flex: 1 }}>
      <DegreeFilter value={degree} onChange={setDegree} />

      <FlatList
        data={items}
        renderItem={({ item }) => (
          <Shell nodeRef={{ id: item.id, type: item.type }}>
            <Post
              data={item}
              onPress={() => toThread(item.id)}
              onAvatarPress={() => toProfile(item.author.id)}
            />
          </Shell>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
        ListEmptyComponent={
          loading ? <Ghost message="Loading..." /> : <Ghost message="No posts" />
        }
      />
    </View>
  );
}
```
