/**
 * Profile Page - Simple user profile view
 *
 * Shows avatar, name, and basic actions.
 * Uses useBar() hook to configure the global Bar.
 */

import { useCallback } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { StyleSheet } from 'react-native-unistyles';
import { Text, Avatar, Button, Stack, useUnistyles } from '@ariob/andromeda';
import { useAuth, leave } from '@ariob/core';
import { useBar, Shell } from '@ariob/ripple';

export default function ProfilePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const { theme } = useUnistyles();
  const bar = useBar();

  const isOwnProfile = currentUser?.pub === id;
  const displayName = isOwnProfile ? (currentUser?.alias || 'Unknown') : 'User';
  const handle = displayName.toLowerCase().replace(/\s+/g, '');
  const avatarChar = displayName[0]?.toUpperCase() || '?';

  // Handle logout
  const handleLogout = useCallback(async () => {
    await leave();
    router.replace('/');
  }, []);

  // Bar actions
  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const handleEdit = useCallback(() => {
    console.log('Edit profile');
  }, []);

  const handleMore = useCallback(() => {
    console.log('More options');
  }, []);

  // Set up bar actions when screen gains focus
  useFocusEffect(
    useCallback(() => {
      bar.setActions({
        leading: [{ icon: 'arrow-back', onPress: handleBack }],
        primary: isOwnProfile ? { icon: 'pencil', onPress: handleEdit } : undefined,
        trailing: [{ icon: 'ellipsis-vertical', onPress: handleMore }],
      });
    }, [bar.setActions, isOwnProfile, handleBack, handleEdit, handleMore])
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.content}>
        <Shell style={styles.card}>
          <Stack gap="md" align="center">
            <Avatar char={avatarChar} size="lg" tint="accent" />
            <Stack gap="xs" align="center">
              <Text size="title" color="text" style={styles.name}>
                {displayName}
              </Text>
              <Text size="body" color="dim">
                @{handle}
              </Text>
            </Stack>
            {isOwnProfile && (
              <Button
                onPress={handleLogout}
                variant="outline"
                tint="danger"
                size="md"
              >
                Log Out
              </Button>
            )}
          </Stack>
        </Shell>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.space.lg,
    paddingBottom: 100, // Space for bar
  },
  card: {
    padding: theme.space.xl,
  },
  name: {
    fontWeight: '700',
  },
}));
