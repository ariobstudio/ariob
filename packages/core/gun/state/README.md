# Gun State

Reactive state management using Zustand with real-time Gun.js synchronization.

## Overview

Provides Zustand stores that automatically sync with Gun.js.

- Real-time data synchronization
- Automatic loading and error states
- Optimistic updates
- React integration
- TypeScript support

## Core Stores

### Thing Store

Create reactive stores for any schema:

```typescript
import { createThingStore, make } from '@ariob/core';
import { z } from 'zod';

// Define schema
const ProjectSchema = ThingSchema.extend({
  name: z.string(),
  status: z.enum(['planning', 'active', 'completed']),
});

// Create service and store
const projectService = make(ProjectSchema, 'projects');
const useProjectStore = createThingStore(projectService, 'ProjectStore');

// Use in component
function ProjectList() {
  const { items, isLoading, error, create, fetchAll } = useProjectStore();

  useEffect(() => {
    fetchAll();
  }, []);

  const handleCreate = async () => {
    const result = await create({
      name: 'New Project',
      status: 'planning',
    });

    result.match(
      (project) => console.log('Created:', project),
      (error) => alert(error.message)
    );
  };

  if (isLoading) return <text>Loading...</text>;
  if (error) return <text>Error: {error.message}</text>;

  return (
    <view>
      <view bindtap={handleCreate}><text>+ New Project</text></view>
      {items.map(project => (
        <text key={project.id}>{project.name}</text>
      ))}
    </view>
  );
}
```

### Who Store

Authentication state management:

```typescript
import { useWhoStore } from '@ariob/core';

function AuthStatus() {
  const { user, isLoading, init, logout } = useWhoStore();

  useEffect(() => {
    init();
  }, []);

  if (isLoading) return <text>Checking auth...</text>;

  if (user) {
    return (
      <view>
        <text>Logged in as: {user.alias}</text>
        <view bindtap={logout}><text>Logout</text></view>
      </view>
    );
  }

  return <LoginForm />;
}
```

## Store API

### Thing Store Interface

```typescript
interface ThingStore<T> {
  // State
  items: T[];
  byId: Record<string, T>;
  isLoading: boolean;
  error: AppError | null;

  // Actions
  create(data: any): Promise<Result<T, AppError>>;
  update(id: string, updates: any): Promise<Result<T | null, AppError>>;
  remove(id: string): Promise<Result<boolean, AppError>>;
  fetchAll(): Promise<Result<T[], AppError>>;
  fetchById(id: string): Promise<Result<T | null, AppError>>;
  watch(id: string): () => void;
  cleanup(): void;
}
```

### Who Store Interface

```typescript
interface WhoStore {
  // State
  user: Who | null;
  isLoading: boolean;
  error: AppError | null;

  // Actions
  init(): Promise<Result<Who | null, AppError>>;
  signup(authRequest: AuthRequest): Promise<Result<Who, AppError>>;
  login(authRequest: AuthRequest): Promise<Result<Who, AppError>>;
  logout(): void;
}
```

## Advanced Patterns

### Optimistic Updates

```typescript
function TodoItem({ todoId }) {
  const store = useTodoStore();
  const todo = store.byId[todoId];
  const [optimisticState, setOptimisticState] = useState({});

  const handleToggle = async () => {
    const newValue = !todo.completed;

    // Update UI immediately
    setOptimisticState({ completed: newValue });

    // Sync with Gun
    const result = await store.update(todoId, { completed: newValue });

    if (result.isErr()) {
      // Revert on error
      setOptimisticState({});
      alert('Failed to update');
    }
  };

  const displayTodo = { ...todo, ...optimisticState };

  return (
    <view bindtap={handleToggle}>
      <text>{displayTodo.completed ? '☑' : '☐'} {displayTodo.text}</text>
    </view>
  );
}
```

### Computed Values

```typescript
function createEnhancedTodoStore() {
  const baseStore = createThingStore(todoService, 'TodoStore');

  return () => {
    const store = baseStore();

    // Add computed values
    const completedCount = store.items.filter(t => t.completed).length;
    const activeCount = store.items.length - completedCount;

    return {
      ...store,
      completedCount,
      activeCount,
    };
  };
}
```

### Store Composition

```typescript
function useAppState() {
  const auth = useWhoStore();
  const projects = useProjectStore();
  const todos = useTodoStore();

  // Compute derived state
  const userProjects = projects.items.filter(
    p => p.members.includes(auth.user?.pub || '')
  );

  const userTodos = todos.items.filter(
    t => t.userId === auth.user?.pub
  );

  return {
    user: auth.user,
    isAuthenticated: !!auth.user,
    userProjects,
    userTodos,
    isLoading: auth.isLoading || projects.isLoading || todos.isLoading,
  };
}
```

## Best Practices

1. **Initialize early** - Call `fetchAll()` in component mount
2. **Handle all states** - Check loading and error states
3. **Use real-time wisely** - Only watch displayed data
4. **Clean up** - Stores handle subscriptions automatically
5. **Leverage TypeScript** - Use type inference
6. **Keep stores focused** - One store per domain concept

## Performance Tips

1. **Use byId for lookups** instead of filtering
2. **Memoize filtered lists** with useMemo
3. **Implement virtual scrolling** for large lists
4. **Debounce rapid updates**
5. **Use optimistic updates** for better UX

## See Also

- [Gun Module](../README.md) - Gun.js integration
- [Hooks Module](../hooks/README.md) - React hooks
- [Services Module](../services/README.md) - Business logic
- [Main Documentation](../../README.md) - Package overview
