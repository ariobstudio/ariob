import Gun from '../gun.js';
import SEA from '../sea.js';

import { GunInstance } from './types';

// Configure Gun options
const gunOptions = {
  peers: [
    'ws://gun-manhattan.herokuapp.com/gun',
    // Add your own peers here
  ],
  localStorage: true, // Set to true to enable localStorage persistence
  //   radisk: true,        // Enable radisk storage
};
const gun: GunInstance = Gun(gunOptions) as GunInstance;
const sea = SEA;
gun.state = Gun.state;

export { gun, sea };
