/** Tap gesture hook */

import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

/** Creates a double-tap gesture */
export function useDoubleTap(onDouble: () => void) {
  return Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      runOnJS(onDouble)();
    });
}
