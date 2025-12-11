/**
 * Link Component
 *
 * Declarative navigation component for creating links
 * Following React Navigation's Link API
 */

import type { ParamListBase } from './types';
import { useLinkProps } from './hooks';
import type { LynxReactNode } from '../types/react';

// ============================================================================
// Link Component
// ============================================================================

export interface LinkProps {
  /**
   * Path to navigate to (e.g., "/Home" or "/Profile?userId=123")
   */
  to: string;

  /**
   * Action to dispatch instead of path-based navigation
   */
  action?: any;

  /**
   * Children to render
   */
  children: LynxReactNode;

  /**
   * Additional props to pass to the underlying element
   */
  [key: string]: any;
}

/**
 * Link component for declarative navigation
 *
 * @example
 * ```tsx
 * <Link to="/Profile?userId=123">
 *   <Text>Go to Profile</Text>
 * </Link>
 * ```
 */
export function Link({
  to,
  action,
  children,
  ...rest
}: LinkProps) {
  const linkProps = useLinkProps({ to });

  console.log('[Link] Rendering link to:', to);

  return (
    <view
      {...linkProps}
      {...rest}
      style={{
        cursor: 'pointer',
        ...rest.style,
      }}
    >
      {children}
    </view>
  );
}
