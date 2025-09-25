/**
 * ML Memory Schemas - Enhanced to match native implementation
 */

import { z } from 'zod';

// Memory pressure levels matching native implementation
export const MemoryPressureLevelSchema = z.enum([
  'normal',
  'moderate',
  'high',
  'critical'
]);

// Enhanced memory snapshot
export const MLMemorySnapshotSchema = z.object({
  description: z.string(),
  timestamp: z.number(),
  memoryUsage: z.number().nonnegative(),
  modelCount: z.number().int().nonnegative(),
  details: z.object({
    gpuMemory: z.number().nonnegative(),
    systemMemory: z.number().nonnegative(),
    cacheSize: z.number().nonnegative()
  }).optional()
});

// Enhanced memory info matching native types
export const MLMemoryInfoSchema = z.object({
  usedMemory: z.number().nonnegative(),
  totalMemory: z.number().positive(),
  modelCount: z.number().int().nonnegative(),
  cacheSize: z.number().nonnegative().optional(),
  availableMemory: z.number().nonnegative().optional(),
  pressureLevel: MemoryPressureLevelSchema.optional(),
  pressureDescription: z.string().optional(),
  deviceInfo: z.object({
    deviceSupportsMetalGPU: z.boolean(),
    availableMemoryMB: z.number().nonnegative(),
    cacheMemoryMB: z.number().nonnegative()
  }).optional()
});

// Enhanced memory delta
export const MLMemoryDeltaSchema = z.object({
  description: z.string(),
  memoryFreed: z.number(),
  modelsCleared: z.number().int().nonnegative(),
  timestamp: z.number(),
  operations: z.array(z.string())
});

// Memory recommendations
export const MLMemoryRecommendationsSchema = z.object({
  recommendations: z.array(z.string()),
  pressureLevel: MemoryPressureLevelSchema,
  activeOperations: z.number().int().nonnegative(),
  loadedModels: z.number().int().nonnegative(),
  suggestedActions: z.array(z.string()).optional(),
  criticalThreshold: z.number().positive().optional()
});

// Memory usage report
export const MLMemoryUsageReportSchema = z.object({
  currentUsage: MLMemoryInfoSchema,
  historicalPeaks: z.array(MLMemorySnapshotSchema),
  recommendations: MLMemoryRecommendationsSchema,
  modelBreakdown: z.array(z.object({
    modelId: z.string(),
    memoryUsage: z.number().nonnegative(),
    loadTime: z.number(),
    lastAccessed: z.number()
  }))
});

// Memory monitoring configuration
export const MLMemoryMonitoringConfigSchema = z.object({
  enableHistoryTracking: z.boolean(),
  maxHistoryEntries: z.number().int().positive(),
  alertThreshold: MemoryPressureLevelSchema,
  autoCleanupEnabled: z.boolean(),
  cleanupIdleTime: z.number().int().positive()
});

// Memory pressure event
export const MLMemoryPressureEventSchema = z.object({
  level: MemoryPressureLevelSchema,
  timestamp: z.number(),
  triggerInfo: z.object({
    usedMemory: z.number().nonnegative(),
    availableMemory: z.number().nonnegative(),
    loadedModels: z.array(z.string())
  }),
  recommendedActions: z.array(z.string())
});

// Legacy MLX schemas for compatibility
export const MLXMemorySnapshotSchema = z.object({
  size: z.number().nonnegative(),
  allocations: z.number().int().nonnegative()
});

export const MLXMemoryInfoSchema = z.object({
  totalSystemMemory: z.number().positive(),
  gpuMemoryLimit: z.number().positive(),
  gpuCacheLimit: z.number().positive(),
  currentSnapshot: MLXMemorySnapshotSchema,
  modelLimits: z.record(z.number().positive())
});

export const MLXMemoryPressureSchema = z.enum([
  'low',
  'moderate',
  'high',
  'critical'
]);

export const MLXMemoryDeltaSchema = z.object({
  modelId: z.string(),
  startSnapshot: MLXMemorySnapshotSchema,
  endSnapshot: MLXMemorySnapshotSchema,
  deltaSize: z.number(),
  deltaAllocations: z.number()
});

// Validation functions
export function validateMLMemorySnapshot(snapshot: unknown) {
  return MLMemorySnapshotSchema.parse(snapshot);
}

export function validateMLMemoryInfo(info: unknown) {
  return MLMemoryInfoSchema.parse(info);
}

export function validateMLMemoryDelta(delta: unknown) {
  return MLMemoryDeltaSchema.parse(delta);
}

export function validateMLMemoryRecommendations(recommendations: unknown) {
  return MLMemoryRecommendationsSchema.parse(recommendations);
}

export function validateMLMemoryUsageReport(report: unknown) {
  return MLMemoryUsageReportSchema.parse(report);
}

export function validateMLMemoryMonitoringConfig(config: unknown) {
  return MLMemoryMonitoringConfigSchema.parse(config);
}

export function validateMLMemoryPressureEvent(event: unknown) {
  return MLMemoryPressureEventSchema.parse(event);
}

export function validateMemoryPressureLevel(level: unknown) {
  return MemoryPressureLevelSchema.parse(level);
}

// Legacy validation functions
export function validateMemoryInfo(info: unknown) {
  return MLXMemoryInfoSchema.parse(info);
}

export function validateMemorySnapshot(snapshot: unknown) {
  return MLXMemorySnapshotSchema.parse(snapshot);
}

export function validateMemoryPressure(pressure: unknown) {
  return MLXMemoryPressureSchema.parse(pressure);
}