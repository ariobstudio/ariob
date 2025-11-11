/**
 * Navigation State Persistence
 *
 * Utilities for converting between navigation state and paths
 * Useful for deep linking and state restoration
 */

import type { NavigationState, ParamListBase, Route, LinkingConfig } from './types';

// ============================================================================
// Path to State Conversion
// ============================================================================

/**
 * Convert a path string to navigation state
 *
 * @param path Path string (e.g., "/Home/Profile?userId=123")
 * @param config Linking configuration
 * @returns Navigation state or undefined if path doesn't match
 *
 * @example
 * ```typescript
 * const state = await getStateFromPath('/Profile?userId=123', {
 *   config: {
 *     screens: {
 *       Profile: 'Profile',
 *     },
 *   },
 * });
 * ```
 */
export async function getStateFromPath(
  path: string,
  config?: LinkingConfig<ParamListBase>
): Promise<NavigationState<ParamListBase> | undefined> {
  console.log('[getStateFromPath] Converting path to state:', path);

  if (!path) {
    return undefined;
  }

  // Remove prefixes if any
  let cleanPath = path;
  if (config?.prefixes) {
    for (const prefix of config.prefixes) {
      if (path.startsWith(prefix)) {
        cleanPath = path.slice(prefix.length);
        break;
      }
    }
  }

  // Split path into segments
  const pathParts = cleanPath.split('?');
  const pathWithoutQuery = pathParts[0] || '';
  const queryString = pathParts[1];
  
  const segments = pathWithoutQuery
    .split('/')
    .filter(segment => segment.length > 0);

  if (segments.length === 0) {
    return undefined;
  }

  // Parse query parameters
  const queryParams: Record<string, string> = {};
  if (queryString) {
    const searchParams = new URLSearchParams(queryString);
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
  }

  // Build routes from segments
  const routes: Route[] = segments.map((segment, index) => {
    const isLast = index === segments.length - 1;
    
    return {
      key: `${segment}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: segment,
      params: isLast && Object.keys(queryParams).length > 0 ? queryParams : undefined,
    };
  });

  const state: NavigationState<ParamListBase> = {
    type: 'stack',
    key: `root-${Date.now()}`,
    index: routes.length - 1,
    routes,
    stale: false,
  };

  console.log('[getStateFromPath] Generated state:', state);

  return state;
}

// ============================================================================
// State to Path Conversion
// ============================================================================

/**
 * Convert navigation state to a path string
 *
 * @param state Navigation state
 * @param config Linking configuration
 * @returns Path string
 *
 * @example
 * ```typescript
 * const path = getPathFromState(state, {
 *   config: {
 *     screens: {
 *       Profile: 'Profile',
 *     },
 *   },
 * });
 * // Returns: "/Profile?userId=123"
 * ```
 */
export function getPathFromState(
  state: NavigationState<ParamListBase>,
  _config?: LinkingConfig<ParamListBase>
): string {
  console.log('[getPathFromState] Converting state to path:', state);

  if (!state || !state.routes || state.routes.length === 0) {
    return '/';
  }

  // Build path from routes
  const pathSegments: string[] = [];
  let params: Record<string, any> = {};

  // Get the active route chain
  let currentState: NavigationState<ParamListBase> | undefined = state;
  
  while (currentState) {
    const route: Route<ParamListBase> | undefined = currentState.routes[currentState.index];
    
    if (!route) {
      break;
    }

    pathSegments.push(route.name);

    // Collect params from the last route
    if (route.params) {
      params = { ...params, ...route.params };
    }

    // Check if this route has nested state
    currentState = route.state;
  }

  // Build the path
  let path = '/' + pathSegments.join('/');

  // Add query parameters
  if (Object.keys(params).length > 0) {
    const queryString = Object.entries(params)
      .map(([key, value]) => {
        if (value === null || value === undefined) {
          return null;
        }
        return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
      })
      .filter(Boolean)
      .join('&');

    if (queryString) {
      path += `?${queryString}`;
    }
  }

  console.log('[getPathFromState] Generated path:', path);

  return path;
}

// ============================================================================
// State Validation
// ============================================================================

/**
 * Validate navigation state structure
 *
 * @param state Navigation state to validate
 * @returns True if state is valid
 */
export function validateState(state: any): state is NavigationState<ParamListBase> {
  if (!state || typeof state !== 'object') {
    console.warn('[validateState] State is not an object');
    return false;
  }

  if (!state.routes || !Array.isArray(state.routes)) {
    console.warn('[validateState] State.routes is not an array');
    return false;
  }

  if (typeof state.index !== 'number') {
    console.warn('[validateState] State.index is not a number');
    return false;
  }

  if (state.index < 0 || state.index >= state.routes.length) {
    console.warn('[validateState] State.index is out of bounds');
    return false;
  }

  // Validate each route
  for (const route of state.routes) {
    if (!route || typeof route !== 'object') {
      console.warn('[validateState] Route is not an object');
      return false;
    }

    if (!route.key || typeof route.key !== 'string') {
      console.warn('[validateState] Route.key is not a string');
      return false;
    }

    if (!route.name || typeof route.name !== 'string') {
      console.warn('[validateState] Route.name is not a string');
      return false;
    }
  }

  console.log('[validateState] State is valid');
  return true;
}

// ============================================================================
// State Serialization
// ============================================================================

/**
 * Serialize navigation state to JSON string
 *
 * @param state Navigation state
 * @returns JSON string
 */
export function serializeState(state: NavigationState<ParamListBase>): string {
  console.log('[serializeState] Serializing state');
  return JSON.stringify(state);
}

/**
 * Deserialize JSON string to navigation state
 *
 * @param json JSON string
 * @returns Navigation state or undefined if invalid
 */
export function deserializeState(json: string): NavigationState<ParamListBase> | undefined {
  console.log('[deserializeState] Deserializing state');
  
  try {
    const state = JSON.parse(json);
    
    if (validateState(state)) {
      return state;
    }
    
    return undefined;
  } catch (error) {
    console.error('[deserializeState] Failed to parse JSON:', error);
    return undefined;
  }
}

