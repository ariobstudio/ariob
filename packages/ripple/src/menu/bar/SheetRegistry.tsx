/**
 * SheetRegistry - Context for registering custom sheet components
 *
 * Apps can provide their own sheet components via this context,
 * allowing app-specific sheets (like AccountSheet) to be defined
 * in the app layer rather than the package.
 */

import { createContext, useContext, type ReactNode, type ComponentType } from 'react';
import type { SheetType, SheetHeightConstraints } from './types';

/** Props that all sheet components receive */
export interface SheetComponentProps {
  onClose: () => void;
}

/** Registry of sheet components */
export type SheetRegistry = Partial<Record<NonNullable<SheetType>, ComponentType<SheetComponentProps>>>;

/** Registry of sheet titles */
export type SheetTitles = Partial<Record<NonNullable<SheetType>, string>>;

/** Registry of sheet height constraints */
export type SheetHeights = Partial<Record<NonNullable<SheetType>, SheetHeightConstraints>>;

interface SheetRegistryContextValue {
  sheets: SheetRegistry;
  titles: SheetTitles;
  heights: SheetHeights;
  /** Sheets that handle their own header */
  selfHeadered: Set<string>;
}

const SheetRegistryContext = createContext<SheetRegistryContextValue>({
  sheets: {},
  titles: {},
  heights: {},
  selfHeadered: new Set(),
});

interface SheetRegistryProviderProps {
  children: ReactNode;
  sheets?: SheetRegistry;
  titles?: SheetTitles;
  heights?: SheetHeights;
  selfHeadered?: string[];
}

/**
 * Provider for custom sheet components
 *
 * @example
 * ```tsx
 * import { AccountSheet } from './components/sheets/AccountSheet';
 *
 * <SheetRegistryProvider
 *   sheets={{ account: AccountSheet }}
 *   titles={{ account: 'Create Account' }}
 *   heights={{ account: { min: 280, max: 500 } }}
 *   selfHeadered={['account']}
 * >
 *   <App />
 * </SheetRegistryProvider>
 * ```
 */
export function SheetRegistryProvider({
  children,
  sheets = {},
  titles = {},
  heights = {},
  selfHeadered = [],
}: SheetRegistryProviderProps) {
  return (
    <SheetRegistryContext.Provider
      value={{
        sheets,
        titles,
        heights,
        selfHeadered: new Set(selfHeadered),
      }}
    >
      {children}
    </SheetRegistryContext.Provider>
  );
}

/** Hook to access the sheet registry */
export function useSheetRegistry() {
  return useContext(SheetRegistryContext);
}
