/**
 * Settings Screen
 *
 * Functional settings with real @packages/core integration
 * - Username management
 * - Key export
 * - App preferences
 */

import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Switch,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  TextInput,
  Share,
  Clipboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth, leave, graph as getGraph } from '@ariob/core';
import { AnimatedPressable } from '../components/AnimatedPressable';
import { theme } from '../theme';

export default function SettingsScreen() {
  const { user, isAuthenticated } = useAuth();

  // Settings state
  const [editingAlias, setEditingAlias] = useState(false);
  const [newAlias, setNewAlias] = useState(user?.alias || '');
  const [defaultDegree, setDefaultDegree] = useState<0 | 1 | 2 | 3 | 4>(1);
  const [notifications, setNotifications] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [showUnread, setShowUnread] = useState(true);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? Make sure you have backed up your keys.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            // Clear saved keys and onboarding status
            await AsyncStorage.removeItem('userKeys');
            await AsyncStorage.removeItem('hasOnboarded');

            // Logout from Gun
            leave();

            console.log('[Settings] ✓ Logged out and cleared local data');
          },
        },
      ]
    );
  };

  const handleExportKeys = () => {
    if (!user?.pub) {
      Alert.alert('Error', 'No user session found');
      return;
    }

    // Get user's keypair from Gun
    const userRef = getGraph().user();
    const keypair = userRef._.sea;

    if (!keypair) {
      Alert.alert('Error', 'Could not retrieve keys. Please ensure you are logged in.');
      return;
    }

    const keysText = JSON.stringify(
      {
        pub: keypair.pub,
        priv: keypair.priv,
        epub: keypair.epub,
        epriv: keypair.epriv,
      },
      null,
      2
    );

    Alert.alert(
      'Export Keys',
      'Your private keys are extremely sensitive. Keep them safe and never share them with anyone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Copy to Clipboard',
          onPress: () => {
            Clipboard.setString(keysText);
            Alert.alert('Success', 'Keys copied to clipboard');
          },
        },
        {
          text: 'Share',
          onPress: async () => {
            try {
              await Share.share({
                message: keysText,
                title: 'Ripple Account Keys',
              });
            } catch (error) {
              console.error('Error sharing keys:', error);
            }
          },
        },
        {
          text: 'View Keys',
          onPress: () => {
            Alert.alert('Your Keys', keysText);
          },
        },
      ]
    );
  };

  const handleShowKeys = () => {
    if (!user?.pub) {
      Alert.alert('Error', 'No user session found');
      return;
    }

    const userRef = getGraph().user();
    const keypair = userRef._.sea;

    if (!keypair) {
      Alert.alert('Error', 'Could not retrieve keys');
      return;
    }

    const keysText = JSON.stringify(
      {
        pub: keypair.pub,
        priv: keypair.priv,
        epub: keypair.epub,
        epriv: keypair.epriv,
      },
      null,
      2
    );

    Alert.alert(
      'Your Keys (Debug)',
      keysText,
      [
        { text: 'Close', style: 'cancel' },
        {
          text: 'Copy',
          onPress: () => {
            Clipboard.setString(keysText);
            Alert.alert('Success', 'Keys copied to clipboard');
          },
        },
      ]
    );
  };

  const handleSaveAlias = () => {
    if (newAlias.trim() && newAlias !== user?.alias) {
      // Save alias to Gun user profile
      const userRef = getGraph().user();
      userRef.get('profile').get('alias').put({ alias: newAlias.trim() } as any, (ack: any) => {
        if (ack.err) {
          Alert.alert('Error', 'Failed to update username: ' + ack.err);
        } else {
          Alert.alert('Success', 'Username updated');
          setEditingAlias(false);
        }
      });
    } else {
      setEditingAlias(false);
    }
  };

  const renderDegreeOption = (
    degree: 0 | 1 | 2 | 3 | 4,
    label: string,
    icon: keyof typeof Ionicons.glyphMap
  ) => {
    const isSelected = defaultDegree === degree;

    return (
      <AnimatedPressable
        key={degree}
        onPress={() => setDefaultDegree(degree)}
        scaleDown={0.95}
      >
        <View style={[styles.degreeOption, isSelected && styles.degreeOptionSelected]}>
          <Ionicons
            name={icon}
            size={20}
            color={isSelected ? theme.colors.background : theme.colors.text}
          />
          <Text style={[styles.degreeOptionText, isSelected && styles.degreeOptionTextSelected]}>
            {label}
          </Text>
        </View>
      </AnimatedPressable>
    );
  };

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={['top']} style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.title}>Settings</Text>
          <View style={styles.headerSpacer} />
        </SafeAreaView>
        <View style={styles.notAuthenticatedContainer}>
          <Text style={styles.notAuthenticatedText}>Not authenticated</Text>
          <Text style={styles.notAuthenticatedSubtext}>Please log in to access settings</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.title}>Settings</Text>
          <View style={styles.headerSpacer} />
        </SafeAreaView>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Profile Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile</Text>

            <View style={styles.profileCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.alias?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                {editingAlias ? (
                  <View style={styles.aliasEditContainer}>
                    <TextInput
                      style={styles.aliasInput}
                      value={newAlias}
                      onChangeText={setNewAlias}
                      placeholder="Enter username"
                      placeholderTextColor={theme.colors.textTertiary}
                      autoFocus
                    />
                    <View style={styles.aliasButtons}>
                      <AnimatedPressable onPress={() => setEditingAlias(false)}>
                        <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
                      </AnimatedPressable>
                      <AnimatedPressable onPress={handleSaveAlias}>
                        <Ionicons name="checkmark" size={20} color={theme.colors.text} />
                      </AnimatedPressable>
                    </View>
                  </View>
                ) : (
                  <Pressable onPress={() => setEditingAlias(true)}>
                    <Text style={styles.profileName}>{user.alias || 'Set username'}</Text>
                    <Text style={styles.editHint}>Tap to edit</Text>
                  </Pressable>
                )}
                <Text style={styles.profilePub} numberOfLines={1}>
                  {user.pub.substring(0, 32)}...
                </Text>
              </View>
            </View>
          </View>

          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingLabelContainer}>
                <Text style={styles.settingLabel}>Default Degree</Text>
                <Text style={styles.settingDescription}>
                  The degree filter shown when you open the app
                </Text>
              </View>
            </View>

            <View style={styles.degreeOptions}>
              {renderDegreeOption(0, 'Me', 'person')}
              {renderDegreeOption(1, 'Close', 'people')}
              {renderDegreeOption(2, 'Extended', 'git-network')}
              {renderDegreeOption(3, 'World', 'globe')}
              {renderDegreeOption(4, 'Noise', 'warning')}
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLabelContainer}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingDescription}>
                  Get notified about new posts and mentions
                </Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: theme.colors.border, true: theme.colors.text }}
                thumbColor={theme.colors.background}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLabelContainer}>
                <Text style={styles.settingLabel}>Haptic Feedback</Text>
                <Text style={styles.settingDescription}>Vibrate on interactions</Text>
              </View>
              <Switch
                value={haptics}
                onValueChange={setHaptics}
                trackColor={{ false: theme.colors.border, true: theme.colors.text }}
                thumbColor={theme.colors.background}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLabelContainer}>
                <Text style={styles.settingLabel}>Show Unread Only</Text>
                <Text style={styles.settingDescription}>
                  Only show unread notifications in feed
                </Text>
              </View>
              <Switch
                value={showUnread}
                onValueChange={setShowUnread}
                trackColor={{ false: theme.colors.border, true: theme.colors.text }}
                thumbColor={theme.colors.background}
              />
            </View>
          </View>

          {/* Security Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Security</Text>

            <AnimatedPressable onPress={handleExportKeys}>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Export Keys</Text>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </View>
            </AnimatedPressable>

            <View style={styles.warningBox}>
              <Ionicons name="warning" size={20} color="#FF9500" />
              <Text style={styles.warningText}>
                Your keys are your identity. Keep them safe and backed up. If you lose them, you
                lose access to your account forever.
              </Text>
            </View>
          </View>

          {/* Developer Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Developer</Text>

            <AnimatedPressable onPress={handleShowKeys}>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Show My Keys (Debug)</Text>
                <Ionicons name="code-slash" size={20} color={theme.colors.textSecondary} />
              </View>
            </AnimatedPressable>

            <View style={styles.infoBox}>
              <Text style={styles.infoBoxText}>
                💡 Testing tip: Export your keys, logout, then use "Add an Existing Key" on the
                onboarding screen to switch between multiple test accounts.
              </Text>
            </View>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Version</Text>
              <Text style={styles.settingValue}>1.0.0</Text>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Public Key</Text>
              <Text style={styles.settingValue} numberOfLines={1}>
                {user.pub.substring(0, 16)}...
              </Text>
            </View>
          </View>

          {/* Logout */}
          <AnimatedPressable onPress={handleLogout}>
            <View style={styles.logoutButton}>
              <Text style={styles.logoutText}>Logout</Text>
            </View>
          </AnimatedPressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Ripple - Own Your Identity</Text>
            <Text style={styles.footerText}>Decentralized · Private · Yours</Text>
          </View>
        </ScrollView>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },

  // Not authenticated
  notAuthenticatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  notAuthenticatedText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  notAuthenticatedSubtext: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  // Sections
  section: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.md,
  },

  // Profile Card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text,
  },
  editHint: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  profilePub: {
    fontSize: 11,
    color: theme.colors.textTertiary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 4,
  },

  // Alias editing
  aliasEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  aliasInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.sm,
  },
  aliasButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },

  // Setting Items
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
    minHeight: 52,
  },
  settingLabelContainer: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingLabel: {
    fontSize: 17,
    color: theme.colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  settingValue: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  // Warning box
  warningBox: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: `${theme.colors.surface}80`,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: '#FF950040',
    marginTop: theme.spacing.md,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },

  // Info box
  infoBox: {
    padding: theme.spacing.md,
    backgroundColor: `${theme.colors.surface}80`,
    borderRadius: theme.radii.md,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: `${theme.colors.text}10`,
  },
  infoBoxText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },

  // Degree Options
  degreeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  degreeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.pill,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  degreeOptionSelected: {
    backgroundColor: theme.colors.text,
    borderColor: theme.colors.text,
  },
  degreeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  degreeOptionTextSelected: {
    color: theme.colors.background,
  },

  // Logout
  logoutButton: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xxl,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutText: {
    fontSize: 17,
    color: '#FF3B30',
    fontWeight: '600',
  },

  // Footer
  footer: {
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.xxl * 2,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
});
