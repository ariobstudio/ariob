# Five Degrees of Visibility

The core concept behind Ripple's content organization.

---

## Overview

The Five Degrees of Visibility organize content by social proximity - how close the author is to you in the social graph. Each degree has:

- A **name** describing the relationship
- A **color** for visual identification
- **Feed behavior** appropriate to the trust level
- **UI adaptations** based on context

---

## The Degrees

| Degree | Name | Color | Description |
|--------|------|-------|-------------|
| 0 | **Me** | Pink `#FF6B9D` | Your own content |
| 1 | **Friends** | Cyan `#00E5FF` | Direct connections |
| 2 | **World** | Purple `#7C4DFF` | Friends-of-friends |
| 3 | **Discover** | Amber `#FFC107` | Algorithmic |
| 4 | **Noise** | Gray `#78909C` | Unfiltered |

---

## Degree 0: Me

**Your personal space.**

### Content Types
- Your posts and drafts
- Private notes
- Personal media
- Profile settings

### UI Behavior
- Full edit access
- Delete capabilities
- Draft management
- Private/public toggles

### Color Usage
```typescript
theme.colors.degree[0] // #FF6B9D (pink)
```

### Example
```typescript
<Dot color={theme.colors.degree[0]} />
<Badge label="ME" tint="default" />
```

---

## Degree 1: Friends

**Direct connections you trust.**

### Content Types
- Posts from people you follow
- Direct messages
- Friend activity
- Shared content

### UI Behavior
- Reply, react, save
- Message directly
- Trust indicators shown
- Real-time updates

### Color Usage
```typescript
theme.colors.degree[1] // #00E5FF (cyan/bioluminescent)
```

### Trust Level
Content from friends is considered trusted. The UI shows:
- Verified badges
- Activity status
- Read receipts (in DMs)

### Example
```typescript
<Dot color={theme.colors.degree[1]} />
<Text color="accent">Friend</Text>
```

---

## Degree 2: World

**Extended network - friends of friends.**

### Content Types
- Posts from mutual connections
- Public content from verified users
- Trending within network
- Recommendations based on friends

### UI Behavior
- Follow suggestions
- "Via [friend]" attribution
- Trust score indicators
- Limited interaction options

### Color Usage
```typescript
theme.colors.degree[2] // #7C4DFF (purple)
```

### Trust Level
Lower trust than friends, but higher than strangers:
- Shows mutual connections
- Verification status visible
- Content may be filtered

### Example
```typescript
<Row gap="xs">
  <Dot color={theme.colors.degree[2]} />
  <Text size="caption" color="dim">Via @alice</Text>
</Row>
```

---

## Degree 3: Discover

**Algorithmic recommendations.**

### Content Types
- Trending topics
- Suggested accounts
- Curated content
- Interest-based feeds

### UI Behavior
- "Suggested for you" labels
- Follow prompts
- Feedback mechanisms (hide, not interested)
- Explore features

### Color Usage
```typescript
theme.colors.degree[3] // #FFC107 (amber)
```

### Trust Level
Content selected by algorithms:
- Clear labeling as algorithmic
- Source transparency
- Easy to dismiss/hide

### Example
```typescript
<Card>
  <Row gap="sm">
    <Dot color={theme.colors.degree[3]} />
    <Text size="caption" color="dim">Suggested for you</Text>
  </Row>
  <Post data={suggestedPost} />
</Card>
```

---

## Degree 4: Noise

**Unfiltered, raw content.**

### Content Types
- Global public feed
- Unverified content
- Anonymous posts
- Raw mesh data

### UI Behavior
- Strong warnings
- Limited interactions
- Report/block prominent
- Requires explicit opt-in

### Color Usage
```typescript
theme.colors.degree[4] // #78909C (gray)
```

### Trust Level
Lowest trust - use with caution:
- No verification
- Content warnings
- Spam filtering active
- Manual moderation needed

### Example
```typescript
<View style={{ opacity: 0.7 }}>
  <Row gap="sm">
    <Dot color={theme.colors.degree[4]} />
    <Text size="caption" color="faint">Public • Unverified</Text>
  </Row>
  <Post data={publicPost} />
</View>
```

---

## Feed Configuration by Degree

Each degree can have different action bar configurations:

