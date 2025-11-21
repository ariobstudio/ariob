import { NativeModule, requireNativeModule } from 'expo';

import { ExpoWebcryptoModuleEvents } from './ExpoWebcrypto.types';

declare class ExpoWebcryptoModule extends NativeModule<ExpoWebcryptoModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoWebcryptoModule>('ExpoWebcrypto');
