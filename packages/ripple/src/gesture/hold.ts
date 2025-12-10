/** Long press gesture hook */

import { Gesture } from 'react-native-gesture-handler';
import { useMenu, type NodeRef } from '../menu/state';
import { runOnJS } from 'react-native-reanimated';

/** Creates a long-press gesture that shows the menu */
export function useHold(node: NodeRef) {
  const show = useMenu((s) => s.show);

  return Gesture.LongPress()
    .minDuration(400)
    .onEnd((e, success) => {
      if (success) {
        runOnJS(show)(node, { x: e.absoluteX, y: e.absoluteY });
      }
    });
}
