#!/bin/bash
#
# Download ExecuTorch models for local serving
#
# Models are downloaded from HuggingFace and stored in ./models/
# The relay server serves these from http://localhost:8765/models/
#

set -e

MODELS_DIR="$(dirname "$0")/models"
mkdir -p "$MODELS_DIR"

echo "Downloading ExecuTorch models to $MODELS_DIR..."
echo ""

# SmolLM2 135M - Ultra-lightweight model
# Source: https://huggingface.co/softmaxinc/SmolLM2-135M-Instruct-ExecuTorch
echo "=== SmolLM2 135M Instruct ==="
mkdir -p "$MODELS_DIR/smollm2-135m"

echo "  Downloading model (.pte)..."
curl -L -# -o "$MODELS_DIR/smollm2-135m/model.pte" \
  "https://huggingface.co/softmaxinc/SmolLM2-135M-Instruct-ExecuTorch/resolve/main/smollm2-135m-instruct-spin-q8.pte"

echo "  Downloading tokenizer.json..."
curl -L -# -o "$MODELS_DIR/smollm2-135m/tokenizer.json" \
  "https://huggingface.co/softmaxinc/SmolLM2-135M-Instruct-ExecuTorch/resolve/main/tokenizer.json"

echo "  Downloading tokenizer_config.json..."
curl -L -# -o "$MODELS_DIR/smollm2-135m/tokenizer_config.json" \
  "https://huggingface.co/softmaxinc/SmolLM2-135M-Instruct-ExecuTorch/resolve/main/tokenizer_config.json"

echo ""

# Qwen 2.5 0.5B - Compact but capable
# Source: https://huggingface.co/softmaxinc/Qwen2.5-0.5B-Instruct-ExecuTorch
echo "=== Qwen 2.5 0.5B Instruct ==="
mkdir -p "$MODELS_DIR/qwen2.5-0.5b"

echo "  Downloading model (.pte)..."
curl -L -# -o "$MODELS_DIR/qwen2.5-0.5b/model.pte" \
  "https://huggingface.co/softmaxinc/Qwen2.5-0.5B-Instruct-ExecuTorch/resolve/main/qwen2.5-0.5b-instruct-spin-q8.pte"

echo "  Downloading tokenizer.json..."
curl -L -# -o "$MODELS_DIR/qwen2.5-0.5b/tokenizer.json" \
  "https://huggingface.co/softmaxinc/Qwen2.5-0.5B-Instruct-ExecuTorch/resolve/main/tokenizer.json"

echo "  Downloading tokenizer_config.json..."
curl -L -# -o "$MODELS_DIR/qwen2.5-0.5b/tokenizer_config.json" \
  "https://huggingface.co/softmaxinc/Qwen2.5-0.5B-Instruct-ExecuTorch/resolve/main/tokenizer_config.json"

echo ""

# LLaMA 3.2 1B - Best quality
# Source: https://huggingface.co/softmaxinc/Llama-3.2-1B-Instruct-ExecuTorch
echo "=== LLaMA 3.2 1B Instruct ==="
mkdir -p "$MODELS_DIR/llama3.2-1b"

echo "  Downloading model (.pte)..."
curl -L -# -o "$MODELS_DIR/llama3.2-1b/model.pte" \
  "https://huggingface.co/softmaxinc/Llama-3.2-1B-Instruct-ExecuTorch/resolve/main/llama3.2-1b-instruct-spin-q8.pte"

echo "  Downloading tokenizer.json..."
curl -L -# -o "$MODELS_DIR/llama3.2-1b/tokenizer.json" \
  "https://huggingface.co/softmaxinc/Llama-3.2-1B-Instruct-ExecuTorch/resolve/main/tokenizer.json"

echo "  Downloading tokenizer_config.json..."
curl -L -# -o "$MODELS_DIR/llama3.2-1b/tokenizer_config.json" \
  "https://huggingface.co/softmaxinc/Llama-3.2-1B-Instruct-ExecuTorch/resolve/main/tokenizer_config.json"

echo ""
echo "=== Download Complete ==="
echo ""
echo "Models downloaded to: $MODELS_DIR"
echo ""
ls -lh "$MODELS_DIR"/*
echo ""
echo "Start the relay server with: npm start"
echo "Models will be available at: http://localhost:8765/models/"
