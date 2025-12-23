/**
 * Model configurations for @ariob/ml
 *
 * These configurations point to pre-quantized models optimized
 * for mobile/edge deployment via ExecuTorch.
 *
 * Models are served locally from the relay server.
 * Download models using: packages/relay/download-models.sh
 */

import type { ModelSource } from '../types';

/**
 * Base URL for model files
 * Default: localhost relay server
 * Override with ML_MODEL_BASE_URL environment variable
 */
const MODEL_BASE_URL = process.env.ML_MODEL_BASE_URL || 'http://localhost:8765/models';

/**
 * SmolLM2 135M - Ultra-lightweight model for low-end devices
 *
 * Requirements:
 * - ~500MB RAM
 * - Works on most devices
 * - Lower quality but very fast
 */
export const SMOLLM_135M: ModelSource = {
  id: 'smollm-135m',
  name: 'SmolLM2 135M',
  description: 'Ultra-lightweight, works on most devices',
  ramRequired: '500MB',
  modelSource: `${MODEL_BASE_URL}/smollm2-135m/model.pte`,
  tokenizerSource: `${MODEL_BASE_URL}/smollm2-135m/tokenizer.json`,
  tokenizerConfigSource: `${MODEL_BASE_URL}/smollm2-135m/tokenizer_config.json`,
};

/**
 * Qwen 2.5 0.5B - Compact but capable
 *
 * Requirements:
 * - ~1.5GB RAM
 * - Good for mid-range devices
 */
export const QWEN_0_5B: ModelSource = {
  id: 'qwen-0.5b',
  name: 'Qwen 2.5 0.5B',
  description: 'Compact but capable, mid-range devices',
  ramRequired: '1.5GB',
  modelSource: `${MODEL_BASE_URL}/qwen2.5-0.5b/model.pte`,
  tokenizerSource: `${MODEL_BASE_URL}/qwen2.5-0.5b/tokenizer.json`,
  tokenizerConfigSource: `${MODEL_BASE_URL}/qwen2.5-0.5b/tokenizer_config.json`,
};

/**
 * LLaMA 3.2 1B Instruct - Best balance of quality and performance
 *
 * Requirements:
 * - ~3.2GB RAM on Android
 * - Recommended for devices with 4GB+ RAM
 */
export const LLAMA3_2_1B: ModelSource = {
  id: 'llama-3.2-1b',
  name: 'LLaMA 3.2 1B',
  description: 'Best quality, requires 4GB+ RAM',
  ramRequired: '3.2GB',
  modelSource: `${MODEL_BASE_URL}/llama3.2-1b/model.pte`,
  tokenizerSource: `${MODEL_BASE_URL}/llama3.2-1b/tokenizer.json`,
  tokenizerConfigSource: `${MODEL_BASE_URL}/llama3.2-1b/tokenizer_config.json`,
};

/**
 * All available models
 */
export const MODELS: Record<string, ModelSource> = {
  'smollm-135m': SMOLLM_135M,
  'qwen-0.5b': QWEN_0_5B,
  'llama-3.2-1b': LLAMA3_2_1B,
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
