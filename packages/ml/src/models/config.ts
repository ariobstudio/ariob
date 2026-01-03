/**
 * Model configurations for @ariob/ml
 *
 * These configurations point to pre-quantized models optimized
 * for mobile/edge deployment via ExecuTorch.
 *
 * Models are served locally from the relay server.
 * Download models using: packages/relay/download.sh
 */

import type { ModelSource } from '../types';

/**
 * Base URL for model files
 * Default: localhost relay server
 * Override with ML_MODEL_BASE_URL environment variable
 *
 * Note: For iOS simulator, use the host machine's IP address.
 * 'localhost' from the simulator refers to the simulator itself.
 */
const MODEL_BASE_URL = process.env.ML_MODEL_BASE_URL || 'http://10.0.0.246:8765/models';

/**
 * SmolLM2 135M - Ultra-lightweight model for low-end devices
 *
 * Requirements:
 * - ~500MB storage, ~1GB RAM
 * - Works on most devices
 * - Lower quality but very fast
 */
export const SMOLLM_135M: ModelSource = {
  id: 'smollm2-135m',
  name: 'SmolLM2 135M',
  description: 'Ultra-lightweight, works on most devices',
  ramRequired: '1GB',
  modelSource: `${MODEL_BASE_URL}/smollm2-135m/model.pte`,
  tokenizerSource: `${MODEL_BASE_URL}/smollm2-135m/tokenizer.json`,
  tokenizerConfigSource: `${MODEL_BASE_URL}/smollm2-135m/tokenizer_config.json`,
};

/**
 * SmolLM2 360M - Mid-range model
 *
 * Requirements:
 * - ~1.3GB storage, ~2GB RAM
 * - Good for mid-range devices
 */
export const SMOLLM_360M: ModelSource = {
  id: 'smollm2-360m',
  name: 'SmolLM2 360M',
  description: 'Balanced quality and speed',
  ramRequired: '2GB',
  modelSource: `${MODEL_BASE_URL}/smollm2-360m/model.pte`,
  tokenizerSource: `${MODEL_BASE_URL}/smollm2-360m/tokenizer.json`,
  tokenizerConfigSource: `${MODEL_BASE_URL}/smollm2-360m/tokenizer_config.json`,
};

/**
 * SmolLM2 1.7B - Best quality model
 *
 * Requirements:
 * - ~1.3GB storage, ~3GB RAM
 * - Recommended for devices with 4GB+ RAM
 */
export const SMOLLM_1_7B: ModelSource = {
  id: 'smollm2-1.7b',
  name: 'SmolLM2 1.7B',
  description: 'Best quality, requires 4GB+ RAM',
  ramRequired: '3GB',
  modelSource: `${MODEL_BASE_URL}/smollm2-1.7b/model.pte`,
  tokenizerSource: `${MODEL_BASE_URL}/smollm2-1.7b/tokenizer.json`,
  tokenizerConfigSource: `${MODEL_BASE_URL}/smollm2-1.7b/tokenizer_config.json`,
};

/**
 * All available models
 */
export const MODELS: Record<string, ModelSource> = {
  'smollm2-135m': SMOLLM_135M,
  'smollm2-360m': SMOLLM_360M,
  'smollm2-1.7b': SMOLLM_1_7B,
};

/**
 * Model options for UI selection
 */
export const MODEL_OPTIONS = Object.values(MODELS);

/**
 * Default model for Ripple AI companion
 * Using SmolLM for broad device compatibility
 */
export const DEFAULT_MODEL = SMOLLM_135M;
