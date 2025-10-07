import { createThingStore } from '@ariob/core';
import { sessionService } from './service';
import type { GameSessionThing } from './schema';

/**
 * Game Session Store
 * Uses core thing store pattern with Zustand
 */
export const useSessionStore = createThingStore<GameSessionThing>(
  sessionService,
  'GameSessions'
);
