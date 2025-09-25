import Foundation

// MARK: - MLX Error Types

@available(iOS 16.0, *)
public enum MLXError: LocalizedError, Sendable {
    case modelNotFound(String)
    case modelLoadFailed(String)
    case invalidConfiguration(String)
    case inferenceError(String)
    case memoryError(String)
    case networkError(String)
    case permissionDenied(String)
    case unknownError(String)

    public var errorDescription: String? {
        switch self {
        case .modelNotFound(let message):
            return "Model not found: \(message)"
        case .modelLoadFailed(let message):
            return "Model load failed: \(message)"
        case .invalidConfiguration(let message):
            return "Invalid configuration: \(message)"
        case .inferenceError(let message):
            return "Inference error: \(message)"
        case .memoryError(let message):
            return "Memory error: \(message)"
        case .networkError(let message):
            return "Network error: \(message)"
        case .permissionDenied(let message):
            return "Permission denied: \(message)"
        case .unknownError(let message):
            return "Unknown error: \(message)"
        }
    }

    public var localizedDescription: String {
        return errorDescription ?? "MLX Error"
    }

    public var errorCode: String {
        switch self {
        case .modelNotFound:
            return "MODEL_NOT_FOUND"
        case .modelLoadFailed:
            return "MODEL_LOAD_FAILED"
        case .invalidConfiguration:
            return "INVALID_CONFIGURATION"
        case .inferenceError:
            return "INFERENCE_ERROR"
        case .memoryError:
            return "MEMORY_ERROR"
        case .networkError:
            return "NETWORK_ERROR"
        case .permissionDenied:
            return "PERMISSION_DENIED"
        case .unknownError:
            return "UNKNOWN_ERROR"
        }
    }
}

// MARK: - Model Type Enum

@available(iOS 16.0, *)
public enum MLXModelType: String, Sendable, CaseIterable {
    case llm = "llm"
    case stableDiffusion = "stableDiffusion"
    case embedding = "embedding"
    case vlm = "vlm"

    public var displayName: String {
        switch self {
        case .llm:
            return "Large Language Model"
        case .stableDiffusion:
            return "Stable Diffusion"
        case .embedding:
            return "Embedding Model"
        case .vlm:
            return "Vision Language Model"
        }
    }
}

// MARK: - Model Configuration

@available(iOS 16.0, *)
public struct MLXModelConfiguration: Sendable {
    public let modelId: String
    public let modelType: MLXModelType
    public let huggingFaceId: String?
    public let localPath: String?
    public let quantization: String?
    public let cacheConfig: MLXCacheConfig?

    public init(
        modelId: String,
        modelType: MLXModelType,
        huggingFaceId: String? = nil,
        localPath: String? = nil,
        quantization: String? = nil,
        cacheConfig: MLXCacheConfig? = nil
    ) {
        self.modelId = modelId
        self.modelType = modelType
        self.huggingFaceId = huggingFaceId
        self.localPath = localPath
        self.quantization = quantization
        self.cacheConfig = cacheConfig
    }

    public init(from dict: [String: Any]) throws {
        guard let modelId = dict["modelId"] as? String else {
            throw MLXError.invalidConfiguration("Missing modelId")
        }

        guard let modelTypeString = dict["modelType"] as? String,
              let modelType = MLXModelType(rawValue: modelTypeString) else {
            throw MLXError.invalidConfiguration("Invalid or missing modelType")
        }

        self.modelId = modelId
        self.modelType = modelType
        self.huggingFaceId = dict["huggingFaceId"] as? String
        self.localPath = dict["localPath"] as? String
        self.quantization = dict["quantization"] as? String

        if let cacheDict = dict["cacheConfig"] as? [String: Any] {
            self.cacheConfig = try MLXCacheConfig(from: cacheDict)
        } else {
            self.cacheConfig = nil
        }
    }
}

// MARK: - Cache Configuration

@available(iOS 16.0, *)
public struct MLXCacheConfig: Sendable {
    public let maxSize: Int?
    public let ttl: TimeInterval? // Time to live in seconds

    public init(maxSize: Int? = nil, ttl: TimeInterval? = nil) {
        self.maxSize = maxSize
        self.ttl = ttl
    }

    public init(from dict: [String: Any]) throws {
        self.maxSize = dict["maxSize"] as? Int
        self.ttl = dict["ttl"] as? TimeInterval
    }
}