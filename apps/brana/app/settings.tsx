import { View, Text, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import { useThemeColor } from '@/constants/theme';
import { textStyles } from '@/constants/typography';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();

  // Theme colors - use direct values for consistency
  const backgroundColor = colorScheme === 'dark' ? '#121212' : '#E4E4E4';
  const foregroundColor = useThemeColor('foreground');
  const mutedColor = useThemeColor('muted');
  const borderColor = useThemeColor('border');

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <FontAwesome6 name="arrow-left" size={18} color={mutedColor as string} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: foregroundColor as string }]}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.messageContainer}>
          <FontAwesome6 name="gear" size={28} color={borderColor as string} />
          <Text style={[styles.title, { color: foregroundColor as string }]}>Settings</Text>
          <Text style={[styles.description, { color: mutedColor as string }]}>
            This section is being worked on.{'\n'}
            More options coming soon.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  headerTitle: {
    ...textStyles.h3,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  messageContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  title: {
    ...textStyles.body,
    marginTop: 16,
    textAlign: 'center',
  },
  description: {
    ...textStyles.bodySmall,
    marginTop: 8,
    textAlign: 'center',
  },
});
