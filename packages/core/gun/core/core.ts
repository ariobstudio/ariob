import Gun from './gun.js';
import './sea.js';
import { gunOptions } from './gun.config.js';
import { GunInstance, SEA } from './types.js';

// Initialize Gun with configuration
const gun: GunInstance = Gun(gunOptions) as GunInstance;
const sea: SEA = Gun.SEA as SEA;
gun.state = Gun.state;

export { gun, sea }; 