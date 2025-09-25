import React, { useState } from 'react';
import { 
  mlx, 
  useMLXModel, 
  useTextGeneration, 
  useImageGeneration,
  type ModelConfig,
  type TextGenerationOptions,
  type ImageGenerationOptions 
} from '../../NativeMLXModule';

/**
 * Example component demonstrating MLX module usage
 * Shows how to load models and use them for various ML tasks
 */
export const MLXExample: React.FC = () => {
  const [selectedModelType, setSelectedModelType] = useState<'llm' | 'image-gen' | 'vlm'>('llm');
  const [modelId, setModelId] = useState('mlx-community/Qwen3-4B-4bit');
  const [prompt, setPrompt] = useState('');
  const [streaming, setStreaming] = useState(true);
  
  // Model management hook
  const { model, loading, error: modelError, loadModel, unloadModel } = useMLXModel({
    modelId,
    modelType: selectedModelType,
    source: 'huggingface'
  });

  // Text generation hook
  const { 
    text, 
    generating: generatingText, 
    error: textError, 
    generate: generateText,
    abort: abortTextGeneration 
  } = useTextGeneration(model?.id);

  // Image generation hook
  const { 
    image, 
    generating: generatingImage, 
    error: imageError, 
    generate: generateImage 
  } = useImageGeneration(model?.id);

  // Handle model loading
  const handleLoadModel = async () => {
    await loadModel();
  };

  // Handle text generation
  const handleGenerateText = async () => {
    if (!prompt) return;
    
    const options: TextGenerationOptions = {
      maxTokens: 500,
      temperature: 0.7,
      topP: 0.9
    };
    
    await generateText(prompt, options, streaming);
  };

  // Handle image generation
  const handleGenerateImage = async () => {
    if (!prompt) return;
    
    const options: ImageGenerationOptions = {
      width: 512,
      height: 512,
      steps: 20,
      guidanceScale: 7.5
    };
    
    await generateImage(prompt, options);
  };

  // Handle vision-language model analysis
  const handleAnalyzeImage = async (imageData: string) => {
    if (!model?.id) return;
    
    try {
      const result = await mlx.analyzeImage(
        model.id,
        imageData,
        prompt || "What's in this image?"
      );
      console.log('Analysis result:', result);
    } catch (error) {
      console.error('Analysis error:', error);
    }
  };

  // Get memory info
  const handleGetMemoryInfo = async () => {
    const memInfo = await mlx.getMemoryInfo();
    console.log('Memory info:', memInfo);
  };

  return (
    <view className="mlx-example p-4">
      <text className="text-2xl font-bold mb-4">MLX Module Example</text>
      
      {/* Model Selection */}
      <view className="model-selection mb-4">
        <text className="text-lg font-semibold mb-2">Select Model Type:</text>
        <view className="flex flex-row gap-2">
          <button
            className={`px-4 py-2 rounded ${selectedModelType === 'llm' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => {
              setSelectedModelType('llm');
              setModelId('mlx-community/Qwen3-4B-4bit');
            }}
          >
            LLM
          </button>
          <button
            className={`px-4 py-2 rounded ${selectedModelType === 'image-gen' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => {
              setSelectedModelType('image-gen');
              setModelId('stable-diffusion-xl-turbo');
            }}
          >
            Image Gen
          </button>
          <button
            className={`px-4 py-2 rounded ${selectedModelType === 'vlm' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => {
              setSelectedModelType('vlm');
              setModelId('llava-1.5-7b');
            }}
          >
            Vision-Language
          </button>
        </view>
      </view>

      {/* Model ID Input */}
      <view className="mb-4">
        <text className="text-lg font-semibold mb-2">Model ID:</text>
        <input
          type="text"
          value={modelId}
          onChange={(e) => setModelId(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          placeholder="Enter model ID from Hugging Face"
        />
      </view>

      {/* Model Loading Controls */}
      <view className="model-controls mb-4">
        <view className="flex flex-row gap-2">
          <button
            onClick={handleLoadModel}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load Model'}
          </button>
          {model && (
            <button
              onClick={unloadModel}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Unload Model
            </button>
          )}
          <button
            onClick={handleGetMemoryInfo}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Memory Info
          </button>
        </view>
        
        {modelError && (
          <text className="text-red-500 mt-2">Error: {modelError}</text>
        )}
        
        {model && (
          <view className="mt-2 p-2 bg-gray-100 rounded">
            <text className="font-semibold">Model Loaded:</text>
            <text> ID: {model.id}</text>
            <text> Type: {model.type}</text>
            <text> Status: {model.status}</text>
            {model.memoryUsage && (
              <text> Memory: {(model.memoryUsage / (1024 * 1024 * 1024)).toFixed(2)} GB</text>
            )}
          </view>
        )}
      </view>

      {/* Prompt Input */}
      {model && (
        <view className="inference-section">
          <text className="text-lg font-semibold mb-2">Prompt:</text>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-3 py-2 border rounded h-24"
            placeholder={
              selectedModelType === 'llm' 
                ? "Enter your text prompt..." 
                : selectedModelType === 'image-gen'
                ? "Describe the image you want to generate..."
                : "Ask about an image..."
            }
          />
          
          {/* Streaming Option for LLMs */}
          {selectedModelType === 'llm' && (
            <view className="flex flex-row items-center mt-2">
              <input
                type="checkbox"
                checked={streaming}
                onChange={(e) => setStreaming(e.target.checked)}
                className="mr-2"
              />
              <text>Enable streaming</text>
            </view>
          )}
          
          {/* Generation Controls */}
          <view className="flex flex-row gap-2 mt-4">
            {selectedModelType === 'llm' && (
              <>
                <button
                  onClick={handleGenerateText}
                  disabled={generatingText}
                  className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                >
                  {generatingText ? 'Generating...' : 'Generate Text'}
                </button>
                {generatingText && streaming && (
                  <button
                    onClick={abortTextGeneration}
                    className="px-4 py-2 bg-red-500 text-white rounded"
                  >
                    Stop
                  </button>
                )}
              </>
            )}
            
            {selectedModelType === 'image-gen' && (
              <button
                onClick={handleGenerateImage}
                disabled={generatingImage}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
              >
                {generatingImage ? 'Generating...' : 'Generate Image'}
              </button>
            )}
            
            {selectedModelType === 'vlm' && (
              <view>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const base64 = reader.result?.toString().split(',')[1];
                        if (base64) handleAnalyzeImage(base64);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="mb-2"
                />
                <text className="text-sm text-gray-500">Select an image to analyze</text>
              </view>
            )}
          </view>
          
          {/* Results Display */}
          {(text || image) && (
            <view className="results mt-4 p-4 bg-gray-50 rounded">
              <text className="font-semibold mb-2">Result:</text>
              {text && (
                <text className="whitespace-pre-wrap">{text}</text>
              )}
              {image && (
                <image 
                  src={`data:image/png;base64,${image}`}
                  className="max-w-full h-auto rounded"
                  alt="Generated image"
                />
              )}
            </view>
          )}
          
          {/* Error Display */}
          {(textError || imageError) && (
            <text className="text-red-500 mt-2">
              Error: {textError || imageError}
            </text>
          )}
        </view>
      )}
    </view>
  );
};

export default MLXExample;