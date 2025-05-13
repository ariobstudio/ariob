import Gun from '@/gun/gun.js';
import '@/gun/sea.js';
import { GunInstance } from './types';

// Configure Gun options
const gunOptions = {
  peers: [
    'https://gun-manhattan.herokuapp.com/gun',
    // Add your own peers here
  ],
  localStorage: false, // Set to true to enable localStorage persistence
  //   radisk: true,        // Enable radisk storage
  axe: true, // Enable AXE for conflict resolution
};

const gun: GunInstance = Gun(gunOptions) as GunInstance;
gun.sea = Gun.SEA;
gun.state = Gun.state;

export default gun;
