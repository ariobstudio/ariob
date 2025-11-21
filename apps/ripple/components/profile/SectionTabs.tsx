/**
 * SectionTabs - Minimal tab switcher
 */

import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { theme } from '../../theme';

type Section = 'all' | 'drafts';

interface SectionTabsProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  counts: { all: number; drafts: number };
}

export function SectionTabs({ activeSection, onSectionChange, counts }: SectionTabsProps) {
  return (
    <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.container}>
      <Tab
        id="all"
        label="All"
        count={counts.all}
        isActive={activeSection === 'all'}
        onPress={() => onSectionChange('all')}
      />
      <Tab
        id="drafts"
        label="Drafts"
        count={counts.drafts}
        isActive={activeSection === 'drafts'}
        onPress={() => onSectionChange('drafts')}
      />
    </Animated.View>
  );
}

function Tab({
  id,
  label,
  count,
  isActive,
  onPress,
}: {
  id: string;
  label: string;
  count: number;
  isActive: boolean;
  onPress: () => void;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withSpring(isActive ? 1 : 0.5),
  }));

  return (
    <Pressable onPress={onPress} style={styles.tab}>
      <Animated.View style={animatedStyle}>
        <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{label}</Text>
        <Text style={[styles.tabCount, isActive && styles.tabCountActive]}>{count}</Text>
      </Animated.View>
      {isActive && <View style={styles.activeIndicator} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 32,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  tab: {
    paddingVertical: 8,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
    marginBottom: 4,
  },
  tabLabelActive: {
    color: theme.colors.text,
  },
  tabCount: {
    fontSize: 20,
    fontWeight: '300',
    color: theme.colors.textSecondary,
    letterSpacing: -0.5,
  },
  tabCountActive: {
    color: theme.colors.text,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: theme.colors.text,
    borderRadius: 1,
  },
});
