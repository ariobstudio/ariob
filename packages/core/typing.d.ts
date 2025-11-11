/**
 * @ariob/core - Framework-agnostic type declarations
 *
 * This file contains type declarations that work across all frameworks (LynxJS, Expo, React Native).
 * Platform-specific types are located in the `lynx/` folder.
 */

declare global {
  /**
   * Allow importing PNG files with inline query parameter
   * @example import logo from './logo.png?inline';
   */
  declare module '*.png?inline';
}