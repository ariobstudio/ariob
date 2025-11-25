import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Profile as ProfileCard } from '@ariob/ripple';
import { useUnistyles } from 'react-native-unistyles';
import { profileScreenStyles as styles } from '../styles/profile.styles';

export default function UserProfile() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  
  const isRipple = id === 'Ripple';
  const displayName = isRipple ? 'Ripple' : (typeof id === 'string' ? id : 'Unknown');
  const handle = '@' + displayName.replace(/\s+/g, '').toLowerCase();

  const profileData = {
    avatar: displayName[0]?.toUpperCase() || '?',
    handle,
    pubkey: isRipple ? 'System AI Companion' : 'Unknown Public Key',
    mode: 'view' as const,
  };

  return (
    <View style={styles.container}>
      <View style={[styles.navBar, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.navTitle}>{displayName}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <ProfileCard data={profileData} />
          
          {isRipple && (
            <View style={styles.keyCard}>
              <Text style={styles.keyLabel}>Status</Text>
              <Text style={styles.keyValue}>Online • AI Mesh Active</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
           <View style={styles.listItem}>
            <Text style={styles.listLabel}>Mesh Network</Text>
            <Text style={styles.listValue}>Connected</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

