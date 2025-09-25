import Foundation
import Hub

// MARK: - Hub Configuration for MLX Models

@available(iOS 16.0, *)
extension HubApi {
    /// Default Hub API instance for downloading MLX models
    /// Downloads to app's cache directory under 'ariob/mlx-models'
    static let mlxModels = HubApi(
        downloadBase: URL.cachesDirectory.appending(path: "ariob/mlx-models")
    )
}

// MARK: - MLX Model Downloader

@available(iOS 16.0, *)
public struct MLXModelDownloader {

    /// Downloads a model from Hugging Face
    /// - Parameter huggingFaceId: The Hugging Face repository ID (e.g., "mlx-community/gemma-2-2b-it-4bit")
    /// - Returns: URL to the downloaded model directory
    public static func downloadModel(huggingFaceId: String) async throws -> URL {
        let repo = Hub.Repo(id: huggingFaceId)

        // Files required for MLX models
        let filesToDownload = [
            "config.json",
            "*.safetensors",
            "tokenizer.json",
            "tokenizer_config.json",
            "model.safetensors.index.json",
            "special_tokens_map.json"
        ]

        // Download with progress tracking
        return try await Hub.snapshot(
            from: repo,
            matching: filesToDownload,
            progressHandler: { progress in
                print("[MLXModelDownloader] Download progress for \(huggingFaceId): \(Int(progress.fractionCompleted * 100))%")
            }
        )
    }

    /// Downloads a model with custom progress handler
    public static func downloadModel(
        huggingFaceId: String,
        progressHandler: @escaping (Progress) -> Void
    ) async throws -> URL {
        let repo = Hub.Repo(id: huggingFaceId)

        let filesToDownload = [
            "config.json",
            "*.safetensors",
            "tokenizer.json",
            "tokenizer_config.json",
            "model.safetensors.index.json",
            "special_tokens_map.json"
        ]

        return try await Hub.snapshot(
            from: repo,
            matching: filesToDownload,
            progressHandler: progressHandler
        )
    }

    /// Checks if a model is already downloaded
    public static func isModelCached(huggingFaceId: String) -> Bool {
        let cacheDir = URL.cachesDirectory.appending(path: "ariob/mlx-models")
        let modelDir = cacheDir.appending(path: huggingFaceId.replacingOccurrences(of: "/", with: "_"))

        // Check if directory exists and contains required files
        let fm = FileManager.default
        var isDirectory: ObjCBool = false

        guard fm.fileExists(atPath: modelDir.path, isDirectory: &isDirectory),
              isDirectory.boolValue else {
            return false
        }

        // Check for essential files
        let requiredFiles = ["config.json", "tokenizer.json"]
        for file in requiredFiles {
            let filePath = modelDir.appending(path: file)
            if !fm.fileExists(atPath: filePath.path) {
                return false
            }
        }

        return true
    }

    /// Gets the cached model directory URL if it exists
    public static func getCachedModelURL(huggingFaceId: String) -> URL? {
        guard isModelCached(huggingFaceId: huggingFaceId) else {
            return nil
        }

        let cacheDir = URL.cachesDirectory.appending(path: "ariob/mlx-models")
        return cacheDir.appending(path: huggingFaceId.replacingOccurrences(of: "/", with: "_"))
    }

    /// Clears the model cache for a specific model
    public static func clearModelCache(huggingFaceId: String) throws {
        guard let modelURL = getCachedModelURL(huggingFaceId: huggingFaceId) else {
            return
        }

        try FileManager.default.removeItem(at: modelURL)
    }

    /// Clears all cached models
    public static func clearAllModelCache() throws {
        let cacheDir = URL.cachesDirectory.appending(path: "ariob/mlx-models")

        if FileManager.default.fileExists(atPath: cacheDir.path) {
            try FileManager.default.removeItem(at: cacheDir)
        }
    }

    /// Gets the total size of cached models in bytes
    public static func getCacheSize() -> Int64 {
        let cacheDir = URL.cachesDirectory.appending(path: "ariob/mlx-models")

        guard let enumerator = FileManager.default.enumerator(
            at: cacheDir,
            includingPropertiesForKeys: [.totalFileAllocatedSizeKey],
            options: []
        ) else {
            return 0
        }

        var totalSize: Int64 = 0

        for case let fileURL as URL in enumerator {
            guard let resourceValues = try? fileURL.resourceValues(forKeys: [.totalFileAllocatedSizeKey]),
                  let fileSize = resourceValues.totalFileAllocatedSize else {
                continue
            }
            totalSize += Int64(fileSize)
        }

        return totalSize
    }
}

// MARK: - Model Download Progress

@available(iOS 16.0, *)
public struct MLXModelDownloadProgress {
    public let modelId: String
    public let fractionCompleted: Double
    public let totalBytesWritten: Int64
    public let totalBytesExpectedToWrite: Int64
    public let downloadSpeed: Double? // bytes per second
    public let estimatedTimeRemaining: TimeInterval?

    public var percentageCompleted: Int {
        return Int(fractionCompleted * 100)
    }

    public var isCompleted: Bool {
        return fractionCompleted >= 1.0
    }
}