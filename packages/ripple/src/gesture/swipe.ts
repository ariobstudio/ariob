/** Swipe gesture hook */

import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

export interface SwipeHandlers {
  left?: () => void;
  right?: () => void;
}

/** Creates a swipe gesture with left/right handlers */
export function useSwipe(on: SwipeHandlers) {
  return Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onEnd((e) => {
      if (e.translationX < -60 && on.left) {
        runOnJS(on.left)();
      } else if (e.translationX > 60 && on.right) {
        runOnJS(on.right)();
      }
    });
}
