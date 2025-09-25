import Foundation

// MARK: - Base Protocols
// Protocols for MLX module implementations

@available(iOS 16.0, *)
protocol MLXModelHandler {
    func loadModel(configuration: [String: Any]) async throws -> String
    func unloadModel(modelId: String) async throws
    func isModelLoaded(modelId: String) -> Bool
    func getModelInfo(modelId: String) -> [String: Any]?
}

@available(iOS 16.0, *)
protocol MLXTextGenerator: MLXModelHandler {
    func generateText(modelId: String, prompt: String, options: [String: Any]) async throws -> String
    func streamGenerateText(modelId: String, prompt: String, options: [String: Any], onToken: @escaping (String) -> Void) async throws
}

@available(iOS 16.0, *)
protocol MLXImageGenerator: MLXModelHandler {
    func generateImage(modelId: String, prompt: String, options: [String: Any]) async throws -> String
}

@available(iOS 16.0, *)
protocol MLXMemoryManageable {
    func clearCache()
    func getMemoryInfo() -> [String: Any]
    func optimizeMemory()
}