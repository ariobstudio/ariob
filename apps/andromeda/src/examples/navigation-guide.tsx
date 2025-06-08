import React from 'react';
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

// Example 1: Basic Navigation Hook (similar to Next.js useRouter)
export function NavigationExample() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();

  // Navigate to a route (similar to router.push in Next.js)
  const handleNavigate = () => {
    navigate('/dashboard');
  };

  // Navigate with replace (similar to router.replace in Next.js)
  const handleReplace = () => {
    navigate('/login', { replace: true });
  };

  // Go back (similar to router.back in Next.js)
  const handleGoBack = () => {
    navigate(-1);
  };

  // Go forward
  const handleGoForward = () => {
    navigate(1);
  };

  // Navigate with state
  const handleNavigateWithState = () => {
    navigate('/profile', {
      state: {
        from: location.pathname,
        userId: 123,
      },
    });
  };

  // Navigate with query params
  const handleNavigateWithQuery = () => {
    navigate('/search?q=react&category=tutorials');
    // Or using object syntax:
    // navigate({
    //   pathname: '/search',
    //   search: '?q=react&category=tutorials'
    // });
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Navigation Examples</h2>

      <div className="space-y-2">
        <button
          onClick={handleNavigate}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Navigate to Dashboard
        </button>

        <button
          onClick={handleReplace}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Replace with Login
        </button>

        <button
          onClick={handleGoBack}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Go Back
        </button>
      </div>

      <div className="mt-4 p-4 bg-gray-100 rounded">
        <p>Current Path: {location.pathname}</p>
        <p>Search Params: {searchParams.toString()}</p>
        <p>Route Params: {JSON.stringify(params)}</p>
      </div>
    </div>
  );
}

// Example 2: Link Components (similar to Next.js Link)
export function LinkExamples() {
  return (
    <nav className="space-y-2">
      {/* Basic Link */}
      <Link to="/home" className="text-blue-500 hover:underline">
        Home
      </Link>

      {/* NavLink with active styling */}
      <NavLink
        to="/about"
        className={({ isActive }) =>
          isActive
            ? 'text-blue-700 font-bold underline'
            : 'text-blue-500 hover:underline'
        }
      >
        About
      </NavLink>

      {/* Link with state */}
      <Link
        to="/profile"
        state={{ from: 'navigation-example' }}
        className="text-blue-500 hover:underline"
      >
        Profile with State
      </Link>
    </nav>
  );
}

// Example 3: Programmatic Navigation with Dynamic Routes
export function DynamicNavigationExample() {
  const navigate = useNavigate();

  const navigateToUser = (userId: number) => {
    navigate(`/users/${userId}`);
  };

  const navigateToPost = (postId: string, commentId?: string) => {
    const path = commentId
      ? `/posts/${postId}/comments/${commentId}`
      : `/posts/${postId}`;
    navigate(path);
  };

  return (
    <div className="space-y-2">
      <button
        onClick={() => navigateToUser(123)}
        className="px-4 py-2 bg-purple-500 text-white rounded"
      >
        Go to User 123
      </button>

      <button
        onClick={() => navigateToPost('abc', 'xyz')}
        className="px-4 py-2 bg-indigo-500 text-white rounded"
      >
        Go to Post Comment
      </button>
    </div>
  );
}

// Example 4: Navigation Guard/Redirect
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const isAuthenticated = false; // Your auth logic here

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        replace: true,
        state: { from: location.pathname },
      });
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? <>{children}</> : null;
}

// Example 5: Custom Hook for Navigation (similar to Next.js patterns)
export function useRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  return {
    // Navigation methods
    push: (path: string, options?: { state?: any }) => navigate(path, options),

    replace: (path: string, options?: { state?: any }) =>
      navigate(path, { ...options, replace: true }),

    back: () => navigate(-1),

    forward: () => navigate(1),

    // Current route info
    pathname: location.pathname,
    query: Object.fromEntries(searchParams),
    params,

    // Update query params
    updateQuery: (updates: Record<string, string>) => {
      const newParams = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === '') {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });
      setSearchParams(newParams);
    },
  };
}

// Example usage of custom hook
export function CustomHookExample() {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <button
        onClick={() => router.push('/dashboard')}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Push to Dashboard
      </button>

      <button
        onClick={() => router.updateQuery({ filter: 'active' })}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Add Query Param
      </button>

      <div className="p-4 bg-gray-100 rounded">
        <p>Current Path: {router.pathname}</p>
        <p>Query: {JSON.stringify(router.query)}</p>
      </div>
    </div>
  );
}
