/**
 * Context Menu - Floating action menu for long-press
 *
 * Appears near the touch point with node-specific quick actions.
 */

import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useMenu, useMenuOpen, useMenuNode } from './state';
import { getQuickActions } from './nodes';
import { get, type ActName } from './acts';
import type { Act } from './types';

/** Single action button in context menu */
function ContextButton({
  act,
  onPress,
}: {
  act: Act;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={style}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.9); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={styles.button}
      >
        <Ionicons name={act.icon as any} size={20} color="#fff" />
      </Pressable>
    </Animated.View>
  );
}

/** Context menu component */
export function Context() {
  const open = useMenuOpen();
  const node = useMenuNode();
  const { pos, hide } = useMenu();

  if (!open || !node) return null;

  // Get quick actions for this node type
  const actionNames = getQuickActions(node.type);
  const actions = actionNames.map((name) => get(name));

  // Handle action press - just close menu, action handling delegated to parent
  const handlePress = (act: Act) => {
    // TODO: Wire up action handling via callback prop if needed
    console.log('[Context] Action:', act.name);
    hide();
  };

  // Position menu near touch point (with bounds checking)
  const menuStyle = {
    top: Math.max(100, (pos?.y || 200) - 60),
    left: Math.max(20, Math.min((pos?.x || 100) - 80, 280)),
  };

  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(100)}
      style={[styles.overlay]}
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={hide} />

      {/* Menu */}
      <Animated.View style={[styles.menu, menuStyle]}>
        <BlurView intensity={80} tint="dark" style={styles.blur}>
          <View style={styles.actions}>
            {actions.map((act) => (
              <ContextButton
                key={act.name}
                act={act}
                onPress={() => handlePress(act)}
              />
            ))}
          </View>
        </BlurView>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menu: {
    position: 'absolute',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  blur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  actions: {
    flexDirection: 'row',
    padding: 8,
    gap: 4,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
