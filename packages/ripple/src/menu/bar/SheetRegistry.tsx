/**
 * SheetRegistry - Context for registering custom sheet components
 *
 * Apps can provide their own sheet components via this context,
 * allowing app-specific sheets (like AccountSheet) to be defined
 * in the app layer rather than the package.
 */

import { createContext, useContext, type ReactNode, type ComponentType } from 'react';
import type { SheetType } from './types';

/** Props that all sheet components receive */
export interface SheetComponentProps {
  onClose: () => void;
}

/** Registry of sheet components */
export type SheetRegistry = Partial<Record<NonNullable<SheetType>, ComponentType<SheetComponentProps>>>;

/** Registry of sheet titles */
export type SheetTitles = Partial<Record<NonNullable<SheetType>, string>>;

interface SheetRegistryContextValue {
  sheets: SheetRegistry;
  titles: SheetTitles;
  /** Sheets that handle their own header */
  selfHeadered: Set<string>;
}

const SheetRegistryContext = createContext<SheetRegistryContextValue>({
  sheets: {},
  titles: {},
  selfHeadered: new Set(),
});

interface SheetRegistryProviderProps {
  children: ReactNode;
  sheets?: SheetRegistry;
  titles?: SheetTitles;
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
  selfHeadered = [],
}: SheetRegistryProviderProps) {
  return (
    <SheetRegistryContext.Provider
      value={{
        sheets,
        titles,
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
