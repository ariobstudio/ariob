/**
 * ML Client Factory
 */

import { MLClient } from './ml-client';

export function createMLClient(): MLClient {
  return MLClient.getInstance();
}