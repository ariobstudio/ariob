import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { aiStyles as styles } from './ai.styles';

/**
 * Model option from @ariob/ml
 */
export interface ModelOption {
  id: string;
  name: string;
  description: string;
  size: string;
  ramRequired: string;
}

/**
 * AI Model node data structure
 */
export interface AIModelData {
  /** Currently selected model ID */
  selectedModel: string | null;
  /** Download progress (0-1) */
  downloadProgress: number;
  /** Whether model is currently downloading */
  isDownloading: boolean;
  /** Whether model is ready for inference */
  isReady: boolean;
  /** Error message if download/load failed */
  error: string | null;
  /** Available models to choose from */
  models: ModelOption[];
}

interface AIProps {
  data: AIModelData;
  /** Called when user selects a model */
  onSelectModel?: (modelId: string) => void;
}

/**
 * AI Model Selection Node
 *
 * Displays available AI models with download progress.
 * Users can select a model to download and use for Ripple AI.
 */
export const AI = ({ data, onSelectModel }: AIProps) => {
  const { selectedModel, downloadProgress, isDownloading, isReady, error, models } = data;

  return (
    <View style={styles.container}>
      <Text style={styles.intro}>
        Choose an AI model to power Ripple. Smaller models run faster but may be less capable.
      </Text>

      {/* Error display */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={16} color="#FF6B6B" />
          <Text style={styles.errorText}>{typeof error === 'string' ? error : String(error)}</Text>
        </View>
      )}

      {/* Model options */}
      {models.map((model) => (
        <ModelOptionRow
          key={model.id}
          model={model}
          isSelected={selectedModel === model.id}
          isDownloading={isDownloading && selectedModel === model.id}
          isReady={isReady && selectedModel === model.id}
          downloadProgress={selectedModel === model.id ? downloadProgress : 0}
          onSelect={() => onSelectModel?.(model.id)}
        />
      ))}

      {/* Ready state indicator */}
      {isReady && (
        <View style={styles.readyBanner}>
          <Ionicons name="checkmark-circle" size={18} color="#00E5FF" />
          <Text style={styles.readyText}>Ripple is ready to chat!</Text>
        </View>
      )}
    </View>
  );
};

interface ModelOptionRowProps {
  model: ModelOption;
  isSelected: boolean;
  isDownloading: boolean;
  isReady: boolean;
  downloadProgress: number;
  onSelect: () => void;
}

const ModelOptionRow = ({
  model,
  isSelected,
  isDownloading,
  isReady,
  downloadProgress,
  onSelect,
}: ModelOptionRowProps) => {
  const progressWidth = useSharedValue(0);
  const pulseOpacity = useSharedValue(0.5);

  // Animate progress bar
  useEffect(() => {
    progressWidth.value = withSpring(downloadProgress * 100, {
      damping: 15,
      stiffness: 100,
    });
  }, [downloadProgress]);

  // Pulse animation when downloading
  useEffect(() => {
    if (isDownloading) {
      pulseOpacity.value = withTiming(1, { duration: 500 }, () => {
        pulseOpacity.value = withTiming(0.5, { duration: 500 });
      });
    }
  }, [isDownloading, downloadProgress]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
    opacity: interpolate(progressWidth.value, [0, 100], [0.7, 1]),
  }));

  const getStatusIcon = () => {
    if (isReady) return 'checkmark-circle';
    if (isDownloading) return 'cloud-download-outline';
    if (isSelected) return 'radio-button-on';
    return 'radio-button-off';
  };

  const getStatusColor = () => {
    if (isReady) return '#00E5FF';
    if (isDownloading) return '#FFD700';
    if (isSelected) return '#7856FF';
    return '#71767B';
  };

  const getModelIcon = () => {
    // Different icons based on model size/capability
    if (model.id.includes('llama')) return 'flash';
    if (model.id.includes('qwen')) return 'sparkles';
    return 'cube-outline';
  };

  return (
    <Pressable
      style={[
        styles.modelOption,
        isSelected && styles.modelOptionSelected,
        isReady && styles.modelOptionReady,
      ]}
      onPress={onSelect}
      disabled={isDownloading || isReady}
    >
      {/* Progress bar background */}
      {isDownloading && <Animated.View style={[styles.progressBar, progressStyle]} />}

      {/* Model icon */}
      <View style={[styles.modelIcon, isSelected && styles.modelIconSelected]}>
        <Ionicons name={getModelIcon()} size={18} color={isSelected ? '#00E5FF' : '#71767B'} />
      </View>

      {/* Model info */}
      <View style={styles.modelInfo}>
        <Text style={[styles.modelName, isSelected && styles.modelNameSelected]}>{model.name}</Text>
        <Text style={styles.modelDescription}>{model.description}</Text>
        <View style={styles.modelSpecs}>
          <Text style={styles.specText}>
            <Ionicons name="download-outline" size={10} color="#71767B" /> {model.size}
          </Text>
          <Text style={styles.specText}>
            <Ionicons name="hardware-chip-outline" size={10} color="#71767B" /> {model.ramRequired}
          </Text>
        </View>
      </View>

      {/* Status indicator */}
      <View style={styles.statusContainer}>
        {isDownloading && (
          <Text style={styles.progressText}>{Math.round(downloadProgress * 100)}%</Text>
        )}
        <Ionicons name={getStatusIcon()} size={22} color={getStatusColor()} />
      </View>
    </Pressable>
  );
};

// Re-export legacy name for backwards compatibility
export const AIModel = AI;
