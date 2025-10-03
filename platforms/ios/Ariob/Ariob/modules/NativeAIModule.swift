import Foundation
import Darwin
import Hub
import MLX
import MLXLLM
import MLXLMCommon
import MLXVLM

// MARK: - Event Constants

/// Namespaced constants for bridging events to Lynx JavaScript runtime.
///
/// These event names are used to emit global events that can be listened to
/// from JavaScript code using the Lynx event system.
@available(iOS 16.0, *)
private enum NativeAIEventName {
    /// Event name for model lifecycle events (loading, loaded, error)
    static let model = "native_ai:model"

    /// Event name for streaming text generation events (chunks, completion)
    static let stream = "native_ai:stream"
}

// MARK: - Callback Wrapper

/// Thread-safe wrapper that guarantees callbacks into Lynx are executed on the main thread.
///
/// The Lynx JavaScript runtime requires all UI-related operations to occur on the main thread.
/// This wrapper ensures callbacks are dispatched to the main queue before being executed,
/// preventing thread-safety issues and potential crashes.
///
/// - Note: Marked as `@unchecked Sendable` because the callback closure is guaranteed
///         to be executed on the main thread through `DispatchQueue.main.async`.
@available(iOS 16.0, *)
private final class NativeAICallback: @unchecked Sendable {
    private let callback: (NSString) -> Void

    /// Creates a new callback wrapper.
    /// - Parameter callback: The closure to invoke on the main thread
    init(_ callback: @escaping (NSString) -> Void) {
        self.callback = callback
    }

    /// Sends a JSON string to the callback on the main thread.
    /// - Parameter json: JSON-encoded string to send to JavaScript
    func send(json: String) {
        DispatchQueue.main.async { [callback] in
            callback(json as NSString)
        }
    }
}

// MARK: - Event Payload

/// Container for event body payloads sent to the Lynx global event system.
///
/// Wraps dictionary payloads in a Sendable-compliant structure for safe
/// cross-thread communication.
@available(iOS 16.0, *)
private struct NativeAIEventBody: @unchecked Sendable {
    let value: [String: Any]
}

// MARK: - Event Emitter

/// Handles dispatching global events to the Lynx JavaScript runtime on the main thread.
///
/// This class manages event emission for both model lifecycle events and streaming
/// generation events. All events are dispatched on the main thread to ensure
/// compatibility with the Lynx event system.
///
/// # Thread Safety
/// - All public methods are thread-safe
/// - Events are always emitted on the main thread
/// - Weak reference to context prevents retain cycles
///
/// # Event Types
/// - **Model Events**: Loading progress, load completion, errors
/// - **Stream Events**: Generation chunks, statistics, completion
@available(iOS 16.0, *)
private final class NativeAIEventEmitter: @unchecked Sendable {
    private weak var context: LynxContext?

    /// Creates a new event emitter with the specified Lynx context.
    /// - Parameter context: Lynx runtime context for event emission
    init(context: LynxContext?) {
        self.context = context
    }

    /// Updates the Lynx context reference.
    /// - Parameter context: New Lynx context
    func update(context: LynxContext?) {
        self.context = context
    }

    /// Emits a global event to the Lynx JavaScript runtime on the main thread.
    ///
    /// - Parameters:
    ///   - name: Event name (e.g., "native_ai:stream")
    ///   - body: Event payload dictionary
    func emit(name: String, body: [String: Any]) {
        guard let context else { return }
        let payload = NativeAIEventBody(value: body)
        let contextPointer = Unmanaged.passUnretained(context)
        DispatchQueue.main.async {
            contextPointer.takeUnretainedValue().sendGlobalEvent(name, withParams: [payload.value])
        }
    }

    /// Emits a model lifecycle event.
    ///
    /// - Parameter body: Event payload containing type, model name, and optional data
    ///
    /// # Example Payloads
    /// ```swift
    /// // Loading started
    /// ["type": "loading_started", "model": "gemma3:2b"]
    ///
    /// // Download progress
    /// ["type": "download_progress", "model": "gemma3:2b", "progress": 0.65, "percentage": 65]
    ///
    /// // Loaded
    /// ["type": "loaded", "model": "gemma3:2b", "summary": modelInfo]
    /// ```
    func emitModelEvent(_ body: [String: Any]) {
        emit(name: NativeAIEventName.model, body: body)
    }

    /// Emits a streaming generation event.
    ///
    /// - Parameter body: Event payload containing status, streamId, and event-specific data
    ///
    /// # Example Payloads
    /// ```swift
    /// // Started
    /// ["status": "started", "streamId": "abc", "model": "gemma3:2b"]
    ///
    /// // Chunk
    /// ["status": "chunk", "streamId": "abc", "delta": "hello", "content": "hello"]
    ///
    /// // Complete
    /// ["status": "complete", "streamId": "abc", "content": "hello world", "duration": 2.3]
    /// ```
    func emitStreamEvent(_ body: [String: Any]) {
        emit(name: NativeAIEventName.stream, body: body)
    }
}

// MARK: - Main Module

