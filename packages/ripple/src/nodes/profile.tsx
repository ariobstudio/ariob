import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';

export interface ProfileData {
  avatar: string;
  handle: string;
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
          <Ionicons name="shield-checkmark" size={12} color="#00BA7C" />
          <Text style={styles.badgeText}>Identity Anchored</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#050505',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  bg: {
    height: 60,
    backgroundColor: 'rgba(0, 186, 124, 0.05)',
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
  },
  content: {
    padding: 16,
    alignItems: 'center' as const,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#1F2226',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: 'rgba(0, 186, 124, 0.3)',
    marginBottom: 8,
  },
  avatarCreate: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed' as const,
  },
  createTitle: {
    color: '#E7E9EA',
    fontWeight: 'bold' as const,
    fontSize: 16,
    marginBottom: 4,
  },
  createSubtitle: {
    color: '#71767B',
    fontSize: 12,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#16181C',
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#2F3336',
    width: '100%',
  },
  atSymbol: {
    color: '#71767B',
    fontSize: 14,
    marginRight: 2,
  },
  input: {
    flex: 1,
    color: '#E7E9EA',
    fontSize: 14,
    fontWeight: '600' as const,
    paddingVertical: 8,
  },
  anchorButton: {
    backgroundColor: '#E7E9EA',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginLeft: 8,
  },
  anchorButtonDisabled: {
    backgroundColor: '#2F3336',
    opacity: 0.5,
  },
  avatarText: {
    fontSize: 24,
    color: '#00BA7C',
    fontWeight: 'bold' as const,
  },
  name: {
    color: '#E7E9EA',
    fontWeight: 'bold' as const,
    fontSize: 16,
  },
  handle: {
    color: '#71767B',
    fontSize: 12,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  badge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    backgroundColor: 'rgba(0, 186, 124, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 186, 124, 0.2)',
  },
  badgeIcon: {
    fontSize: 10,
  },
  badgeText: {
    color: '#00BA7C',
    fontSize: 10,
    fontWeight: 'bold' as const,
    textTransform: 'uppercase' as const,
  },
});
