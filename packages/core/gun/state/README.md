# Gun State Management

Reactive state management for Gun.js using Zustand with real-time synchronization.

## Overview

The state module provides reactive stores that:

- **Sync with Gun.js** in real-time
- **Handle loading and error states** automatically
- **Provide optimistic updates** for better UX
- **Work seamlessly with ReactLynx** components
- **Support TypeScript** with full type inference

## Core Stores

### Thing Store

Create reactive stores for any Thing-based schema:

```typescript
import { createThingStore, make } from '@ariob/core';
import { z } from 'zod';

// Define your schema
const ProjectSchema = ThingSchema.extend({
  name: z.string(),
  description: z.string(),
  status: z.enum(['planning', 'active', 'completed', 'archived']),
  members: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

// Create service and store
const projectService = make(ProjectSchema, 'projects');
const useProjectStore = createThingStore(projectService, 'ProjectStore');

// Use in ReactLynx component
function ProjectList() {
  const { items, isLoading, error, create, fetchAll } = useProjectStore();
  
  useEffect(() => {
    fetchAll();
  }, []);
  
  const handleCreateProject = async () => {
    const result = await create({
      name: 'New Project',
      description: '',
      status: 'planning',
    });
    
    result.match(
      (project) => console.log('Created:', project),
      (error) => alert(error.message)
    );
  };
  
  if (isLoading) return <text>Loading projects...</text>;
  if (error) return <text>Error: {error.message}</text>;
  
  return (
    <view className="project-list">
      <view className="header">
        <text className="title">Projects</text>
        <view className="create-btn" bindtap={handleCreateProject}>
          <text>+ New Project</text>
        </view>
      </view>
      
      {items.map(project => (
        <ProjectCard key={project.id} project={project} />
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
  const { user, isLoading, error, init, logout } = useWhoStore();
  
  useEffect(() => {
    // Initialize auth on mount
    init();
  }, []);
  
  if (isLoading) return <text>Checking auth...</text>;
  
  if (user) {
    return (
      <view className="auth-status">
        <text>Logged in as: {user.alias}</text>
        <view className="logout-btn" bindtap={logout}>
          <text>Logout</text>
        </view>
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
  items: T[];                    // All items
  byId: Record<string, T>;       // Items indexed by ID
  isLoading: boolean;            // Loading state
  error: AppError | null;        // Error state
  
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
  user: Who | null;              // Current user
  isLoading: boolean;            // Loading state
  error: AppError | null;        // Error state
  
  // Actions
  init(): Promise<Result<Who | null, AppError>>;
  signup(authRequest: AuthRequest): Promise<Result<Who, AppError>>;
  login(authRequest: AuthRequest): Promise<Result<Who, AppError>>;
  logout(): void;
}
```

## Complete Examples

### Real-time Todo App

