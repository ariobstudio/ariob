import * as React from 'react';

import { ExpoWebcryptoViewProps } from './ExpoWebcrypto.types';

export default function ExpoWebcryptoView(props: ExpoWebcryptoViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
