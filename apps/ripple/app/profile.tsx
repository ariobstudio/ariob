import { View, Text, StyleSheet, Pressable, ScrollView, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@ariob/ripple';
import { useAuth, leave } from '@ariob/core';
import { useState } from 'react';

export default function ProfileSettings() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [ghostMode, setGhostMode] = useState(false);
  
  // Mock User for display if needed
  const displayName = user?.alias || 'Unknown User';
  const handle = '@' + (user?.alias || 'anon');

  const ListItem = ({ 
    icon, 
    color, 
    label, 
    value, 
    hasArrow = true, 
    isSwitch = false, 
    switchValue, 
    onSwitchChange,
    onPress,
    isDestructive = false
  }: any) => (
    <Pressable 
      onPress={isSwitch ? () => onSwitchChange?.(!switchValue) : onPress}
      style={({ pressed }) => [
        styles.listItem,
        pressed && !isSwitch && styles.pressed
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: color }]}>
        <Ionicons name={icon} size={16} color="#FFF" />
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemLabel, isDestructive && styles.destructiveText]}>{label}</Text>
        <View style={styles.itemRight}>
          {value && <Text style={styles.itemValue}>{value}</Text>}
          {isSwitch ? (
            <Switch 
              value={switchValue} 
              onValueChange={onSwitchChange}
              trackColor={{ false: '#3e3e3e', true: '#00BA7C' }}
              thumbColor="#FFF"
            />
          ) : hasArrow ? (
            <Ionicons name="chevron-forward" size={16} color="#536471" />
          ) : null}
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Header / Nav */}
      <View style={[styles.navBar, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#E7E9EA" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.navTitle}>Settings</Text>
        <View style={{ width: 60 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Profile Card */}
        <View style={styles.section}>
          <View style={styles.profileHeader}>
            <Avatar char={displayName[0]?.toUpperCase()} size="large" />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profileHandle}>{handle}</Text>
            </View>
            <Pressable style={styles.qrButton}>
              <Ionicons name="qr-code" size={20} color="#1D9BF0" />
            </Pressable>
          </View>
        </View>

        {/* Network / Connectivity */}
        <View style={styles.section}>
          <ListItem 
            icon="planet" 
            color="#F91880" 
            label="Ghost Mode" 
            isSwitch 
            switchValue={ghostMode} 
            onSwitchChange={setGhostMode} 
          />
          <ListItem 
            icon="wifi" 
            color="#1D9BF0" 
            label="Mesh Network" 
            value="Connected" 
          />
          <ListItem 
            icon="bluetooth" 
            color="#1D9BF0" 
            label="Local Peers" 
            value="On" 
          />
        </View>

        {/* Account / Security */}
        <View style={styles.section}>
          <ListItem 
            icon="key" 
            color="#7856FF" 
            label="Keys & Security" 
          />
          <ListItem 
            icon="notifications" 
            color="#FF3B30" 
            label="Notifications" 
          />
        </View>

         {/* Data */}
         <View style={styles.section}>
          <ListItem 
            icon="server" 
            color="#FF9500" 
            label="Storage & Data" 
          />
        </View>

        {/* Actions */}
        <Pressable 
          style={[styles.button, styles.logoutButton]}
          onPress={() => {
            leave();
            router.back();
          }}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
        
        <Text style={styles.version}>Ripple v0.1.0 (Alpha)</Text>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 12,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#16181C',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  backText: {
    color: '#E7E9EA',
    fontSize: 17,
    marginLeft: 4,
  },
  navTitle: {
    color: '#E7E9EA',
    fontSize: 17,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#16181C',
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    color: '#E7E9EA',
    fontSize: 20,
    fontWeight: '600',
  },
  profileHandle: {
    color: '#71767B',
    fontSize: 14,
  },
  qrButton: {
    padding: 8,
    backgroundColor: 'rgba(29, 155, 240, 0.1)',
    borderRadius: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    minHeight: 44,
    backgroundColor: '#16181C',
  },
  pressed: {
    backgroundColor: '#1F2226',
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#2F3336',
  },
  itemLabel: {
    color: '#E7E9EA',
    fontSize: 16,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemValue: {
    color: '#71767B',
    fontSize: 15,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  logoutButton: {
    backgroundColor: 'rgba(249, 24, 128, 0.1)',
  },
  logoutText: {
    color: '#F91880',
    fontSize: 16,
    fontWeight: '600',
  },
  destructiveText: {
    color: '#F91880',
  },
  version: {
    textAlign: 'center',
    color: '#536471',
    fontSize: 13,
  },
});