```typescript
import { createThingStore, make, ThingSchema, useWho } from '@ariob/core';
import { z } from 'zod';
import { useState, useEffect } from '@lynx-js/react';

// Todo schema
const TodoSchema = ThingSchema.extend({
  text: z.string(),
  completed: z.boolean().default(false),
  userId: z.string(),
  listId: z.string().optional(),
  dueDate: z.number().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

type Todo = z.infer<typeof TodoSchema>;

// Create service and store
const todoService = make(TodoSchema, 'todos');
const useTodoStore = createThingStore(todoService, 'TodoStore');

// Main App
function TodoApp() {
  const { user } = useWho();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  
  if (!user) return <LoginScreen />;
  
  return (
    <view className="todo-app">
      <TodoHeader />
      <TodoInput userId={user.pub} />
      <TodoFilters filter={filter} onChange={setFilter} />
      <TodoList userId={user.pub} filter={filter} />
      <TodoStats userId={user.pub} />
    </view>
  );
}

// Todo Input Component
function TodoInput({ userId }: { userId: string }) {
  const { create } = useTodoStore();
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Todo['priority']>('medium');
  
  const handleSubmit = async () => {
    if (!text.trim()) return;
    
    const result = await create({
      text: text.trim(),
      userId,
      priority,
      completed: false,
    });
    
    if (result.isOk()) {
      setText('');
      setPriority('medium');
    }
  };
  
  return (
    <view className="todo-input">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What needs to be done?"
        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
      />
      <select 
        value={priority}
        onChange={(e) => setPriority(e.target.value as Todo['priority'])}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <view className="add-btn" bindtap={handleSubmit}>
        <text>Add</text>
      </view>
    </view>
  );
}

// Todo List Component
function TodoList({ userId, filter }: { userId: string; filter: string }) {
  const store = useTodoStore();
  const { items, isLoading, fetchAll } = store;
  
  useEffect(() => {
    fetchAll();
  }, []);
  
  // Filter todos
  const filteredTodos = items
    .filter(todo => todo.userId === userId)
    .filter(todo => {
      if (filter === 'active') return !todo.completed;
      if (filter === 'completed') return todo.completed;
      return true;
    })
    .sort((a, b) => {
      // Sort by priority, then by creation date
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.createdAt - a.createdAt;
    });
  
  if (isLoading) return <text>Loading todos...</text>;
  
  return (
    <view className="todo-list">
      {filteredTodos.length === 0 ? (
        <text className="empty">No todos found</text>
      ) : (
        filteredTodos.map(todo => (
          <TodoItem key={todo.id} todoId={todo.id} />
        ))
      )}
    </view>
  );
}

// Individual Todo Item
function TodoItem({ todoId }: { todoId: string }) {
  const store = useTodoStore();
  const todo = store.byId[todoId];
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  
  // Watch for real-time updates
  useEffect(() => {
    const unsubscribe = store.watch(todoId);
    return unsubscribe;
  }, [todoId]);
  
  if (!todo) return null;
  
  const handleToggle = () => {
    store.update(todoId, { completed: !todo.completed });
  };
  
  const handleEdit = () => {
    setEditText(todo.text);
    setIsEditing(true);
  };
  
  const handleSave = () => {
    if (editText.trim() && editText !== todo.text) {
      store.update(todoId, { text: editText.trim() });
    }
    setIsEditing(false);
  };
  
  const handleDelete = () => {
    if (confirm('Delete this todo?')) {
      store.remove(todoId);
    }
  };
  
  const priorityColors = {
    low: 'priority-low',
    medium: 'priority-medium',
    high: 'priority-high',
  };
  
  return (
    <view className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <view className={`priority-indicator ${priorityColors[todo.priority]}`} />
      
      <view className="todo-checkbox" bindtap={handleToggle}>
        <text>{todo.completed ? '☑' : '☐'}</text>
      </view>
      
      {isEditing ? (
        <input
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleSave}
          onKeyPress={(e) => e.key === 'Enter' && handleSave()}
          className="edit-input"
          autoFocus
        />
      ) : (
        <text 
          className={`todo-text ${todo.completed ? 'line-through' : ''}`}
          bindtap={handleEdit}
        >
          {todo.text}
        </text>
      )}
      
      <view className="todo-actions">
        <view className="delete-btn" bindtap={handleDelete}>
          <text>×</text>
        </view>
      </view>
    </view>
  );
}

// Todo Stats Component
function TodoStats({ userId }: { userId: string }) {
  const { items } = useTodoStore();
  
  const userTodos = items.filter(todo => todo.userId === userId);
  const completed = userTodos.filter(todo => todo.completed).length;
  const active = userTodos.length - completed;
  
  return (
    <view className="todo-stats">
      <text>Active: {active}</text>
      <text>Completed: {completed}</text>
      <text>Total: {userTodos.length}</text>
    </view>
  );
}
```

### Collaborative Whiteboard

