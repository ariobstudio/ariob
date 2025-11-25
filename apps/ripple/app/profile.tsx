import { View, Text, Pressable, ScrollView, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Profile as ProfileCard } from '@ariob/ripple';
import { useAuth, leave } from '@ariob/core';
import { useState } from 'react';
import { useUnistyles } from 'react-native-unistyles';
import { profileScreenStyles as styles } from './styles/profile.styles';

export default function ProfileSettings() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { theme } = useUnistyles();
  const [ghostMode, setGhostMode] = useState(false);

  const displayName = user?.alias || 'Unknown User';
  const handle = '@' + (user?.alias || 'anon');
  const profileData = {
    avatar: displayName[0]?.toUpperCase() || '?',
    handle,
    pubkey: user?.pub,
    mode: 'view' as const,
  };

  return (
    <View style={styles.container}>
      <View style={[styles.navBar, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.navTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <ProfileCard data={profileData} />
          <View style={styles.keyCard}>
            <Text style={styles.keyLabel}>Public Key</Text>
            <Text numberOfLines={1} style={styles.keyValue}>
              {user?.pub || 'Not available'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.listItem}>
            <Text style={styles.listLabel}>Ghost Mode</Text>
            <Switch
              value={ghostMode}
              onValueChange={setGhostMode}
              trackColor={{ false: theme.colors.border, true: theme.colors.accent }}
              thumbColor={theme.colors.textPrimary}
            />
          </View>
          <View style={styles.listItem}>
            <Text style={styles.listLabel}>Mesh Network</Text>
            <Text style={styles.listValue}>Connected</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.listLabel}>Local Peers</Text>
            <Text style={styles.listValue}>On</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.listItem}>
            <Text style={styles.listLabel}>Keys & Security</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
          </View>
          <View style={styles.listItem}>
            <Text style={styles.listLabel}>Notifications</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.listItem}>
            <Text style={styles.listLabel}>Storage & Data</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
          </View>
        </View>

        <Pressable
          style={styles.logoutButton}
          onPress={() => {
            leave();
            router.back();
          }}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>

        <Text style={styles.version}>Ripple v0.1.0 (Alpha)</Text>
      </ScrollView>
    </View>
  );
}
