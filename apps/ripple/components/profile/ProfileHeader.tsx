/**
 * ProfileHeader - Elegant profile header with editorial typography
 *
 * Displays user identity with large, light-weight typography following
 * the Liquid Trust design aesthetic. Includes settings access and
 * optional bio text.
 * Refactored to use Unistyles for theme reactivity
 *
 * @example
 * ```tsx
 * <ProfileHeader
 *   alias="alice"
 *   bio="Building decentralized social networks"
 *   onSettingsPress={() => router.push('/settings')}
 * />
 * ```
 *
 * **Design Notes:**
 * - Name uses 40px font with light (300) weight for elegance
 * - Settings icon is minimal, positioned top-right
 * - Animated entrance with FadeInDown
 * - Bio text has max-width constraint for readability
 *
 * @see ProfileStats - Companion component for follower counts
 * @see ProfileTabs - Content tabs below the header
 */

import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { AnimatedPressable } from '../AnimatedPressable';

export interface ProfileHeaderProps {
  alias: string;
  bio?: string;
  onSettingsPress: () => void;
}

export function ProfileHeader({ alias, bio, onSettingsPress }: ProfileHeaderProps) {
  const { theme } = useUnistyles();

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.container}>
      {/* Settings icon - minimal, top right */}
      <View style={styles.settingsRow}>
        <AnimatedPressable onPress={onSettingsPress} scaleDown={0.95}>
          <View style={styles.settingsButton}>
            <Ionicons name="settings-sharp" size={20} color={theme.colors.textSecondary} />
          </View>
        </AnimatedPressable>
      </View>

      {/* Name - large, light weight for elegance */}
      <Text style={styles.name}>{alias}</Text>

      {/* Bio - if exists */}
      {bio && <Text style={styles.bio}>{bio}</Text>}
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  settingsRow: {
    alignItems: 'flex-end',
    marginBottom: theme.spacing.xxl,
  },
  settingsButton: {
    padding: theme.spacing.sm,
  },
  name: {
    fontSize: 40,
    fontWeight: '300', // Light weight for elegance
    color: theme.colors.textPrimary,
    letterSpacing: -1,
    marginBottom: theme.spacing.sm,
  },
  bio: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    maxWidth: 320,
  },
}));
