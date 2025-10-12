import { createThingStore } from '@ariob/core';
import { sessionService } from './service';
/**
 * Game Session Store
 * Uses core thing store pattern with Zustand
 */
export const useSessionStore = createThingStore(sessionService, 'GameSessions');