/// Native bridge module that exposes MLX-backed AI capabilities to Lynx JavaScript runtime.
///
/// This module provides a complete interface for managing on-device AI models powered by
/// Apple's MLX framework. It handles model lifecycle (loading, unloading), streaming text
/// generation, and real-time progress events.
///
/// # Features
/// - Model discovery and enumeration
/// - Asynchronous model loading with progress tracking
/// - Streaming text generation with real-time chunks
/// - Performance statistics and metadata
/// - Tool/function calling support
/// - GPU acceleration (Metal) with CPU fallback
///
/// # Architecture
/// - All callbacks are executed on the main thread for Lynx compatibility
/// - Model operations run on background threads with `.userInitiated` priority
/// - Events are emitted globally for JavaScript consumption
/// - Thread-safe model caching with `NSLock` synchronization
///
/// # JavaScript Integration
/// ```javascript
/// const models = await NativeAIModule.listAvailableModels();
/// await NativeAIModule.loadModel({ model: "gemma3:2b" });
/// await NativeAIModule.generateChat({
///   model: "gemma3:2b",
///   messages: [{ role: "user", content: "Hello!" }]
/// });
/// ```
///
/// - Important: Requires iOS 16.0+ for MLX framework support
/// - Note: Set `MLX_FORCE_CPU=1` environment variable to disable GPU acceleration
@available(iOS 16.0, *)
@objcMembers
public final class NativeAIModule: NSObject, LynxContextModule {

    // MARK: - Lynx Registration

    /// Module name exposed to JavaScript runtime.
    public static var name: String { "NativeAIModule" }

