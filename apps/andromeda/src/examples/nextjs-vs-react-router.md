# Next.js vs React Router Navigation

## Quick Reference

| Next.js | React Router | Description |
|---------|--------------|-------------|
| `import { useRouter } from 'next/navigation'` | `import { useNavigate } from 'react-router-dom'` | Import navigation hook |
| `const router = useRouter()` | `const navigate = useNavigate()` | Initialize navigation |
| `router.push('/path')` | `navigate('/path')` | Navigate to route |
| `router.replace('/path')` | `navigate('/path', { replace: true })` | Replace current route |
| `router.back()` | `navigate(-1)` | Go back |
| `router.forward()` | `navigate(1)` | Go forward |
| `router.refresh()` | `window.location.reload()` | Refresh page |
| `router.prefetch('/path')` | N/A (React Router loads on demand) | Prefetch route |

## Route Parameters

| Next.js | React Router |
|---------|--------------|
| `const { id } = useParams()` | `const { id } = useParams()` |
| File: `[id].tsx` | File: `[id].tsx` (with plugin) |
| Catch-all: `[...slug].tsx` | File: `[...slug].tsx` → Path: `*` |

## Query Parameters

| Next.js | React Router |
|---------|--------------|
| `const searchParams = useSearchParams()` | `const [searchParams] = useSearchParams()` |
| `searchParams.get('q')` | `searchParams.get('q')` |

## Link Components

| Next.js | React Router |
|---------|--------------|
| `import Link from 'next/link'` | `import { Link } from 'react-router-dom'` |
| `<Link href="/path">` | `<Link to="/path">` |
| `<Link href={{ pathname: '/path', query: { q: 'test' } }}>` | `<Link to="/path?q=test">` |

## Navigation with State

```tsx
// Next.js (using query params or localStorage)
router.push({
  pathname: '/path',
  query: { from: 'home' }
})

// React Router
navigate('/path', {
  state: { from: 'home' }
})
```

## Getting Current Route Info

```tsx
// Next.js
const pathname = usePathname()
const searchParams = useSearchParams()

// React Router
const location = useLocation()
const pathname = location.pathname
const search = location.search
```

## 404 Handling

```tsx
// Next.js
// File: app/not-found.tsx or pages/404.tsx

// React Router (with your plugin)
// File: src/pages/[...404].tsx
// Generates: { path: "*", element: <NotFound /> }
```

## Protected Routes

```tsx
// Next.js (middleware or component)
export function middleware(request: NextRequest) {
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

// React Router
function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const isAuthenticated = useAuth();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated]);
  
  return isAuthenticated ? children : null;
}
``` 