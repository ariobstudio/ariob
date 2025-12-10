import { View, Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export interface SyncData {
  teaser: string;
}

interface SyncProps {
  data: SyncData;
}

export const Sync = ({ data }: SyncProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.avatars}>
        <View style={[styles.avatar, { backgroundColor: '#1D9BF0' }]}>
          <Text style={styles.avatarText}>EF</Text>
        </View>
        <View style={[styles.avatar, { backgroundColor: '#7856FF' }]}>
          <Text style={styles.avatarText}>CD</Text>
        </View>
        <View style={[styles.avatar, { backgroundColor: '#1F2226' }]}>
          <Text style={styles.avatarText}>+2</Text>
        </View>
      </View>
      <Text style={styles.title}>New updates from {data.teaser}</Text>
      <Text style={styles.subtitle}>and other nodes in your extended graph.</Text>
      <View style={styles.button}>
        <Text style={styles.buttonText}>Tap to Sync</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center' as const,
    padding: 16,
    gap: 8,
  },
  avatars: {
    flexDirection: 'row' as const,
    marginLeft: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#111',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginLeft: -12,
  },
  avatarText: {
    fontSize: 10,
    fontWeight: 'bold' as const,
    color: '#FFF',
  },
  title: {
    color: '#E7E9EA',
    fontWeight: '500' as const,
    fontSize: 14,
  },
  subtitle: {
    color: '#71767B',
    fontSize: 12,
    marginBottom: 4,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  buttonText: {
    fontSize: 12,
    color: '#E7E9EA',
    fontWeight: 'bold' as const,
  },
});
