import { View, Pressable } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Ionicons } from '@expo/vector-icons';

interface FooterProps {
  onComment?: () => void;
  onShare?: () => void;
  onLike?: () => void;
}

export const Footer = ({ onComment, onShare, onLike }: FooterProps) => {
  return (
    <View style={styles.container}>
      <Pressable onPress={onComment} style={styles.action}>
        <Ionicons name="chatbubble-outline" size={18} color="#71767B" />
      </Pressable>
      <Pressable onPress={onShare} style={styles.action}>
        <Ionicons name="repeat-outline" size={18} color="#71767B" />
      </Pressable>
      <Pressable onPress={onLike} style={styles.action}>
        <Ionicons name="heart-outline" size={18} color="#71767B" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row' as const,
    gap: 40,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  action: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    padding: 4,
  },
});
