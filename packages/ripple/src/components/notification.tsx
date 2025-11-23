import { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';

interface NotificationData {
  id: string;
  title: string;
  message: string;
  icon: string;
  actionLabel?: string;
}

interface NotificationProps {
  data: NotificationData;
  onDismiss: () => void;
  onAction?: () => void;
}

export const Notification = ({ data, onDismiss, onAction }: NotificationProps) => {
  const insets = useSafeAreaInsets();
  
  const getIcon = () => {
    switch (data.icon) {
      case 'lock': return 'lock-closed-outline';
      case 'user': return 'person-outline';
      case 'zap': return 'flash-outline';
      default: return 'information-circle-outline';
    }
  };

  useEffect(() => {
    const timer = setTimeout(onDismiss, 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View 
      entering={SlideInUp.duration(500).springify()} 
      exiting={SlideOutUp.duration(300)}
      style={[styles.wrapper, { top: insets.top + 60 }]}
    >
      <View style={styles.container}>
        <View style={styles.accentBar} />
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name={getIcon()} size={20} color="#1D9BF0" />
          </View>
          <View style={styles.textContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>{data.title}</Text>
              <Pressable onPress={onDismiss} hitSlop={10}>
                <Ionicons name="close" size={18} color="#71767B" />
              </Pressable>
            </View>
            <Text style={styles.message}>{data.message}</Text>
            
            {data.actionLabel && (
              <Pressable onPress={onAction} style={styles.actionButton}>
                <Text style={styles.actionText}>{data.actionLabel}</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute' as const,
    left: 12,
    right: 12,
    zIndex: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(22, 24, 28, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  accentBar: {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#1D9BF0',
  },
  content: {
    flexDirection: 'row' as const,
    padding: 12,
    paddingLeft: 18,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(29, 155, 240, 0.15)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 2,
  },
  title: {
    color: '#E7E9EA',
    fontWeight: '600' as const,
    fontSize: 13,
  },
  message: {
    color: '#71767B',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
    marginBottom: 8,
  },
  actionButton: {
    backgroundColor: '#E7E9EA',
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center' as const,
  },
  actionText: {
    color: '#000',
    fontWeight: 'bold' as const,
    fontSize: 12,
  },
});
