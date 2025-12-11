/**
 * useNavigation Hook
 *
 * Production-ready hook for native navigation in LynxJS apps.
 * Simple bundle navigation without theme styling.
 *
 * @module @ariob/ui
 */

/**
 * Navigation configuration options
 */
export interface NavigationConfig {
  /** Base app name for bundle URLs */
  appName?: string;
}

/**
 * Bundle URL build options
 */
export interface BundleURLOptions {
  /** Bundle filename (e.g., 'thread.lynx.bundle') */
  bundlePath: string;
  /** Optional navigation bar title (shows back button if provided) */
  title?: string;
  /** Custom query parameters */
  params?: Record<string, string>;
}

/**
 * Build a bundle URL with optional title and params
 *
 * @param appName - App name (e.g., 'ripple', 'chat')
 * @param options - Bundle URL options
 * @returns Complete bundle URL
 */
export function buildBundleURL(
  appName: string,
  options: BundleURLOptions
): string {
  const { bundlePath, title, params = {} } = options;

  // Build parameters
  const urlParams: Record<string, string> = { ...params };

  // Add title if provided (shows back button)
  if (title) {
    urlParams.title = title;
  }

  // Build query string
  const query =
    Object.keys(urlParams).length > 0
      ? '?' + new URLSearchParams(urlParams).toString()
      : '';

  return `file://lynx?local://${bundlePath}${query}`;
}

/**
 * Navigation hook for LynxJS apps
 *
 * Provides navigation utilities using NativeModules.ExplorerModule.
 *
 * @param config - Navigation configuration
 * @returns Navigation utilities
 *
 * @example
 * ```tsx
 * function MyScreen() {
 *   const nav = useNavigation({ appName: 'ripple' });
 *
 *   const openFeed = () => {
 *     nav.navigate({
 *       bundlePath: 'feed.lynx.bundle',
 *       title: 'Feed',
 *       params: { degree: '1' },
 *     });
 *   };
 *
 *   return (
 *     <view bindtap={openFeed}>
 *       <text>Open Feed</text>
 *     </view>
 *   );
 * }
 * ```
 */
export function useNavigation(config: NavigationConfig = {}) {
  const { appName = 'app' } = config;

  /**
   * Navigate to a bundle with optional navigation bar title
   *
   * @param options - Bundle URL options
   */
  const navigate = (options: BundleURLOptions) => {
    'background only';

    const url = buildBundleURL(appName, options);

    console.log('[useNavigation] Navigating to:', url);
    NativeModules.ExplorerModule.openSchema(url);
  };

  /**
   * Navigate back to previous screen
   * Uses native navigation stack
   */
  const goBack = () => {
    'background only';
    console.log('[useNavigation] Going back');
    NativeModules.ExplorerModule.navigateBack();
  };

  /**
   * Save a preference value to persistent storage
   * Uses iOS UserDefaults or Android SharedPreferences
   *
   * @param key - Storage key
   * @param value - Value to store
   */
  const savePreference = (key: string, value: string) => {
    'background only';
    console.log('[useNavigation] Saving preference:', key, '=', value);
    NativeModules.ExplorerModule.saveThemePreferences(key, value);
  };

  /**
   * Build a bundle URL without navigating
   * Useful for links or custom navigation logic
   *
   * @param options - Bundle URL options
   * @returns Complete bundle URL
   */
  const buildURL = (options: BundleURLOptions): string => {
    return buildBundleURL(appName, options);
  };

  return {
    /** Navigate to a bundle */
    navigate,
    /** Navigate back */
    goBack,
    /** Save preference */
    savePreference,
    /** Build bundle URL */
    buildURL,
  };
}

/**
 * Type-safe navigation builder hook
 *
 * Creates type-safe navigation functions for specific app screens.
 * Useful for apps with multiple bundles/screens.
 *
 * @param appName - App name (e.g., 'ripple')
 * @param screens - Screen configuration
 * @returns Type-safe navigation functions
 *
 * @example
 * ```tsx
 * const screens = {
 *   feed: { path: 'feed.lynx.bundle', title: 'Feed' },
 *   profile: { path: 'profile.lynx.bundle', title: 'Profile' },
 * } as const;
 *
 * function App() {
 *   const nav = useTypedNavigation('ripple', screens);
 *
 *   return (
 *     <view>
 *       <button bindtap={() => nav.toFeed({ degree: '1' })}>Feed</button>
 *       <button bindtap={() => nav.toProfile({ pub: '123' })}>Profile</button>
 *     </view>
 *   );
 * }
 * ```
 */
export function useTypedNavigation<
  T extends Record<string, { path: string; title?: string }>,
>(appName: string, screens: T) {
  const nav = useNavigation({ appName });

  // Build typed navigation functions
  const navigationFunctions: Record<string, any> = {};

  // Create navigation function for each screen
  (Object.keys(screens) as Array<keyof T>).forEach((screenKey) => {
    const screen = screens[screenKey];
    const functionName =
      `to${String(screenKey).charAt(0).toUpperCase()}${String(screenKey).slice(1)}`;

    navigationFunctions[functionName] = (
      params?: Record<string, string>,
      withTitle = false
    ) => {
      'background only';

      nav.navigate({
        bundlePath: screen.path,
        title: withTitle ? screen.title : undefined,
        params,
      });
    };
  });

  return {
    ...navigationFunctions,
    goBack: nav.goBack,
    savePreference: nav.savePreference,
  } as {
    [K in keyof T as `to${Capitalize<string & K>}`]: (
      params?: Record<string, string>,
      withTitle?: boolean
    ) => void;
  } & {
    goBack: () => void;
    savePreference: (key: string, value: string) => void;
  };
}
