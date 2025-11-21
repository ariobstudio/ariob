/**
 * ProfileHeader - User profile header with avatar and bio
 *
 * Displays user avatar, name, and bio information
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface ProfileHeaderProps {
  alias: string;
  bio?: string;
  pub: string;
}

export function ProfileHeader({ alias, bio }: ProfileHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {alias.charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.userName}>{alias}</Text>
      {bio && <Text style={styles.userBio}>{bio}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  userBio: {
    fontSize: 15,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 16,
  },
});
