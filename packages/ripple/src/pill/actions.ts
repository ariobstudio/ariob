export type ActionType = 
  | 'create' | 'settings' | 'more' | 'auth_options' 
  | 'find_friends' | 'trending' | 'search_global'
  | 'back' | 'options' | 'reply_full' | 'edit_profile' | 'connect'
  | 'profile_settings' | 'appearance' | 'qr_code'
  | 'saved_items' | 'log_out' | 'close';

export interface ActionConfig {
  icon: string;
  label: string;
  children?: ActionType[];
}

export const actions: Record<ActionType, ActionConfig> = {
  // Center actions
  create: {
    icon: '+',
    label: 'Add',
  },
  reply_full: {
    icon: '↩',
    label: 'Reply',
  },
  edit_profile: {
    icon: '✏️',
    label: 'Edit',
  },
  connect: {
    icon: '🔗',
    label: 'Connect',
  },
  
  // Left/Right actions
  settings: {
    icon: '⚙️',
    label: 'Settings',
    children: ['profile_settings', 'appearance', 'qr_code', 'log_out'],
  },
  more: {
    icon: '⋯',
    label: 'More',
    children: ['find_friends', 'saved_items', 'trending', 'search_global'],
  },
  auth_options: {
    icon: '🔑',
    label: 'Auth',
  },
  find_friends: {
    icon: '🔍',
    label: 'Find',
  },
  trending: {
    icon: '⚡',
    label: 'Trending',
  },
  search_global: {
    icon: '🔍',
    label: 'Search',
  },
  back: {
    icon: '←',
    label: 'Back',
  },
  options: {
    icon: '⋯',
    label: 'Options',
  },
  profile_settings: {
    icon: '👤',
    label: 'Profile',
  },
  appearance: {
    icon: '🎨',
    label: 'Appearance',
  },
  qr_code: {
    icon: '▣',
    label: 'QR Code',
  },
  saved_items: {
    icon: '📁',
    label: 'Saved',
  },
  log_out: {
    icon: '⏏',
    label: 'Log out',
  },
  close: {
    icon: '✕',
    label: 'Close',
  },
};
