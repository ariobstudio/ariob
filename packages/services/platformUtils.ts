/**
 * Platform detection utility
 * This detects the current runtime platform (web, iOS, Android)
 */

type Platform = 'web' | 'ios' | 'android' | 'unknown';

let currentPlatform: Platform = 'unknown';

// Detect the platform on initialization
const detectPlatform = (): Platform => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    return 'web';
  }
  
  // Check for iOS (React Native)
  if (typeof global !== 'undefined' && 
      global.nativeModules && 
      global.nativeModules.RNDeviceInfo && 
      global.nativeModules.RNDeviceInfo.systemName === 'iOS') {
    return 'ios';
  }
  
  // Check for Android (React Native)
  if (typeof global !== 'undefined' && 
      global.nativeModules && 
      global.nativeModules.RNDeviceInfo && 
      global.nativeModules.RNDeviceInfo.systemName === 'Android') {
    return 'android';
  }
  
  return 'unknown';
};

// Initialize platform detection
currentPlatform = detectPlatform();

/**
 * Check if the current platform matches the provided platform
 * @param platform Platform to check against
 * @returns boolean indicating if the current platform matches
 */
export const isPlatform = (platform: Platform): boolean => {
  return currentPlatform === platform;
};

/**
 * Get the current platform
 * @returns The current platform identifier
 */
export const getPlatform = (): Platform => {
  return currentPlatform;
};

export default {
  isPlatform,
  getPlatform
};
