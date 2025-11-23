import { View, Text, Pressable } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';

export interface AuthData {
  // Empty for now, auth node is static
}

interface AuthProps {
  data: AuthData;
}

export const Auth = ({ data }: AuthProps) => {
  return (
    <View style={styles.container}>
      <Pressable style={styles.option}>
        <View style={[styles.icon, styles.keyIcon]}>
          <Ionicons name="key-outline" size={18} color="#7856FF" />
        </View>
        <View style={styles.text}>
          <Text style={styles.title}>Import Private Key</Text>
          <Text style={styles.subtitle}>Restore an existing node</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#71767B" />
      </Pressable>
      
      <Pressable style={styles.option}>
        <View style={[styles.icon, styles.walletIcon]}>
          <Ionicons name="wallet-outline" size={18} color="#1D9BF0" />
        </View>
        <View style={styles.text}>
          <Text style={styles.title}>Connect Wallet</Text>
          <Text style={styles.subtitle}>Use external signer</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#71767B" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    gap: 8,
  },
  option: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    gap: 12,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  keyIcon: {
    backgroundColor: 'rgba(120, 86, 255, 0.15)',
  },
  walletIcon: {
    backgroundColor: 'rgba(29, 155, 240, 0.15)',
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#E7E9EA',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#71767B',
  },
});
