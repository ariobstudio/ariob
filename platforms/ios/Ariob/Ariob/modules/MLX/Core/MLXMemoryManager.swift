import Foundation
import MLX

// MARK: - MLX Memory Manager
// Proper implementation using MLX GPU APIs for memory management

@available(iOS 16.0, *)
public final class MLXMemoryManager: @unchecked Sendable {
    static let shared = MLXMemoryManager()

    private let queue = DispatchQueue(label: "mlx.memory.manager", qos: .utility)
    private var memoryThreshold: Float = 0.8 // 80% memory usage threshold

    private init() {}

    // MARK: - Public Methods

    func clearCache() {
        queue.async {
            // Clear MLX GPU cache
            GPU.clearCache()

            // Force evaluation of pending operations
            eval()
        }
    }

    func getMemoryInfo() -> [String: Any] {
        return queue.sync {
            let snapshot = GPU.snapshot()
            let memoryLimit = GPU.memoryLimit
            let cacheLimit = GPU.cacheLimit

            // Break up complex expressions for compiler
            let memoryLimitMB = memoryLimit / (1024 * 1024)
            let cacheLimitMB = cacheLimit / (1024 * 1024)

            var result: [String: Any] = [
                "memoryLimit": memoryLimit,
                "cacheLimit": cacheLimit,
                "memoryLimitMB": memoryLimitMB,
                "cacheLimitMB": cacheLimitMB
            ]

            // Add snapshot description (MLX provides description property)
            result["snapshotDescription"] = snapshot.description
            result["memoryUsageInfo"] = "See snapshotDescription for detailed memory usage"

            return result
        }
    }

    func optimizeMemory() async {
        await withCheckedContinuation { continuation in
            queue.async {
                // Always perform basic optimization when called
                // Clear cache
                GPU.clearCache()

                // Force evaluation
                eval()

                // Optionally reduce cache size based on threshold
                if self.memoryThreshold < 0.9 { // Only if threshold is strict
                    self.reduceCacheSize()
                }

                continuation.resume()
            }
        }
    }

    func setMemoryThreshold(_ threshold: Float) {
        queue.sync {
            self.memoryThreshold = max(0.1, min(0.95, threshold)) // Clamp between 10% and 95%
        }
    }

    func getMemoryThreshold() -> Float {
        return queue.sync {
            return memoryThreshold
        }
    }

    // MARK: - Memory Monitoring

    func isMemoryPressureHigh() -> Bool {
        // Simple heuristic: check if current cache limit is getting close to memory limit
        let cacheRatio = Float(GPU.cacheLimit) / Float(GPU.memoryLimit)
        return cacheRatio > memoryThreshold
    }

    func getMemoryPressureLevel() -> MemoryPressureLevel {
        // Simple heuristic based on cache to memory ratio
        let cacheRatio = Float(GPU.cacheLimit) / Float(GPU.memoryLimit)

        if cacheRatio > 0.9 {
            return .critical
        } else if cacheRatio > memoryThreshold {
            return .high
        } else if cacheRatio > 0.5 {
            return .moderate
        } else {
            return .normal
        }
    }

    // MARK: - Private Methods

    private func reduceCacheSize() {
        // Reduce cache size by 20%
        let currentLimit = GPU.cacheLimit
        let newLimit = Int(Float(currentLimit) * 0.8)
        GPU.set(cacheLimit: newLimit)
    }

    // MARK: - Memory Snapshot Management

    func createMemorySnapshot() -> MLXMemorySnapshot {
        let snapshot = GPU.snapshot()
        return MLXMemorySnapshot(
            timestamp: Date(),
            memoryLimit: GPU.memoryLimit,
            cacheLimit: GPU.cacheLimit,
            gpuSnapshot: snapshot
        )
    }

    func compareSnapshots(_ before: MLXMemorySnapshot, _ after: MLXMemorySnapshot) -> MLXMemoryDelta {
        let delta = before.gpuSnapshot.delta(after.gpuSnapshot)
        return MLXMemoryDelta(
            beforeSnapshot: before,
            afterSnapshot: after,
            gpuDelta: delta,
            timeDelta: after.timestamp.timeIntervalSince(before.timestamp)
        )
    }
}

// MARK: - Supporting Types

@available(iOS 16.0, *)
enum MemoryPressureLevel: String, CaseIterable {
    case normal = "normal"
    case moderate = "moderate"
    case high = "high"
    case critical = "critical"

    var description: String {
        switch self {
        case .normal:
            return "Normal memory usage"
        case .moderate:
            return "Moderate memory pressure"
        case .high:
            return "High memory pressure"
        case .critical:
            return "Critical memory pressure"
        }
    }
}

@available(iOS 16.0, *)
struct MLXMemorySnapshot {
    let timestamp: Date
    let memoryLimit: Int
    let cacheLimit: Int
    let gpuSnapshot: GPU.Snapshot

    var description: String {
        return """
        Memory Snapshot (\(timestamp.formatted())):
        - Memory Limit: \(memoryLimit / (1024 * 1024))MB
        - Cache Limit: \(cacheLimit / (1024 * 1024))MB
        - GPU Snapshot: \(gpuSnapshot.description)
        """
    }
}

@available(iOS 16.0, *)
struct MLXMemoryDelta {
    let beforeSnapshot: MLXMemorySnapshot
    let afterSnapshot: MLXMemorySnapshot
    let gpuDelta: GPU.Snapshot
    let timeDelta: TimeInterval

    var description: String {
        return """
        Memory Delta (over \(String(format: "%.2f", timeDelta))s):
        - Before: \(beforeSnapshot.timestamp.formatted())
        - After: \(afterSnapshot.timestamp.formatted())
        - GPU Delta: \(gpuDelta.description)
        """
    }
}