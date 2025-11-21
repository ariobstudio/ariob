/**
 * Avatar - User avatar with initials fallback
 */

import React from 'react';
import { View, Image, ImageProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Text } from '../primitives/Text';

export interface AvatarProps {
  uri?: string;
  name: string;
  size?: 'small' | 'medium' | 'large';
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size = 'medium',
}) => {
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={[styles.container, styles[`size_${size}`]]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.fallback}>
          <Text
            variant={size === 'small' ? 'caption' : size === 'large' ? 'large' : 'body'}
            weight="semibold"
            color="cream"
          >
            {initials}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    borderRadius: theme.borderRadius.circle,
    overflow: 'hidden',
    backgroundColor: theme.colors.ripple,
  },

  size_small: {
    width: 32,
    height: 32,
  },
  size_medium: {
    width: 48,
    height: 48,
  },
  size_large: {
    width: 64,
    height: 64,
  },

  image: {
    width: '100%',
    height: '100%',
  },

  fallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.mist,
  },
}));
