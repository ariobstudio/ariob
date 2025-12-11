import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { profileStyles as styles } from './profile.styles';

export interface ProfileData {
  avatar?: string;
  handle: string;
  name?: string;
  bio?: string;
  verified?: boolean;
  stats?: { posts: number; followers: number; following: number };
  pubkey?: string;
  mode?: 'view' | 'create';
}

interface ProfileProps {
  data: ProfileData;
  onAnchor?: (handle: string) => void;
}

export const Profile = ({ data, onAnchor }: ProfileProps) => {
  const [handle, setHandle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnchor = async () => {
    if (!handle.trim() || !onAnchor) return;
    setLoading(true);
    await onAnchor(handle);
    setLoading(false);
  };

  if (data.mode === 'create') {
    return (
      <View style={styles.container}>
        <View style={styles.bg} />
        <View style={styles.content}>
          <View style={[styles.avatarLarge, styles.avatarCreate]}>
            <Ionicons name="person-add-outline" size={24} color="#536471" />
          </View>
          
          <Text style={styles.createTitle}>Anchor Identity</Text>
          <Text style={styles.createSubtitle}>Claim your handle to join the mesh.</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.atSymbol}>@</Text>
            <TextInput
              style={styles.input}
              placeholder="username"
              placeholderTextColor="#536471"
              value={handle}
              onChangeText={setHandle}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable 
              style={[styles.anchorButton, !handle && styles.anchorButtonDisabled]}
              onPress={handleAnchor}
              disabled={!handle || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Ionicons name="arrow-forward" size={16} color="#000" />
              )}
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.bg} />
      <View style={styles.content}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>{data.avatar}</Text>
        </View>
        <Text style={styles.name}>{data.avatar}</Text>
        <Text style={styles.handle}>{data.handle}</Text>
        <View style={styles.badge}>
          <Ionicons name="shield-checkmark" size={12} style={styles.badgeIcon} />
          <Text style={styles.badgeText}>Identity Anchored</Text>
        </View>
        {data.pubkey && (
          <View style={styles.keyContainer}>
            <Text style={styles.keyLabel}>Public Key</Text>
            <Text numberOfLines={1} style={styles.keyValue}>
              {data.pubkey}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};