```typescript
import { createThingStore, make, ThingSchema } from '@ariob/core';
import { z } from 'zod';

// Drawing schema
const DrawingSchema = ThingSchema.extend({
  type: z.enum(['line', 'rect', 'circle', 'text']),
  x: z.number(),
  y: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  radius: z.number().optional(),
  color: z.string().default('#000000'),
  strokeWidth: z.number().default(2),
  text: z.string().optional(),
  userId: z.string(),
  boardId: z.string(),
});

type Drawing = z.infer<typeof DrawingSchema>;

// Create service and store
const drawingService = make(DrawingSchema, 'drawings');
const useDrawingStore = createThingStore(drawingService, 'DrawingStore');

// Whiteboard Component
function Whiteboard({ boardId }: { boardId: string }) {
  const { user } = useWho();
  const { items, create, update, remove, fetchAll } = useDrawingStore();
  const [tool, setTool] = useState<'line' | 'rect' | 'circle' | 'text'>('line');
  const [color, setColor] = useState('#000000');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState<Partial<Drawing>>();
  
  useEffect(() => {
    fetchAll();
    
    // Watch for new drawings in real-time
    const unsubscribe = drawingService.watch(`board/${boardId}`, (result) => {
      result.match(
        (drawing) => {
          if (drawing && drawing.boardId === boardId) {
            // New drawing added
            fetchAll(); // Refresh list
          }
        },
        (error) => console.error(error)
      );
    });
    
    return unsubscribe;
  }, [boardId]);
  
  const boardDrawings = items.filter(d => d.boardId === boardId);
  
  const handleMouseDown = (e: MouseEvent) => {
    if (!user) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setCurrentDrawing({
      type: tool,
      x,
      y,
      color,
      strokeWidth: 2,
      userId: user.pub,
      boardId,
    });
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDrawing || !currentDrawing) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x2 = e.clientX - rect.left;
    const y2 = e.clientY - rect.top;
    
    // Update dimensions based on tool
    if (tool === 'line') {
      setCurrentDrawing({
        ...currentDrawing,
        width: x2 - currentDrawing.x!,
        height: y2 - currentDrawing.y!,
      });
    } else if (tool === 'rect') {
      setCurrentDrawing({
        ...currentDrawing,
        width: Math.abs(x2 - currentDrawing.x!),
        height: Math.abs(y2 - currentDrawing.y!),
      });
    } else if (tool === 'circle') {
      const radius = Math.sqrt(
        Math.pow(x2 - currentDrawing.x!, 2) + 
        Math.pow(y2 - currentDrawing.y!, 2)
      );
      setCurrentDrawing({
        ...currentDrawing,
        radius,
      });
    }
  };
  
  const handleMouseUp = async () => {
    if (!isDrawing || !currentDrawing) return;
    
    // Save drawing to Gun
    await create(currentDrawing as Omit<Drawing, 'id' | 'soul' | 'createdAt' | 'schema'>);
    
    setIsDrawing(false);
    setCurrentDrawing(undefined);
  };
  
  return (
    <view className="whiteboard">
      <view className="toolbar">
        {(['line', 'rect', 'circle', 'text'] as const).map(t => (
          <view
            key={t}
            className={`tool-btn ${tool === t ? 'active' : ''}`}
            bindtap={() => setTool(t)}
          >
            <text>{t}</text>
          </view>
        ))}
        
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        
        <view className="clear-btn" bindtap={() => {
          boardDrawings.forEach(d => remove(d.id));
        }}>
          <text>Clear</text>
        </view>
      </view>
      
      <svg
        className="drawing-surface"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Render all drawings */}
        {boardDrawings.map(drawing => (
          <DrawingElement key={drawing.id} drawing={drawing} />
        ))}
        
        {/* Render current drawing */}
        {isDrawing && currentDrawing && (
          <DrawingElement drawing={currentDrawing as Drawing} opacity={0.5} />
        )}
      </svg>
      
      <view className="user-list">
        <text>Active users:</text>
        {Array.from(new Set(boardDrawings.map(d => d.userId))).map(userId => (
          <text key={userId} className="user-tag">{userId.slice(0, 8)}</text>
        ))}
      </view>
    </view>
  );
}

// Drawing Element Component
function DrawingElement({ drawing, opacity = 1 }: { drawing: Drawing; opacity?: number }) {
  switch (drawing.type) {
    case 'line':
      return (
        <line
          x1={drawing.x}
          y1={drawing.y}
          x2={drawing.x + (drawing.width || 0)}
          y2={drawing.y + (drawing.height || 0)}
          stroke={drawing.color}
          strokeWidth={drawing.strokeWidth}
          opacity={opacity}
        />
      );
    
    case 'rect':
      return (
        <rect
          x={drawing.x}
          y={drawing.y}
          width={drawing.width || 0}
          height={drawing.height || 0}
          stroke={drawing.color}
          strokeWidth={drawing.strokeWidth}
          fill="none"
          opacity={opacity}
        />
      );
    
    case 'circle':
      return (
        <circle
          cx={drawing.x}
          cy={drawing.y}
          r={drawing.radius || 0}
          stroke={drawing.color}
          strokeWidth={drawing.strokeWidth}
          fill="none"
          opacity={opacity}
        />
      );
    
    case 'text':
      return (
        <text
          x={drawing.x}
          y={drawing.y}
          fill={drawing.color}
          opacity={opacity}
        >
          {drawing.text}
        </text>
      );
  }
}
```

