import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoWebcryptoViewProps } from './ExpoWebcrypto.types';

const NativeView: React.ComponentType<ExpoWebcryptoViewProps> =
  requireNativeView('ExpoWebcrypto');

export default function ExpoWebcryptoView(props: ExpoWebcryptoViewProps) {
  return <NativeView {...props} />;
}
