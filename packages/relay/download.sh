#!/bin/bash
#
# Download ExecuTorch models for local serving
#
# Models from: software-mansion/react-native-executorch-smolLm-2
# Served from: http://localhost:8765/models/
#

set -e

MODELS_DIR="$(dirname "$0")/models"
mkdir -p "$MODELS_DIR"

# Get HuggingFace token
if [ -n "$HF_TOKEN" ]; then
  TOKEN="$HF_TOKEN"
elif [ -f ~/.huggingface/token ]; then
  TOKEN=$(cat ~/.huggingface/token)
elif [ -f ~/.cache/huggingface/token ]; then
  TOKEN=$(cat ~/.cache/huggingface/token)
else
  echo "Error: No HuggingFace token found."
  echo "Set HF_TOKEN or run: huggingface-cli login"
  exit 1
fi

AUTH_HEADER="Authorization: Bearer $TOKEN"
BASE_URL="https://huggingface.co/software-mansion/react-native-executorch-smolLm-2/resolve/main"

echo "Downloading ExecuTorch models to $MODELS_DIR..."
echo ""

# SmolLM2 135M - Ultra-lightweight (560MB)
echo "=== SmolLM2 135M (560MB) ==="
mkdir -p "$MODELS_DIR/smollm2-135m"

echo "  Downloading model (.pte)..."
curl -L --progress-bar -H "$AUTH_HEADER" -o "$MODELS_DIR/smollm2-135m/model.pte" \
  "$BASE_URL/smolLm-2-135M/quantized/smolLm2_135M_8da4w.pte"

echo "  Downloading tokenizer.json..."
curl -L -s -H "$AUTH_HEADER" -o "$MODELS_DIR/smollm2-135m/tokenizer.json" \
  "$BASE_URL/tokenizer.json"

echo "  Downloading tokenizer_config.json..."
curl -L -s -H "$AUTH_HEADER" -o "$MODELS_DIR/smollm2-135m/tokenizer_config.json" \
  "$BASE_URL/tokenizer_config.json"

echo ""

# SmolLM2 360M - Mid-range (1.3GB)
echo "=== SmolLM2 360M (1.3GB) ==="
mkdir -p "$MODELS_DIR/smollm2-360m"

echo "  Downloading model (.pte)..."
curl -L --progress-bar -H "$AUTH_HEADER" -o "$MODELS_DIR/smollm2-360m/model.pte" \
  "$BASE_URL/smolLm-2-360M/quantized/smolLm2_360M_8da4w.pte"

echo "  Copying tokenizer files..."
cp "$MODELS_DIR/smollm2-135m/tokenizer.json" "$MODELS_DIR/smollm2-360m/"
cp "$MODELS_DIR/smollm2-135m/tokenizer_config.json" "$MODELS_DIR/smollm2-360m/"

echo ""

# SmolLM2 1.7B - Best quality (1.3GB)
echo "=== SmolLM2 1.7B (1.3GB) ==="
mkdir -p "$MODELS_DIR/smollm2-1.7b"

echo "  Downloading model (.pte)..."
curl -L --progress-bar -H "$AUTH_HEADER" -o "$MODELS_DIR/smollm2-1.7b/model.pte" \
  "$BASE_URL/smolLm-2-1.7B/quantized/smolLm2_1_7B_8da4w.pte"

echo "  Copying tokenizer files..."
cp "$MODELS_DIR/smollm2-135m/tokenizer.json" "$MODELS_DIR/smollm2-1.7b/"
cp "$MODELS_DIR/smollm2-135m/tokenizer_config.json" "$MODELS_DIR/smollm2-1.7b/"

echo ""
echo "=== Download Complete ==="
echo ""
ls -lh "$MODELS_DIR"/*/*.pte
echo ""
echo "Models available at: http://localhost:8765/models/"