## Advanced Patterns

### Optimistic Updates

```typescript
function OptimisticTodoItem({ todoId }: { todoId: string }) {
  const store = useTodoStore();
  const todo = store.byId[todoId];
  const [optimisticState, setOptimisticState] = useState<Partial<Todo>>({});
  
  const handleToggle = async () => {
    const newValue = !todo.completed;
    
    // Update UI immediately
    setOptimisticState({ completed: newValue });
    
    // Then sync with Gun
    const result = await store.update(todoId, { completed: newValue });
    
    if (result.isErr()) {
      // Revert on error
      setOptimisticState({});
      alert('Failed to update');
    }
  };
  
  const displayTodo = { ...todo, ...optimisticState };
  
  return (
    <view className="todo-item">
      <view className="checkbox" bindtap={handleToggle}>
        <text>{displayTodo.completed ? '☑' : '☐'}</text>
      </view>
      <text className={displayTodo.completed ? 'completed' : ''}>
        {displayTodo.text}
      </text>
    </view>
  );
}
```

### Computed Values

```typescript
// Create a store with computed values
function createEnhancedTodoStore() {
  const baseStore = createThingStore(todoService, 'TodoStore');
  
  return () => {
    const store = baseStore();
    
    // Add computed values
    const completedCount = store.items.filter(t => t.completed).length;
    const activeCount = store.items.length - completedCount;
    const hasCompleted = completedCount > 0;
    
    return {
      ...store,
      completedCount,
      activeCount,
      hasCompleted,
    };
  };
}

const useEnhancedTodoStore = createEnhancedTodoStore();
```

### Store Composition

```typescript
// Combine multiple stores
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

1. **Initialize stores early** - Call `fetchAll()` in component mount
2. **Handle all states** - Always check loading and error states
3. **Use real-time wisely** - Only watch what you're displaying
4. **Clean up subscriptions** - Stores handle this automatically
5. **Leverage TypeScript** - Let types guide your implementation
6. **Keep stores focused** - One store per domain concept

## Performance Optimization

1. **Use byId for lookups** instead of filtering items array
2. **Memoize filtered lists** with useMemo
3. **Implement virtual scrolling** for large lists
4. **Debounce rapid updates** to reduce Gun.js writes
5. **Use optimistic updates** for better perceived performance

## Debugging

Zustand devtools are removed in production but you can add logging:

```typescript
// Debug store actions
const useDebugStore = createThingStore(service, 'DebugStore');

// In development, log all actions
if (process.env.NODE_ENV === 'development') {
  useDebugStore.subscribe((state, prevState) => {
    console.log('Store updated:', { prevState, state });
  });
}
``` 