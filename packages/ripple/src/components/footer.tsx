import { View, Pressable } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';
import { footerStyles as styles } from './footer.styles';

interface FooterProps {
  onComment?: () => void;
  onShare?: () => void;
  onLike?: () => void;
}

export const Footer = ({ onComment, onShare, onLike }: FooterProps) => {
  const { theme } = useUnistyles();
  const iconColor = theme.colors.textMuted;

  return (
    <View style={styles.container}>
      <Pressable onPress={onComment} style={styles.action}>
        <Ionicons name="chatbubble-outline" size={18} color={iconColor} />
      </Pressable>
      <Pressable onPress={onShare} style={styles.action}>
        <Ionicons name="repeat-outline" size={18} color={iconColor} />
      </Pressable>
      <Pressable onPress={onLike} style={styles.action}>
        <Ionicons name="heart-outline" size={18} color={iconColor} />
      </Pressable>
    </View>
  );
};