```typescript
const feedConfig = createFeedConfigs({
  0: {
    main: 'post',           // Create post
    left: 'config',         // Settings
    right: 'more',          // Options
  },
  1: {
    main: 'post',           // Create post
    left: 'dm',             // Direct messages
    right: 'find',          // Find friends
  },
  2: {
    main: 'post',
    left: 'trend',          // Trending
    right: 'search',        // Search
  },
  3: {
    main: 'discover',       // Explore action
    right: 'filter',        // Filter options
  },
  4: {
    main: 'post',           // Still can post
    right: 'filter',        // Heavy filtering
  },
});
```

---

## UI Components

### Degree Filter

Allow users to switch between degrees:

```typescript
function DegreeFilter({ value, onChange }) {
  const { theme } = useUnistyles();

  return (
    <Row gap="sm">
      {[0, 1, 2, 3, 4].map((degree) => (
        <Press
          key={degree}
          onPress={() => onChange(degree)}
          haptic={value === degree ? 'none' : 'light'}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: value === degree
                ? theme.colors.degree[degree]
                : theme.colors.surface,
              borderWidth: 2,
              borderColor: theme.colors.degree[degree],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              size="caption"
              color={value === degree ? 'text' : 'dim'}
            >
              {degree}
            </Text>
          </View>
        </Press>
      ))}
    </Row>
  );
}
```

### Degree Indicator

Show the degree of a piece of content:

```typescript
function DegreeIndicator({ degree }) {
  const labels = ['Me', 'Friends', 'World', 'Discover', 'Noise'];
  const { theme } = useUnistyles();

  return (
    <Row gap="xs" align="center">
      <Dot color={theme.colors.degree[degree]} />
      <Text size="caption" color="dim">
        {labels[degree]}
      </Text>
    </Row>
  );
}
```

### Degree-Aware Card

```typescript
function DegreeCard({ item }) {
  const { theme } = useUnistyles();
  const degree = item.degree ?? 4;

  // Reduce opacity for lower trust content
  const opacity = degree >= 3 ? 0.85 : 1;

  return (
    <Card
      style={{
        opacity,
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.degree[degree],
      }}
    >
      <DegreeIndicator degree={degree} />
      <Post data={item} />

      {degree === 4 && (
        <Row gap="xs" style={{ marginTop: 8 }}>
          <Icon name="warning" size="sm" color="warn" />
          <Text size="caption" color="warn">
            Unverified content
          </Text>
        </Row>
      )}
    </Card>
  );
}
```

---

## Degree in the Graph

The degree is calculated based on graph distance:

```
You (Degree 0)
  ↓
Your Keys → Your Posts (Degree 0)
  ↓
You Follow → Their Posts (Degree 1)
  ↓
They Follow → Those Posts (Degree 2)
  ↓
Algorithm → Suggested Posts (Degree 3)
  ↓
Public Mesh → Everything Else (Degree 4)
```

---

## Best Practices

### Trust Indicators

Always show users why content is in their feed:

```typescript
// Degree 1
<Text size="caption">From @friend</Text>

// Degree 2
<Text size="caption">Via @mutual • 3 mutual friends</Text>

// Degree 3
<Text size="caption">Suggested based on your interests</Text>

// Degree 4
<Text size="caption">Public • Not verified</Text>
```

### Progressive Disclosure

Lower degree = more features:

```typescript
const canReply = degree <= 2;
const canDM = degree <= 1;
const canEdit = degree === 0;

<Row gap="sm">
  {canReply && <IconButton icon="chatbubble" onPress={reply} />}
  {canDM && <IconButton icon="mail" onPress={dm} />}
  {canEdit && <IconButton icon="pencil" onPress={edit} />}
</Row>
```

### Content Warnings

Higher degrees need more caution:

```typescript
function ContentGuard({ degree, children }) {
  if (degree >= 4) {
    return (
      <Stack gap="sm">
        <Card variant="outline">
          <Row gap="sm" align="center">
            <Icon name="shield-checkmark" color="warn" />
            <Text color="warn">
              This content is from an unverified source
            </Text>
          </Row>
          <Button size="sm" variant="ghost" onPress={showContent}>
            Show anyway
          </Button>
        </Card>
      </Stack>
    );
  }

  return children;
}
```
