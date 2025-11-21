/**
 * Kitchen Navigation Types
 * 
 * Re-exports navigation types from @ariob/ui with app-specific route definitions
 */

export * from '@ariob/ui';

import type {
  NavigationProp,
  RouteProp,
  ParamListBase,
} from '@ariob/ui';

/**
 * Kitchen App Route Parameter List
 * Define all routes and their parameters here
 */
export type KitchenParamList = {
  NavigationHome: undefined;
  NavigationHomeScreen: undefined;
  DetailScreen: {
    itemId: string;
    title?: string;
  };
  ProfileScreen: {
    userId: string;
    name?: string;
  };
  SettingsScreen: {
    section?: string;
  };
  StackDemo: undefined;
  StackDemoScreen: undefined;
  LiquidGlassExample: undefined;
  ActionsExample: undefined;
  HooksExample: undefined;
  LinkExample: undefined;
  TrackingExample: undefined;
};

/**
 * Navigation prop type for Kitchen screens
 */
export type NavigationStackScreenProps<
  RouteName extends keyof KitchenParamList = keyof KitchenParamList,
> = {
  navigation: NavigationProp<KitchenParamList, RouteName>;
  route: RouteProp<KitchenParamList, RouteName>;
};

/**
 * Helper type for screen components
 */
export type KitchenScreenProps<T extends keyof KitchenParamList> =
  NavigationStackScreenProps<T>;

