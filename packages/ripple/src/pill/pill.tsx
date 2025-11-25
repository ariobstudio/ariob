import { useCallback, useEffect, useState } from 'react';
import { View, Pressable, Text, useWindowDimensions } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { MetaAction } from './meta';
import type { ActionType } from './actions';

interface PillProps {
  left?: MetaAction;
  center: MetaAction;
  right?: MetaAction;
  onAction: (action: ActionType) => void;
  isActive?: boolean;
}

const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  '+': 'add',
  '←': 'arrow-back',
  '⚙️': 'settings-outline',
  '⋯': 'ellipsis-horizontal',
  '🔑': 'key-outline',
  '🔍': 'search-outline',
  '⚡': 'flash-outline',
  '↩': 'return-down-back',
  '✏️': 'create-outline',
  '🔗': 'link-outline',
};

const SPRING_CONFIG = { damping: 16, stiffness: 180 };
const COLLAPSE_CONFIG = { duration: 200 };
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Pill = ({ left, center, right, onAction, isActive }: PillProps) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const expansion = useSharedValue(0);
  const [expandedAction, setExpandedAction] = useState<MetaAction | null>(null);

  const renderIcon = (icon: string, size: number, color: string) => {
    const ionicon = iconMap[icon];
    if (ionicon) {
      return <Ionicons name={ionicon} size={size} color={color} />;
    }
    return <Text style={{ fontSize: size, color }}>{icon}</Text>;
  };

  const clearExpandedAction = useCallback(() => {
    setExpandedAction(null);
  }, []);

  const collapseAction = useCallback((instant = false) => {
    if (!expandedAction) return;

    if (instant) {
      expansion.value = 0;
      clearExpandedAction();
      return;
    }

    expansion.value = withTiming(0, COLLAPSE_CONFIG, (finished) => {
      if (finished) {
        runOnJS(clearExpandedAction)();
      }
    });
  }, [clearExpandedAction, expansion, expandedAction]);

  const openAction = useCallback((action: MetaAction) => {
    setExpandedAction(action);
    expansion.value = withSpring(1, SPRING_CONFIG);
  }, [expansion]);

  const handleInvoke = useCallback((action: MetaAction) => {
    const hasChildren = Boolean(action.children?.length);

    if (hasChildren) {
      if (expandedAction?.action === action.action) {
        collapseAction();
        return;
      }
      openAction(action);
      return;
    }

    onAction(action.action);
    if (expandedAction) {
      collapseAction();
    }
  }, [collapseAction, expandedAction, onAction, openAction]);

  useEffect(() => {
    if (!expandedAction) return;

    const actionSet = new Set<string>();
    const collect = (action?: MetaAction | null) => {
      if (!action) return;
      actionSet.add(action.action);
      action.children?.forEach(collect);
    };

    collect(left ?? null);
    collect(center);
    collect(right ?? null);

    if (!actionSet.has(expandedAction.action)) {
      collapseAction(true);
    }
  }, [center, left, right, expandedAction, collapseAction]);

  const collapsedWidth = 180;
  const expandedWidth = Math.min(screenWidth - 32, 360);
  const collapsedRadius = 100;
  const expandedRadius = 42;

  const containerAnimatedStyle = useAnimatedStyle(() => {
    
    // Reset width and radius immediately when collapsed
    if (expansion.value === 0) {
      return {
        width: collapsedWidth,
        borderRadius: collapsedRadius,
        transform: [{ translateY: 0 }],
      };
    }

    const width = interpolate(
      expansion.value,
      [0, 1],
      [collapsedWidth, expandedWidth],
      Extrapolation.CLAMP,
    );
    const radius = interpolate(
      expansion.value,
      [0, 1],
      [collapsedRadius, expandedRadius],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(expansion.value, [0, 1], [0, -12], Extrapolation.CLAMP);

    return {
      width,
      borderRadius: radius,
      transform: [{ translateY }],
    };
  });

  const blurAnimatedStyle = useAnimatedStyle(() => ({
    // When not expanded (value near 0), keep width at 100% of container
    // When expanding, allow it to grow with the container
    width: '100%',
    paddingBottom: 4 + expansion.value * 16,
    borderRadius: interpolate(
      expansion.value,
      [0, 1],
      [collapsedRadius, expandedRadius],
      Extrapolation.CLAMP,
    ),
    backgroundColor: interpolateColor(
      expansion.value,
      [0, 1],
      ['rgba(22, 24, 28, 0.95)', 'rgba(18, 20, 24, 0.98)'],
    ),
  }));

  const expandedSectionStyle = useAnimatedStyle(() => ({
    opacity: expansion.value,
    transform: [{ translateY: (1 - expansion.value) * 12 }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: expansion.value * 0.85,
  }));

  const renderSide = (action?: MetaAction | null) => (
    <View style={styles.sideContainer}>
      {action ? (
        <Pressable
          onPress={() => handleInvoke(action)}
          style={[
            styles.sideButton,
            expandedAction?.action === action.action && styles.sideButtonExpanded,
          ]}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          accessibilityHint={action.children?.length ? 'Expands more actions' : undefined}
        >
          {renderIcon(
            action.icon,
            20,
            expandedAction?.action === action.action ? '#E7E9EA' : '#71767B'
          )}
        </Pressable>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );

  const renderCenter = () => {
    const isExpanded = expandedAction?.action === center.action;
    const centerIconColor = isActive || isExpanded ? '#E7E9EA' : '#000';

    return (
      <Pressable
        onPress={() => handleInvoke(center)}
        style={[
          styles.centerButton,
          isActive && styles.centerActive,
          isExpanded && styles.centerExpanded,
        ]}
        accessibilityRole="button"
        accessibilityLabel={center.label}
        accessibilityHint={center.children?.length ? 'Expands more actions' : undefined}
      >
        {renderIcon(center.icon, 22, centerIconColor)}
      </Pressable>
    );
  };

  const renderChild = (action: MetaAction) => {
    const hasChildren = Boolean(action.children?.length);
    return (
      <Pressable
        key={action.action}
        onPress={() => handleInvoke(action)}
        style={styles.childButton}
        accessibilityRole="button"
        accessibilityLabel={action.label}
        accessibilityHint={hasChildren ? 'Shows nested actions' : undefined}
      >
        <View style={styles.childIconWrap}>
          {renderIcon(action.icon, 18, '#E7E9EA')}
        </View>
        <Text style={styles.childLabel}>{action.label}</Text>
        {hasChildren && <Text style={styles.childMore}>›</Text>}
      </Pressable>
    );
  };

  return (
    <View pointerEvents="box-none" style={styles.host}>
      {expandedAction && (
        <AnimatedPressable
          style={[styles.backdrop, backdropAnimatedStyle]}
          onPress={() => collapseAction()}
          accessibilityRole="button"
          accessibilityLabel="Close expanded actions"
        />
      )}
      <Animated.View
        style={[styles.container, { bottom: insets.bottom + 16 }, containerAnimatedStyle]}
      >
        <Animated.View style={[styles.blur, blurAnimatedStyle]}>
          {expandedAction?.children?.length ? (
            <Animated.View style={[styles.expandedSection, expandedSectionStyle]}>
              <View style={styles.expandedHeader}>
                <Text style={styles.expandedTitle}>{expandedAction.label}</Text>
                <Pressable
                  onPress={() => collapseAction()}
                  style={styles.collapseButton}
                  accessibilityRole="button"
                  accessibilityLabel="Collapse actions"
                >
                  <Ionicons name="close" size={16} color="#E7E9EA" />
                </Pressable>
              </View>
              <View style={styles.childrenGrid}>
                {expandedAction.children.map(renderChild)}
              </View>
            </Animated.View>
          ) : null}
          <View style={styles.content}>
            {renderSide(left)}
            {renderCenter()}
            {renderSide(right)}
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  host: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 70,
  },
  container: {
    position: 'absolute' as const,
    alignSelf: 'center' as const,
    borderRadius: 100,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 70,
  },
  backdrop: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 60,
  },
  blur: {
    backgroundColor: 'rgba(22, 24, 28, 0.95)',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  content: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    justifyContent: 'center' as const,
  },
  expandedSection: {
    width: '100%',
    marginBottom: 12,
    padding: 4,
    borderRadius: 28,
    backgroundColor: 'transparent', // Remove nested background
    borderWidth: 0, // Remove nested border
    borderColor: 'transparent',
  },
  expandedHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  expandedTitle: {
    color: '#E7E9EA',
    fontWeight: '600' as const,
    fontSize: 18,
    marginLeft: 12,
  },
  collapseButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  sideContainer: {
    width: 36,
    height: 36,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  sideButton: {
    width: '100%',
    height: '100%',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 18,
  },
  sideButtonExpanded: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  placeholder: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#2F3336',
    opacity: 0.3,
  },
  centerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E7E9EA',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  centerActive: {
    backgroundColor: '#1F2226',
  },
  centerExpanded: {
    backgroundColor: '#1F2226',
  },
  childrenGrid: {
    flexDirection: 'column' as const, // Stack vertically like the reference
    gap: 8,
  },
  childButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: 'rgba(231, 233, 234, 0.08)', // Slightly lighter
    borderRadius: 24, // More rounded pills
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: '100%',
  },
  childIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 16,
    backgroundColor: 'transparent', // No background for icon
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  childLabel: {
    color: '#E7E9EA',
    fontSize: 16,
    fontWeight: '600' as const,
    flex: 1,
  },
  childMore: {
    color: '#747A80',
    fontSize: 18,
    marginLeft: 8,
  },
});
