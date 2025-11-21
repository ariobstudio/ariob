/**
 * ProfileHeader - Refined, editorial profile header
 */

import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme } from '../../theme';
import { AnimatedPressable } from '../AnimatedPressable';

interface ProfileHeaderProps {
  alias: string;
  bio?: string;
  onSettingsPress: () => void;
}

export function ProfileHeader({ alias, bio, onSettingsPress }: ProfileHeaderProps) {
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

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  settingsRow: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  settingsButton: {
    padding: 8,
  },
  name: {
    fontSize: 40,
    fontWeight: '300', // Light weight for elegance
    color: theme.colors.text,
    letterSpacing: -1,
    marginBottom: 8,
  },
  bio: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.textSecondary,
    fontWeight: '400',
    maxWidth: 320,
  },
});