    /// Method name to selector mapping for Lynx method registration.
    public static var methodLookup: [String: String] {
        return [
            "listAvailableModels": NSStringFromSelector(#selector(listAvailableModels)),
            "listLoadedModels": NSStringFromSelector(#selector(listLoadedModels)),
            "isModelLoaded": NSStringFromSelector(#selector(isModelLoaded(_:))),
            "loadModel": NSStringFromSelector(#selector(loadModel(_:callback:))),
            "unloadModel": NSStringFromSelector(#selector(unloadModel(_:))),
            "generateChat": NSStringFromSelector(#selector(generateChat(_:callback:)))
        ]
    }

    // MARK: - Properties

    private let chatService: MLXChatService
    private let eventEmitter: NativeAIEventEmitter

    /// One-time runtime bootstrap for MLX configuration.
    ///
    /// Configures GPU/Metal acceleration settings based on environment variables.
    /// Executed once per process lifecycle.
    ///
    /// - Note: Set `MLX_FORCE_CPU=1` to force CPU execution (disables GPU)
    private static let runtimeBootstrap: Void = {
        // Use GPU/Metal for better performance unless explicitly forced to CPU
        let forceCPU = ProcessInfo.processInfo.environment["MLX_FORCE_CPU"] == "1"
        if forceCPU {
            setenv("MLX_METAL", "0", 1)
            Device.setDefault(device: Device(.cpu))
            MLX.GPU.set(cacheLimit: 0)
        } else {
            unsetenv("MLX_METAL")
            // Use default GPU settings for optimal performance
        }
    }()

    // MARK: - Initializers

    /// Default initializer without context.
    public override init() {
        _ = Self.runtimeBootstrap
        self.chatService = MLXChatService()
        self.eventEmitter = NativeAIEventEmitter(context: nil)
        super.init()
    }

    /// Primary Lynx entry point with runtime context.
    ///
    /// - Parameter lynxContext: Runtime context used to emit global events
    @objc public required init(lynxContext: LynxContext) {
        _ = Self.runtimeBootstrap
        self.chatService = MLXChatService()
        self.eventEmitter = NativeAIEventEmitter(context: lynxContext)
        super.init()
    }

    /// Optional Lynx entry point that receives module parameters.
    ///
    /// - Parameters:
    ///   - lynxContext: Runtime context for event emission
    ///   - param: Configuration passed from JavaScript (currently unused)
    @objc public init(lynxContext: LynxContext, withParam param: Any) {
        _ = Self.runtimeBootstrap
        self.chatService = MLXChatService()
        self.eventEmitter = NativeAIEventEmitter(context: lynxContext)
        super.init()
    }

    /// Legacy initializer for backward compatibility when no context is supplied.
    ///
    /// - Parameter param: Configuration payload (currently unused)
    @objc public init(param: Any) {
        _ = Self.runtimeBootstrap
        self.chatService = MLXChatService()
        self.eventEmitter = NativeAIEventEmitter(context: nil)
        super.init()
    }

    // MARK: - Model Management

    /// Provides metadata for all on-device models registered with MLX.
    ///
    /// Returns information about available models including their Hugging Face IDs,
    /// display names, types (LLM/VLM), and configuration details.
    ///
    /// - Returns: JSON string containing success response with models array
    ///
    /// # Response Format
    /// ```json
    /// {
    ///   "success": true,
    ///   "data": {
    ///     "models": [
    ///       {
    ///         "name": "gemma3:2b",
    ///         "displayName": "Gemma 3",
    ///         "type": "llm",
    ///         "configuration": { "id": "google/gemma-2b", ... }
    ///       }
    ///     ]
    ///   },
    ///   "timestamp": 1704067200
    /// }
    /// ```
    ///
    /// - Note: This is a synchronous operation but runs quickly as it only queries metadata
    public func listAvailableModels() -> NSString {
        let models = chatService.availableModels.map { $0.toDictionary() }
        let payload: [String: Any] = [
            "models": models
        ]
        return NativeAIModule.successJSON(payload) as NSString
    }

    /// Reports summaries for models that are currently cached in memory.
    ///
    /// Returns metadata for loaded models including their load timestamps,
    /// configuration details, and current status.
    ///
    /// - Returns: JSON string containing success response with loaded models array
    ///
    /// # Response Format
    /// ```json
    /// {
    ///   "success": true,
    ///   "data": {
    ///     "models": [
    ///       {
    ///         "name": "gemma3:2b",
    ///         "status": "loaded",
    ///         "loadedAt": 1704067200,
    ///         ...
    ///       }
    ///     ]
    ///   }
    /// }
    /// ```
    public func listLoadedModels() -> NSString {

        let models = chatService.loadedModelSummaries()
        let payload: [String: Any] = [
            "models": models
        ]
        return NativeAIModule.successJSON(payload) as NSString
    }

    /// Checks whether a specific model has an active container in memory.
    ///
    /// Fast lookup to determine if a model is loaded and ready for immediate inference.
    ///
    /// - Parameter modelName: Model identifier (e.g., "gemma3:2b")
    /// - Returns: JSON string with load status
    ///
    /// # Response Format
    /// ```json
    /// {
    ///   "success": true,
    ///   "data": { "model": "gemma3:2b", "loaded": true }
    /// }
    /// ```
    ///
    /// # Error Response
    /// ```json
    /// {
    ///   "success": false,
    ///   "message": "Model name cannot be empty"
    /// }
    /// ```
    public func isModelLoaded(_ modelName: NSString) -> NSString {
        let name = (modelName as String).trimmingCharacters(in: .whitespacesAndNewlines)
        guard !name.isEmpty else {
            return NativeAIError.invalidRequest("Model name cannot be empty").jsonString as NSString
        }


        let loaded = chatService.isModelLoaded(name)
        let payload: [String: Any] = [
            "model": name,
            "loaded": loaded
        ]
        return NativeAIModule.successJSON(payload) as NSString
    }

    /// Loads a model into memory and emits progress events.
    ///
    /// Initiates asynchronous model loading with real-time progress updates. Downloads
    /// model files from Hugging Face if not cached, then loads into memory for inference.
    ///
    /// # Progress Events
    /// Emits `native_ai:model` global events during loading:
    /// - `loading_started`: Load operation initiated
    /// - `download_progress`: Download progress (0-100%)
    /// - `loaded`: Model successfully loaded with metadata
    /// - `error`: Load operation failed
    ///
    /// - Parameters:
    ///   - requestJSON: JSON payload `{ "model": string }`
    ///   - callback: Invoked with completion payload (success or error)
    ///
    /// # Request Format
    /// ```json
    /// { "model": "gemma3:2b" }
    /// ```
    ///
    /// # Success Response
    /// ```json
    /// {
    ///   "success": true,
    ///   "data": {
    ///     "name": "gemma3:2b",
    ///     "status": "loaded",
    ///     "loadedAt": 1704067200,
    ///     "huggingFaceId": "google/gemma-2b",
    ///     ...
    ///   }
    /// }
    /// ```
    ///
    /// - Important: Runs on `.userInitiated` priority background thread
    /// - Note: Includes 60-second timeout protection in JavaScript wrapper
    public func loadModel(_ requestJSON: NSString, callback: @escaping (NSString) -> Void) {
        let requestString = requestJSON as String
        let callbackWrapper = NativeAICallback(callback)

        Task(priority: .userInitiated) { [chatService, eventEmitter] in
            do {
                let request = try ModelLoadRequest.parse(jsonString: requestString)
                eventEmitter.emitModelEvent([
                    "type": "loading_started",
                    "model": request.modelName
                ])

                let summary = try await chatService.loadModel(
                    named: request.modelName
                ) { progress in
                    let percentage = max(0, min(100, progress * 100.0))
                    eventEmitter.emitModelEvent([
                        "type": "download_progress",
                        "model": request.modelName,
                        "progress": progress,
                        "percentage": percentage
                    ])
                }

                let response = NativeAIModule.successJSON(summary.dictionary)
                eventEmitter.emitModelEvent([
                    "type": "loaded",
                    "model": request.modelName,
                    "summary": summary.dictionary
                ])
                callbackWrapper.send(json: response)
            } catch let error as NativeAIError {
                var errorEvent: [String: Any] = [
                    "type": "error",
                    "message": error.localizedDescription
                ]
                if let relatedModel = error.relatedModel {
                    errorEvent["model"] = relatedModel
                }
                eventEmitter.emitModelEvent(errorEvent)
                callbackWrapper.send(json: error.jsonString)
            } catch {
                let runtimeError = NativeAIError.runtime(error.localizedDescription)
                eventEmitter.emitModelEvent([
                    "type": "error",
                    "message": error.localizedDescription
                ])
                callbackWrapper.send(json: runtimeError.jsonString)
            }
        }
    }

    /// Removes a loaded model container to reclaim memory.
    ///
    /// Unloads the model from memory, freeing GPU/CPU resources. Useful for
    /// memory management when switching between models.
    ///
    /// - Parameter modelName: Identifier of the model to unload
    /// - Returns: JSON string indicating success or failure
    ///
    /// # Success Response
    /// ```json
    /// {
    ///   "success": true,
    ///   "data": { "model": "gemma3:2b", "status": "unloaded" }
    /// }
    /// ```
    ///
    /// # Error Response
    /// ```json
    /// {
    ///   "success": false,
    ///   "message": "Model not found: gemma3:2b"
    /// }
    /// ```
    public func unloadModel(_ modelName: NSString) -> NSString {
        let name = (modelName as String).trimmingCharacters(in: .whitespacesAndNewlines)
        guard !name.isEmpty else {
            return NativeAIError.invalidRequest("Model name cannot be empty").jsonString as NSString
        }

        let wasLoaded = chatService.unloadModel(named: name)
        if !wasLoaded {
            return NativeAIError.modelNotFound(name).jsonString as NSString
        }

        let payload: [String: Any] = [
            "model": name,
            "status": "unloaded"
        ]
        return NativeAIModule.successJSON(payload) as NSString
    }

    // MARK: - Text Generation

    /// Generates streaming chat responses using the requested model.
    ///
    /// Initiates streaming text generation with real-time chunk delivery via global events.
    /// Supports multi-turn conversations, tool calling, and performance statistics.
    ///
    /// # Stream Events
    /// Emits `native_ai:stream` global events during generation:
    /// - `started`: Generation initiated with streamId
    /// - `chunk`: Text fragment with delta and accumulated content
    /// - `info`: Performance statistics (tokens/sec, timing)
    /// - `tool_call`: Function/tool invocation by the model
    /// - `complete`: Generation finished with final content
    /// - `error`: Generation failed with error message
    ///
    /// - Parameters:
    ///   - requestJSON: JSON payload with model, messages, and options
    ///   - callback: Invoked with acknowledgement and final result
    ///
    /// # Request Format
    /// ```json
    /// {
    ///   "model": "gemma3:2b",
    ///   "messages": [
    ///     { "role": "user", "content": "Hello!" }
    ///   ],
    ///   "temperature": 0.7,
    ///   "maxTokens": 256
    /// }
    /// ```
    ///
    /// # Event Flow
    /// 1. Callback receives `{ status: "started", streamId: "..." }`
    /// 2. Events emitted for each chunk, statistics, tool calls
    /// 3. Callback receives final `{ status: "generated", content: "..." }`
    ///
    /// - Important: Runs on `.userInitiated` priority background thread
    /// - Note: System messages are auto-injected if not present
    /// - SeeAlso: `ChatGenerationRequest` for parameter details
    public func generateChat(_ requestJSON: NSString, callback: @escaping (NSString) -> Void) {
        let requestString = requestJSON as String
        let callbackWrapper = NativeAICallback(callback)

        Task(priority: .userInitiated) { [chatService, eventEmitter] in
            await NativeAIModule.handleGenerate(
                using: chatService,
                emitter: eventEmitter,
                requestString: requestString,
                callback: callbackWrapper
            )
        }
    }

    /// Internal handler for streaming generation logic.
    ///
    /// Orchestrates the complete generation flow including request parsing,
    /// stream iteration, event emission, and error handling.
    ///
    /// - Parameters:
    ///   - service: Chat service for model access
    ///   - emitter: Event emitter for progress updates
    ///   - requestString: JSON request payload
    ///   - callback: Main thread callback wrapper
    private static func handleGenerate(
        using service: MLXChatService,
        emitter: NativeAIEventEmitter,
        requestString: String,
        callback: NativeAICallback
    ) async {
        var streamId: String?

        do {
            let request = try ChatGenerationRequest.parse(jsonString: requestString)
            let resolvedMessages = request.messages.ensureSystemMessage()
            let generatedStreamId = makeStreamIdentifier()
            streamId = generatedStreamId

            callback.send(json: successJSON([
                "status": "started",
                "streamId": generatedStreamId,
                "model": request.modelName
            ]))

            let startTime = Date()
            var startedEvent: [String: Any] = [
                "status": "started",
                "streamId": generatedStreamId,
                "model": request.modelName,
                "messages": resolvedMessages.count,
                "temperature": request.temperature ?? 0.7
            ]
            if let maxTokens = request.maxTokens {
                startedEvent["maxTokens"] = maxTokens
            }
            emitter.emitStreamEvent(startedEvent)

            var params = GenerateParameters(temperature: Float(request.temperature ?? 0.7))
            params.maxTokens = request.maxTokens ?? 256

            let stream = try await service.generate(
                messages: resolvedMessages,
                modelName: request.modelName,
                generationParameters: params
            )

            var finalText = ""
            var completionInfo: GenerateCompletionInfo?
            var toolCalls: [ToolCall] = []
            var chunkIndex = 0

            for await generation in stream {
                switch generation {
                case .chunk(let chunk):
                    finalText.append(chunk)
                    let chunkPayload: [String: Any] = [
                        "status": "chunk",
                        "streamId": generatedStreamId,
                        "model": request.modelName,
                        "delta": chunk,
                        "content": finalText,
                        "index": chunkIndex,
                        "timestamp": Date().timeIntervalSince1970
                    ]
                    emitter.emitStreamEvent(chunkPayload)
                    callback.send(json: jsonString(from: chunkPayload))
                    chunkIndex += 1
                case .info(let info):
                    completionInfo = info
                    emitter.emitStreamEvent([
                        "status": "info",
                        "streamId": generatedStreamId,
                        "model": request.modelName,
                        "statistics": [
                            "promptTokenCount": info.promptTokenCount,
                            "generationTokenCount": info.generationTokenCount,
                            "promptTime": info.promptTime,
                            "generationTime": info.generateTime,
                            "promptTokensPerSecond": info.promptTokensPerSecond,
                            "tokensPerSecond": info.tokensPerSecond
                        ]
                    ])
                case .toolCall(let call):
                    toolCalls.append(call)
                    emitter.emitStreamEvent([
                        "status": "tool_call",
                        "streamId": generatedStreamId,
                        "model": request.modelName,
                        "tool": [
                            "name": call.function.name,
                            "arguments": call.function.arguments.mapValues { $0.anyValue }
                        ]
                    ])
                }
            }

            let finalMessage = finalText.trimmingCharacters(in: .whitespacesAndNewlines)
            var payload: [String: Any] = [
                "model": request.modelName,
                "content": finalMessage,
                "duration": Date().timeIntervalSince(startTime),
                "status": "generated",
                "streamId": generatedStreamId
            ]

            if let metadata = buildGenerationMetadata(info: completionInfo, toolCalls: toolCalls) {
                payload["metadata"] = metadata
            }

            emitter.emitStreamEvent([
                "status": "complete",
                "streamId": generatedStreamId,
                "model": request.modelName,
                "content": finalMessage,
                "duration": payload["duration"] ?? 0,
                "metadata": payload["metadata"] ?? [:]
            ])

            callback.send(json: successJSON(payload))
        } catch let error as NativeAIError {
            if let currentStreamId = streamId {
                emitter.emitStreamEvent([
                    "status": "error",
                    "model": error.relatedModel ?? "unknown",
                    "message": error.message,
                    "streamId": currentStreamId
                ])
            }
            callback.send(json: error.jsonString)
        } catch {
            let runtimeError = NativeAIError.runtime(error.localizedDescription)
            if let currentStreamId = streamId {
                emitter.emitStreamEvent([
                    "status": "error",
                    "model": "unknown",
                    "message": error.localizedDescription,
                    "streamId": currentStreamId
                ])
            }
            callback.send(json: runtimeError.jsonString)
        }
    }
}

// MARK: - JSON Helpers

@available(iOS 16.0, *)
private extension NativeAIModule {
    /// Generates a unique stream identifier using UUID.
    ///
    /// - Returns: Stream ID in format "stream-{uuid}"
    static func makeStreamIdentifier() -> String {
        "stream-" + UUID().uuidString
    }

    /// Creates a success response JSON string.
    ///
    /// - Parameter data: Payload data to include in response
    /// - Returns: JSON string with success=true, data, and timestamp
    static func successJSON(_ data: Any) -> String {
        let response: [String: Any] = [
            "success": true,
            "data": data,
            "timestamp": Date().timeIntervalSince1970
        ]
        return jsonString(from: response)
    }

    /// Builds metadata dictionary from generation info and tool calls.
    ///
    /// - Parameters:
    ///   - info: Performance statistics from generation
    ///   - toolCalls: Array of tool calls made during generation
    /// - Returns: Metadata dictionary or nil if empty
    private static func buildGenerationMetadata(info: GenerateCompletionInfo?, toolCalls: [ToolCall])
        -> [String: Any]?
    {
        var metadata: [String: Any] = [:]

        if let info {
            metadata["statistics"] = [
                "promptTokenCount": info.promptTokenCount,
                "generationTokenCount": info.generationTokenCount,
                "promptTime": info.promptTime,
                "generationTime": info.generateTime,
                "promptTokensPerSecond": info.promptTokensPerSecond,
                "tokensPerSecond": info.tokensPerSecond
            ]
        }

        if !toolCalls.isEmpty {
            metadata["toolCalls"] = toolCalls.enumerated().map { index, call in
                [
                    "index": index,
                    "name": call.function.name,
                    "arguments": call.function.arguments.mapValues { $0.anyValue }
                ]
            }
        }

        return metadata.isEmpty ? nil : metadata
    }

    /// Serializes an object to JSON string.
    ///
    /// - Parameter object: Object to serialize (must be JSON-compatible)
    /// - Returns: JSON string or error JSON if serialization fails
    static func jsonString(from object: Any) -> String {
        guard JSONSerialization.isValidJSONObject(object),
              let data = try? JSONSerialization.data(withJSONObject: object, options: [.sortedKeys]),
              let json = String(data: data, encoding: .utf8) else {
            return NativeAIError.serializationFailure.jsonString
        }
        return json
    }
}

// MARK: - Error Handling

/// Custom error types for Native AI operations.
@available(iOS 16.0, *)
private enum NativeAIError: Error {
    case invalidJSON
    case invalidRequest(String)
    case modelNotFound(String)
    case runtime(String)
    case serializationFailure

    /// JSON-formatted error response string.
    var jsonString: String {
        let payload: [String: Any] = [
            "success": false,
            "message": message,
            "timestamp": Date().timeIntervalSince1970
        ]

        guard let data = try? JSONSerialization.data(withJSONObject: payload, options: [.sortedKeys]),
              let json = String(data: data, encoding: .utf8) else {
            return "{\"success\":false,\"message\":\"Fatal serialization error\"}"
        }

        return json
    }

    /// Human-readable error message.
    var message: String {
        switch self {
        case .invalidJSON:
            return "Invalid JSON input"
        case .invalidRequest(let reason):
            return reason
        case .modelNotFound(let name):
            return "Model not found: \(name)"
        case .runtime(let reason):
            return "Unexpected error: \(reason)"
        case .serializationFailure:
            return "Failed to serialize response"
        }
    }

    /// Model name associated with error, if applicable.
    var relatedModel: String? {
        switch self {
        case .modelNotFound(let name):
            return name
        default:
            return nil
        }
    }
}

extension NativeAIError: CustomStringConvertible {
    var description: String {
        switch self {
        case .invalidJSON:
            return "invalidJSON"
        case .invalidRequest(let reason):
            return "invalidRequest(\(reason))"
        case .modelNotFound(let name):
            return "modelNotFound(\(name))"
        case .runtime(let reason):
            return "runtime(\(reason))"
        case .serializationFailure:
            return "serializationFailure"
        }
    }
}

extension NativeAIError: LocalizedError {
    var errorDescription: String? { message }
}

// MARK: - Request Parsing

/// Model load request payload.
@available(iOS 16.0, *)
private struct ModelLoadRequest {
    let modelName: String

    /// Parses JSON string into load request.
    ///
    /// - Parameter jsonString: JSON with "model" field
    /// - Returns: Parsed request
    /// - Throws: `NativeAIError` if parsing fails
    static func parse(jsonString: String) throws -> ModelLoadRequest {
        guard let data = jsonString.data(using: .utf8),
              let root = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw NativeAIError.invalidJSON
        }

        guard let modelName = (root["model"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines),
              !modelName.isEmpty else {
            throw NativeAIError.invalidRequest("Missing or empty model field")
        }

        return ModelLoadRequest(modelName: modelName)
    }
}

/// Chat generation request payload.
@available(iOS 16.0, *)
private struct ChatGenerationRequest {
    let modelName: String
    let messages: [ChatMessage]
    let temperature: Double?
    let maxTokens: Int?

    /// Parses JSON string into generation request.
    ///
    /// - Parameter jsonString: JSON with model, messages, and optional parameters
    /// - Returns: Parsed request
    /// - Throws: `NativeAIError` if parsing fails
    static func parse(jsonString: String) throws -> ChatGenerationRequest {
        guard let data = jsonString.data(using: .utf8),
              let root = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw NativeAIError.invalidJSON
        }

        let modelName = (root["model"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines)
        let chosenModel = modelName?.isEmpty == false ? modelName! : MLXChatService.defaultModelName

        guard let messagesArray = root["messages"] as? [[String: Any]], !messagesArray.isEmpty else {
            throw NativeAIError.invalidRequest("Missing chat messages in request")
        }

        let parsedMessages = try messagesArray.map { item -> ChatMessage in
            guard let roleString = item["role"] as? String,
                  let content = item["content"] as? String else {
                throw NativeAIError.invalidRequest("Each message must include role and content")
            }
            return ChatMessage(role: roleString, content: content)
        }

        let options = root["options"] as? [String: Any]
        let temperature = options?["temperature"] as? Double ?? root["temperature"] as? Double
        let maxTokens = options?["maxTokens"] as? Int ?? root["maxTokens"] as? Int

        return ChatGenerationRequest(
            modelName: chosenModel,
            messages: parsedMessages,
            temperature: temperature,
            maxTokens: maxTokens
        )
    }
}

// MARK: - Chat Messages

/// Represents a single chat message with role and content.
@available(iOS 16.0, *)
struct ChatMessage {
    let role: Chat.Message.Role
    let content: String

    /// Creates chat message from string role.
    ///
    /// - Parameters:
    ///   - role: Role string ("system", "user", "assistant")
    ///   - content: Message text content
    init(role: String, content: String) {
        switch role.lowercased() {
        case "assistant":
            self.role = .assistant
        case "system":
            self.role = .system
        default:
            self.role = .user
        }
        self.content = content
    }

    /// Converts to MLX Chat.Message format.
    func toChatMessage() -> Chat.Message {
        Chat.Message(role: role, content: content, images: [], videos: [])
    }
}

@available(iOS 16.0, *)
extension Array where Element == ChatMessage {
    /// Ensures messages array includes a system message.
    ///
    /// Prepends default system message if none exists.
    ///
    /// - Returns: Messages array with guaranteed system message
    func ensureSystemMessage() -> [ChatMessage] {
        if contains(where: { message in
            if case .system = message.role {
                return true
            } else {
                return false
            }
        }) {
            return self
        }

        let systemMessage = ChatMessage(role: "system", content: "You are a helpful assistant.")
        return [systemMessage] + self
    }
}

// MARK: - MLX Chat Service

/// Manages MLX model containers and provides text generation services.
///
/// This service handles model lifecycle including loading, caching, and inference
/// execution. It maintains thread-safe caches for loaded models and their metadata.
///
/// # Thread Safety
/// - Model cache operations are protected by `NSLock`
/// - All public methods are thread-safe
/// - Model loading runs on background threads
///
/// # Model Management
/// - Models are lazy-loaded on first use
/// - Once loaded, models remain in memory until explicitly unloaded
/// - Supports both LLM and VLM (vision-language) models
///
/// - Important: Models are downloaded from Hugging Face on first load
/// - Note: Model files are cached in the app's cache directory
@available(iOS 16.0, *)
final class MLXChatService: @unchecked Sendable {

    /// Default model name used when none specified.
    static let defaultModelName: String = "smolLM:135m"

    /// Registry of available models with their configurations.
    let availableModels: [LMModel] = [
        LMModel(
            name: "qwen3:0.6b",
            configuration: LLMRegistry.qwen3_0_6b_4bit,
            type: .llm),
        LMModel(
            name: "gemma3:1b",
            configuration: ModelConfiguration(
                id: "mlx-community/gemma-3-1b-it-qat-4bit",
                extraEOSTokens: ["<end_of_turn>"],
            ),
            type: .llm),
        LMModel(
            name: "deepseek-r1:1.5b",
            configuration: ModelConfiguration(
                id: "mlx-community/DeepSeek-R1-Distill-Qwen-1.5B-4bit"),
            type: .llm),
        LMModel(
            name: "qwen3-thinking:1b",
            configuration: ModelConfiguration(
                id: "lmstudio-community/Qwen3-4B-Thinking-2507-MLX-4bit"),
            type: .llm),
        LMModel(
            name: "llama-3.2:0.7b",
            configuration: ModelConfiguration(
                id: "mlx-community/Llama-3.2-3B-Instruct-uncensored-6bit"),
            type: .llm),
        LMModel(
            name: "gemma2b:0.8b",
            configuration: ModelConfiguration(
                id: "mitkox/gemma-2b-dpo-uncensored-4bit"),
            type: .llm),
    ]

    private let cacheLock = NSLock()
    private var containerCache: [String: ModelContainer] = [:]
    private var metadataCache: [String: ModelLoadRecord] = [:]

    /// Loads a model into memory with progress tracking.
    ///
    /// - Parameters:
    ///   - name: Model identifier
    ///   - progressHandler: Optional closure receiving progress (0.0-1.0)
    /// - Returns: Load summary with model metadata
    /// - Throws: `NativeAIError.modelNotFound` if model doesn't exist
    func loadModel(
        named name: String,
        progressHandler: (@Sendable (Double) -> Void)? = nil
    ) async throws -> ModelLoadSummary {
        let model = try model(named: name)

        if let cached = cachedContainer(for: model.name) {
            let summary = ModelLoadSummary(model: model, container: cached, wasAlreadyLoaded: true, record: metadataCache[model.name])
            progressHandler?(1.0)
            return summary
        }

        let container = try await load(model: model, progressHandler: progressHandler)

        if let existing = metadataCache[model.name] {
            return ModelLoadSummary(model: model, container: container, wasAlreadyLoaded: false, record: existing)
        }

        let record = ModelLoadRecord(model: model, container: container, loadedAt: Date())
        store(container: container, record: record, for: model.name)
        return ModelLoadSummary(model: model, container: container, wasAlreadyLoaded: false, record: record)
    }

    /// Unloads a model from memory.
    ///
    /// - Parameter name: Model identifier
    /// - Returns: True if model was loaded and successfully unloaded
    func unloadModel(named name: String) -> Bool {
        cacheLock.lock()
        defer { cacheLock.unlock() }
        metadataCache.removeValue(forKey: name)
        return containerCache.removeValue(forKey: name) != nil
    }

    /// Checks if a model is currently loaded.
    ///
    /// - Parameter name: Model identifier
    /// - Returns: True if model has active container
    func isModelLoaded(_ name: String) -> Bool {
        cacheLock.lock()
        defer { cacheLock.unlock() }
        return containerCache[name] != nil
    }

    /// Returns serializable summaries for all loaded models.
    ///
    /// - Returns: Array of dictionary representations
    func loadedModelSummaries() -> [[String: Any]] {
        cacheLock.lock()
        defer { cacheLock.unlock() }
        return metadataCache.values.map { $0.summaryDictionary }
    }

    /// Executes streaming text generation.
    ///
    /// - Parameters:
    ///   - messages: Conversation history
    ///   - modelName: Model to use for generation
    ///   - generationParameters: Temperature, max tokens, etc.
    /// - Returns: Async stream of generation events
    /// - Throws: Model loading or generation errors
    func generate(
        messages: [ChatMessage],
        modelName: String,
        generationParameters: GenerateParameters
    ) async throws -> AsyncStream<Generation> {
        let model = try model(named: modelName)
        let container = try await load(model: model)
        let chatMessages = messages.map { $0.toChatMessage() }
        let userInput = UserInput(
            chat: chatMessages,
            processing: .init(resize: .init(width: 1024, height: 1024))
        )

        return try await container.perform { (context: ModelContext) in
            let preparedInput = try await context.processor.prepare(input: userInput)
            return try MLXLMCommon.generate(
                input: preparedInput,
                parameters: generationParameters,
                context: context
            )
        }
    }

    func clearDownloadProgress() async {}

    // MARK: - Private Methods

    private func model(named name: String) throws -> LMModel {
        guard let model = availableModels.first(where: { $0.name == name }) else {
            throw NativeAIError.modelNotFound(name)
        }
        return model
    }

    private func cachedContainer(for name: String) -> ModelContainer? {
        cacheLock.lock()
        defer { cacheLock.unlock() }
        return containerCache[name]
    }

    private func store(container: ModelContainer, record: ModelLoadRecord, for name: String) {
        cacheLock.lock()
        containerCache[name] = container
        metadataCache[name] = record
        cacheLock.unlock()
    }

    private func load(
        model: LMModel,
        progressHandler: (@Sendable (Double) -> Void)? = nil
    ) async throws -> ModelContainer {
        if let cached = cachedContainer(for: model.name) {
            return cached
        }

        let factory: ModelFactory = {
            switch model.type {
            case .llm:
                return LLMModelFactory.shared
            case .vlm:
                return VLMModelFactory.shared
            }
        }()

        let container: ModelContainer = try await Device.withDefaultDevice(.cpu) {
            try await factory.loadContainer(
                hub: .default,
                configuration: model.configuration
            ) { progress in
                progressHandler?(progress.fractionCompleted)
            }
        }

        store(container: container, record: ModelLoadRecord(model: model, container: container, loadedAt: Date()), for: model.name)
        return container
    }
}

// MARK: - Model Metadata

/// Internal tracking record for loaded models.
@available(iOS 16.0, *)
struct ModelLoadRecord {
    let model: LMModel
    let container: ModelContainer
    let loadedAt: Date

    var summaryDictionary: [String: Any] {
        ModelLoadSummary(model: model, container: container, wasAlreadyLoaded: true, record: self).dictionary
    }
}

/// Serializable summary of a loaded model.
@available(iOS 16.0, *)
struct ModelLoadSummary {
    let model: LMModel
    let container: ModelContainer
    let wasAlreadyLoaded: Bool
    let record: ModelLoadRecord?

    init(model: LMModel, container: ModelContainer, wasAlreadyLoaded: Bool, record: ModelLoadRecord?) {
        self.model = model
        self.container = container
        self.wasAlreadyLoaded = wasAlreadyLoaded
        self.record = record
    }

    var dictionary: [String: Any] {
        var info = model.toDictionary()
        info["status"] = wasAlreadyLoaded ? "already_loaded" : "loaded"
        info["loadedAt"] = record?.loadedAt.timeIntervalSince1970 ?? Date().timeIntervalSince1970

        let configurationDetails = model.configuration.details
        info["huggingFaceId"] = configurationDetails.id
        info["revision"] = configurationDetails.revision
        info["cacheDirectory"] = configurationDetails.cacheDirectory
        return info
    }
}

// MARK: - LMModel Helpers

/// Describes a model configuration.
@available(iOS 16.0, *)
struct LMModel {
    let name: String
    let configuration: ModelConfiguration
    let type: ModelType

    enum ModelType: String {
        case llm
        case vlm
    }

    func toDictionary() -> [String: Any] {
        var configDetails = configuration.details.dictionary
        configDetails["defaultPrompt"] = configuration.defaultPrompt
        return [
            "name": name,
            "displayName": name,
            "type": type.rawValue,
            "configuration": configDetails
        ]
    }
}

@available(iOS 16.0, *)
private extension ModelConfiguration {
    struct Details {
        let id: String?
        let revision: String?
        let cacheDirectory: String?

        var dictionary: [String: Any] {
            var dict: [String: Any] = [:]
            if let id { dict["id"] = id }
            if let revision { dict["revision"] = revision }
            if let cacheDirectory { dict["cacheDirectory"] = cacheDirectory }
            return dict
        }
    }

    var details: Details {
        switch id {
        case .id(let repoId, let revision):
            let cacheDir = HubApi.default.localRepoLocation(Hub.Repo(id: repoId)).path
            return Details(id: repoId, revision: revision, cacheDirectory: cacheDir)
        case .directory(let url):
            return Details(id: url.lastPathComponent, revision: nil, cacheDirectory: url.path)
        }
    }
}

// MARK: - Hub Convenience

@available(iOS 16.0, *)
private extension HubApi {
    static let `default`: HubApi = {
        #if os(macOS)
            HubApi(downloadBase: URL.downloadsDirectory.appending(path: "huggingface"))
        #else
            HubApi(downloadBase: URL.cachesDirectory.appending(path: "huggingface"))
        #endif
    }()
}

@available(iOS 16.0, *)
private extension URL {
    static var cachesDirectory: URL {
        FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0]
    }

    #if os(macOS)
        static var downloadsDirectory: URL {
            FileManager.default.urls(for: .downloadsDirectory, in: .userDomainMask)[0]
        }
    #endif
}
