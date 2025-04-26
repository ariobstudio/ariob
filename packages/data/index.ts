// Export all services from a single entry point
export { gun } from './gunService';
export * as ipfsService from './ipfsService';

// This allows importing all services at once:
// import { gun, ipfsService } from 'packages/data';
