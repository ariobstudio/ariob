/**
 * TypeScript definitions for native modules
 */

declare global {
  interface NativeModules {
    ExplorerModule: {
      /**
       * Open a schema URL using the native explorer
       * @param url The schema URL to open, e.g., "file://lynx?local://kitchen/home.lynx.bundle"
       */
      openSchema(url: string): void;
      
      /**
       * Navigate back in the navigation stack
       */
      navigateBack(): void;
      
      /**
       * Open the QR code scanner
       */
      openScan(): void;
      
      /**
       * Set the thread mode for rendering
       */
      setThreadMode(mode: number): void;
      
      /**
       * Switch preset size mode
       */
      switchPreSize(enabled: boolean): void;
      
      /**
       * Get current setting information
       */
      getSettingInfo(): {
        threadMode: number;
        preSize: boolean;
        enableRenderNode: boolean;
      };
      
      /**
       * Save theme preferences
       */
      saveThemePreferences(theme: string, value: string): void;
    };
  }
}

export {};

