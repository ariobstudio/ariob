/**
 * Model configurations for @ariob/ml
 *
 * These configurations point to pre-quantized models optimized
 * for mobile/edge deployment via ExecuTorch.
 */

import type { ModelSource } from '../types';

/**
 * LLaMA 3.2 1B Instruct - Best balance of quality and performance
 *
 * Requirements:
 * - ~3.2GB RAM on Android
 * - Recommended for devices with 4GB+ RAM
 */
export const LLAMA3_2_1B: ModelSource = {
  modelSource: 'https://huggingface.co/softwaremill/llama-3.2-1B-executorch/resolve/main/llama-3.2-1B-Instruct.pte',
  tokenizerSource: 'https://huggingface.co/softwaremill/llama-3.2-1B-executorch/resolve/main/tokenizer.json',
  tokenizerConfigSource: 'https://huggingface.co/softwaremill/llama-3.2-1B-executorch/resolve/main/tokenizer_config.json',
};

/**
 * SmolLM 135M - Ultra-lightweight model for low-end devices
 *
 * Requirements:
 * - ~500MB RAM
 * - Works on most devices
 * - Lower quality but very fast
 */
export const SMOLLM_135M: ModelSource = {
  modelSource: 'https://huggingface.co/softwaremill/smollm-135M-executorch/resolve/main/smollm-135M.pte',
  tokenizerSource: 'https://huggingface.co/softwaremill/smollm-135M-executorch/resolve/main/tokenizer.json',
};

/**
 * Qwen 2.5 0.5B - Compact but capable
 *
 * Requirements:
 * - ~1.5GB RAM
 * - Good for mid-range devices
 */
export const QWEN_0_5B: ModelSource = {
  modelSource: 'https://huggingface.co/softwaremill/qwen-2.5-0.5B-executorch/resolve/main/qwen-2.5-0.5B-Instruct.pte',
  tokenizerSource: 'https://huggingface.co/softwaremill/qwen-2.5-0.5B-executorch/resolve/main/tokenizer.json',
};

/**
 * Default model for Ripple AI companion
 * Using SmolLM for broad device compatibility during development
 */
export const DEFAULT_RIPPLE_MODEL = SMOLLM_135M;
