/**
 * Navigation Actions
 *
 * Action creators for navigation operations
 * Following React Navigation's action API
 */

import type { NavigationState, ParamListBase } from './types';

// ============================================================================
// Common Actions
// ============================================================================

/**
 * Common navigation actions that work across all navigators
 */
export const CommonActions = {
  /**
   * Navigate to a screen
   */
  navigate<RouteName extends string>(
    name: RouteName,
    params?: object
  ): { type: 'NAVIGATE'; payload: { name: RouteName; params?: object } } {
    console.log('[CommonActions] navigate:', { name, params });
    return {
      type: 'NAVIGATE',
      payload: { name, params },
    };
  },

  /**
   * Navigate to a screen with optional key and merge
   */
  navigateWithOptions<RouteName extends string>(options: {
    name: RouteName;
    params?: object;
    key?: string;
    merge?: boolean;
  }): { type: 'NAVIGATE'; payload: typeof options } {
    console.log('[CommonActions] navigateWithOptions:', options);
    return {
      type: 'NAVIGATE',
      payload: options,
    };
  },

  /**
   * Reset the navigation state
   */
  reset(state: Partial<NavigationState<ParamListBase>>): {
    type: 'RESET';
    payload: Partial<NavigationState<ParamListBase>>;
  } {
    console.log('[CommonActions] reset:', state);
    return {
      type: 'RESET',
      payload: state,
    };
  },

  /**
   * Go back to the previous screen
   */
  goBack(): { type: 'GO_BACK' } {
    console.log('[CommonActions] goBack');
    return {
      type: 'GO_BACK',
    };
  },

  /**
   * Update params for the current screen
   */
  setParams(params: object): { type: 'SET_PARAMS'; payload: object } {
    console.log('[CommonActions] setParams:', params);
    return {
      type: 'SET_PARAMS',
      payload: params,
    };
  },
};

// ============================================================================
// Stack Actions
// ============================================================================

/**
 * Actions specific to stack navigators
 */
export const StackActions = {
  /**
   * Push a new screen onto the stack
   */
  push<RouteName extends string>(
    name: RouteName,
    params?: object
  ): { type: 'PUSH'; payload: { name: RouteName; params?: object } } {
    console.log('[StackActions] push:', { name, params });
    return {
      type: 'PUSH',
      payload: { name, params },
    };
  },

  /**
   * Pop screens from the stack
   * @param count Number of screens to pop (default: 1)
   */
  pop(count: number = 1): { type: 'POP'; payload: { count: number } } {
    console.log('[StackActions] pop:', { count });
    return {
      type: 'POP',
      payload: { count },
    };
  },

  /**
   * Pop to the top of the stack (remove all screens except the first)
   */
  popToTop(): { type: 'POP_TO_TOP' } {
    console.log('[StackActions] popToTop');
    return {
      type: 'POP_TO_TOP',
    };
  },

  /**
   * Replace the current screen with a new one
   */
  replace<RouteName extends string>(
    name: RouteName,
    params?: object
  ): { type: 'REPLACE'; payload: { name: RouteName; params?: object } } {
    console.log('[StackActions] replace:', { name, params });
    return {
      type: 'REPLACE',
      payload: { name, params },
    };
  },
};

// ============================================================================
// Tab Actions
// ============================================================================

/**
 * Actions specific to tab navigators
 */
export const TabActions = {
  /**
   * Jump to a specific tab
   */
  jumpTo<RouteName extends string>(
    name: RouteName,
    params?: object
  ): { type: 'JUMP_TO'; payload: { name: RouteName; params?: object } } {
    console.log('[TabActions] jumpTo:', { name, params });
    return {
      type: 'JUMP_TO',
      payload: { name, params },
    };
  },
};

// ============================================================================
// Drawer Actions
// ============================================================================

/**
 * Actions specific to drawer navigators
 */
export const DrawerActions = {
  /**
   * Open the drawer
   */
  openDrawer(): { type: 'OPEN_DRAWER' } {
    console.log('[DrawerActions] openDrawer');
    return {
      type: 'OPEN_DRAWER',
    };
  },

  /**
   * Close the drawer
   */
  closeDrawer(): { type: 'CLOSE_DRAWER' } {
    console.log('[DrawerActions] closeDrawer');
    return {
      type: 'CLOSE_DRAWER',
    };
  },

  /**
   * Toggle the drawer (open if closed, close if open)
   */
  toggleDrawer(): { type: 'TOGGLE_DRAWER' } {
    console.log('[DrawerActions] toggleDrawer');
    return {
      type: 'TOGGLE_DRAWER',
    };
  },

  /**
   * Jump to a screen in the drawer
   */
  jumpTo<RouteName extends string>(
    name: RouteName,
    params?: object
  ): { type: 'JUMP_TO'; payload: { name: RouteName; params?: object } } {
    console.log('[DrawerActions] jumpTo:', { name, params });
    return {
      type: 'JUMP_TO',
      payload: { name, params },
    };
  },
};

// ============================================================================
// Action Type Guards
// ============================================================================

/**
 * Check if an action is a navigation action
 */
export function isNavigationAction(action: any): action is ReturnType<typeof CommonActions.navigate> {
  return action && action.type === 'NAVIGATE';
}

/**
 * Check if an action is a stack action
 */
export function isStackAction(action: any): boolean {
  return action && ['PUSH', 'POP', 'POP_TO_TOP', 'REPLACE'].includes(action.type);
}

/**
 * Check if an action is a tab action
 */
export function isTabAction(action: any): boolean {
  return action && action.type === 'JUMP_TO';
}

/**
 * Check if an action is a drawer action
 */
export function isDrawerAction(action: any): boolean {
  return action && ['OPEN_DRAWER', 'CLOSE_DRAWER', 'TOGGLE_DRAWER'].includes(action.type);
}


