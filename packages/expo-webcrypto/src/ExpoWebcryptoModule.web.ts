import { registerWebModule, NativeModule } from 'expo';

import { ExpoWebcryptoModuleEvents } from './ExpoWebcrypto.types';

class ExpoWebcryptoModule extends NativeModule<ExpoWebcryptoModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ExpoWebcryptoModule, 'ExpoWebcryptoModule');
