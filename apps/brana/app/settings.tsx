import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <FontAwesome6 name="arrow-left" size={18} color="#8E8E93" />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.messageContainer}>
          <FontAwesome6 name="gear" size={28} color="#3A3A3C" />
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.description}>
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
    backgroundColor: '#000',
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
    color: '#fff',
    fontSize: 18,
    fontFamily: 'IBMPlexMono_500Medium',
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
    color: '#fff',
    fontSize: 16,
    fontFamily: 'IBMPlexMono_500Medium',
    marginTop: 16,
    textAlign: 'center',
  },
  description: {
    color: '#8E8E93',
    fontSize: 14,
    fontFamily: 'IBMPlexMono_400Regular',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});
