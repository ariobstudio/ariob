import { View, Text, Pressable } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';

export interface AuthData {
  // Empty for now, auth node is static
}

interface AuthProps {
  data: AuthData;
}

export const Auth = ({ data }: AuthProps) => {
  const { theme } = useUnistyles();

  return (
    <View style={styles.container}>
      <Pressable style={styles.option}>
        <View style={[styles.icon, styles.keyIcon]}>
          <Ionicons name="key-outline" size={18} color={theme.colors.indicator.auth} />
        </View>
        <View style={styles.text}>
          <Text style={styles.title}>Import Private Key</Text>
          <Text style={styles.subtitle}>Restore an existing node</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
      </Pressable>

      <Pressable style={styles.option}>
        <View style={[styles.icon, styles.walletIcon]}>
          <Ionicons name="wallet-outline" size={18} color={theme.colors.indicator.message} />
        </View>
        <View style={styles.text}>
          <Text style={styles.title}>Connect Wallet</Text>
          <Text style={styles.subtitle}>Use external signer</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  option: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    gap: theme.spacing.md,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  keyIcon: {
    backgroundColor: theme.colors.accentSoft,
  },
  walletIcon: {
    backgroundColor: theme.colors.accentSoft,
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
}));
