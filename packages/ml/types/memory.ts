/**
 * ML Memory Management Types - Enhanced to match native implementation
 */

export interface MLMemorySnapshot {
  description: string;
  timestamp: number;
  memoryUsage: number;
  modelCount: number;
  details?: {
    gpuMemory: number;
    systemMemory: number;
    cacheSize: number;
  };
}

export interface MLMemoryInfo {
  usedMemory: number;
  totalMemory: number;
  modelCount: number;
  cacheSize?: number;
  availableMemory?: number;
  pressureLevel?: MemoryPressureLevel;
  pressureDescription?: string;
  deviceInfo?: {
    deviceSupportsMetalGPU: boolean;
    availableMemoryMB: number;
    cacheMemoryMB: number;
  };
}

export interface MLMemoryDelta {
  description: string;
  memoryFreed: number;
  modelsCleared: number;
  timestamp: number;
  operations: string[];
}

export interface MLMemoryRecommendations {
  recommendations: string[];
  pressureLevel: MemoryPressureLevel;
  activeOperations: number;
  loadedModels: number;
  suggestedActions?: string[];
  criticalThreshold?: number;
}

export const MEMORY_PRESSURE_LEVELS = [
  'normal',
  'moderate',
  'high',
  'critical'
] as const;

export type MemoryPressureLevel = typeof MEMORY_PRESSURE_LEVELS[number];

export interface MLMemoryUsageReport {
  currentUsage: MLMemoryInfo;
  historicalPeaks: MLMemorySnapshot[];
  recommendations: MLMemoryRecommendations;
  modelBreakdown: Array<{
    modelId: string;
    memoryUsage: number;
    loadTime: number;
    lastAccessed: number;
  }>;
}

export interface MLMemoryMonitoringConfig {
  enableHistoryTracking: boolean;
  maxHistoryEntries: number;
  alertThreshold: MemoryPressureLevel;
  autoCleanupEnabled: boolean;
  cleanupIdleTime: number;
}

export interface MLMemoryPressureEvent {
  level: MemoryPressureLevel;
  timestamp: number;
  triggerInfo: {
    usedMemory: number;
    availableMemory: number;
    loadedModels: string[];
  };
  recommendedActions: string[];
}

// Legacy compatibility types
export interface MLXMemorySnapshot extends MLMemorySnapshot {}
export interface MLXMemoryInfo extends MLMemoryInfo {}
export type MLXMemoryPressure = MemoryPressureLevel;
export interface MLXMemoryDelta extends MLMemoryDelta {}

// Memory management utilities
export const MEMORY_UNITS = {
  BYTES: 1,
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024
} as const;

export const DEFAULT_MEMORY_CONFIG: MLMemoryMonitoringConfig = {
  enableHistoryTracking: true,
  maxHistoryEntries: 100,
  alertThreshold: 'moderate',
  autoCleanupEnabled: true,
  cleanupIdleTime: 300000 // 5 minutes
};

export const MEMORY_THRESHOLDS = {
  normal: 0.5,    // 50% of available memory
  moderate: 0.7,  // 70% of available memory
  high: 0.85,     // 85% of available memory
  critical: 0.95  // 95% of available memory
} as const;

// Memory pressure calculation helpers
export function calculateMemoryPressure(
  usedMemory: number,
  totalMemory: number
): MemoryPressureLevel {
  const ratio = usedMemory / totalMemory;

  if (ratio >= MEMORY_THRESHOLDS.critical) return 'critical';
  if (ratio >= MEMORY_THRESHOLDS.high) return 'high';
  if (ratio >= MEMORY_THRESHOLDS.moderate) return 'moderate';
  return 'normal';
}

export function formatMemorySize(bytes: number): string {
  if (bytes < MEMORY_UNITS.KB) return `${bytes} B`;
  if (bytes < MEMORY_UNITS.MB) return `${(bytes / MEMORY_UNITS.KB).toFixed(1)} KB`;
  if (bytes < MEMORY_UNITS.GB) return `${(bytes / MEMORY_UNITS.MB).toFixed(1)} MB`;
  return `${(bytes / MEMORY_UNITS.GB).toFixed(2)} GB`;
}

export function shouldTriggerCleanup(
  pressureLevel: MemoryPressureLevel,
  threshold: MemoryPressureLevel = 'moderate'
): boolean {
  const levels = ['normal', 'moderate', 'high', 'critical'];
  return levels.indexOf(pressureLevel) >= levels.indexOf(threshold);
}