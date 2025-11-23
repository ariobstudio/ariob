import { View, Text } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Avatar } from '../primitives/avatar';
import { Badge } from '../primitives/badge';

interface HeaderProps {
  author: string;
  timestamp: string;
  avatar?: string;
  variant?: 'default' | 'companion' | 'auth';
  badges?: Array<{ label: string; variant: 'dm' | 'ai' | 'new' }>;
  onAvatarPress?: () => void;
}

export const Header = ({ author, timestamp, avatar, variant = 'default', badges, onAvatarPress }: HeaderProps) => {
  return (
    <View style={styles.container}>
      <Avatar 
        label={avatar || (author ? author[0] : '?')} 
        variant={variant}
        onPress={onAvatarPress}
      />
      
      <View style={styles.meta}>
        <View style={styles.authorRow}>
          <Text style={styles.author}>{author}</Text>
          {badges?.map((badge, idx) => (
            <Badge key={idx} label={badge.label} variant={badge.variant} />
          ))}
        </View>
        <Text style={styles.timestamp}>{timestamp}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row' as const,
    marginBottom: 8,
  },
  meta: {
    flex: 1,
    marginLeft: 8,
    justifyContent: 'center' as const,
  },
  authorRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  author: {
    color: '#E7E9EA',
    fontWeight: 'bold' as const,
    fontSize: 14,
  },
  timestamp: {
    color: '#71767B',
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: 2,
  },
});
