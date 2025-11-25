import { View, Text } from 'react-native';
import { Avatar } from '../primitives/avatar';
import { Badge } from '../primitives/badge';
import { headerStyles as styles } from './header.styles';

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

