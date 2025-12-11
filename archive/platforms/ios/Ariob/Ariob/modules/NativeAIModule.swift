import Foundation
import Darwin
import Hub
import MLX
import MLXLLM
import MLXLMCommon
import MLXVLM
import UIKit

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
            "loadModelWithConfig": NSStringFromSelector(#selector(loadModelWithConfig(_:callback:))),
            "registerModel": NSStringFromSelector(#selector(registerModel(_:))),
            "unregisterModel": NSStringFromSelector(#selector(unregisterModel(_:))),
            "listRegisteredModels": NSStringFromSelector(#selector(listRegisteredModels)),
            "unloadModel": NSStringFromSelector(#selector(unloadModel(_:))),
            "generateChat": NSStringFromSelector(#selector(generateChat(_:callback:))),
            "generateWithImage": NSStringFromSelector(#selector(generateWithImage(_:callback:))),
            "countTokens": NSStringFromSelector(#selector(countTokens(_:callback:))),
            "encodeText": NSStringFromSelector(#selector(encodeText(_:callback:))),
            "decodeTokens": NSStringFromSelector(#selector(decodeTokens(_:callback:))),
            "downloadModel": NSStringFromSelector(#selector(downloadModel(_:callback:))),
            "pauseModelDownload": NSStringFromSelector(#selector(pauseModelDownload(_:))),
            "resumeModelDownload": NSStringFromSelector(#selector(resumeModelDownload(_:))),
            "cancelModelDownload": NSStringFromSelector(#selector(cancelModelDownload(_:))),
            "deleteModelCache": NSStringFromSelector(#selector(deleteModelCache(_:))),
            "getModelSize": NSStringFromSelector(#selector(getModelSize(_:))),
            "checkModelUpdate": NSStringFromSelector(#selector(checkModelUpdate(_:)))
        ]
    }

    // MARK: - Properties

    private let chatService: MLXChatService
    private let eventEmitter: NativeAIEventEmitter
    private let downloadManager: ModelDownloadManager

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
    @objc public override init() {
        _ = Self.runtimeBootstrap
        self.chatService = MLXChatService()
        self.eventEmitter = NativeAIEventEmitter(context: nil)
        self.downloadManager = ModelDownloadManager()
        super.init()
        self.downloadManager.setEventEmitter(self.eventEmitter)
    }

    /// Primary Lynx entry point with runtime context.
    ///
    /// - Parameter lynxContext: Runtime context used to emit global events
    @objc public required init(lynxContext: LynxContext) {
        _ = Self.runtimeBootstrap
        self.chatService = MLXChatService()
        self.eventEmitter = NativeAIEventEmitter(context: lynxContext)
        self.downloadManager = ModelDownloadManager()
        super.init()
        self.downloadManager.setEventEmitter(self.eventEmitter)
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
        self.downloadManager = ModelDownloadManager()
        super.init()
        self.downloadManager.setEventEmitter(self.eventEmitter)
    }

    /// Legacy initializer for backward compatibility when no context is supplied.
    ///
    /// - Parameter param: Configuration payload (currently unused)
    @objc public init(param: Any) {
        _ = Self.runtimeBootstrap
        self.chatService = MLXChatService()
        self.eventEmitter = NativeAIEventEmitter(context: nil)
        self.downloadManager = ModelDownloadManager()
        super.init()
        self.downloadManager.setEventEmitter(self.eventEmitter)
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
                    "model": request.modelName,
                    "state": "loading",
                    "percentage": 0,
                    "message": "Starting model load..."
                ])

                let summary = try await chatService.loadModel(
                    named: request.modelName
                ) { progress in
                    let percentage = max(0, min(100, progress * 100.0))
                    let isDownloading = percentage < 100
                    let message = isDownloading
                        ? String(format: "Downloading model files... %.0f%%", percentage)
                        : "Loading model into memory..."

                    eventEmitter.emitModelEvent([
                        "type": "download_progress",
                        "model": request.modelName,
                        "state": "loading",
                        "progress": progress,
                        "percentage": percentage,
                        "message": message,
                        "phase": isDownloading ? "downloading" : "loading"
                    ])
                }

                let response = NativeAIModule.successJSON(summary.dictionary)
                eventEmitter.emitModelEvent([
                    "type": "loaded",
                    "model": request.modelName,
                    "state": "loaded",
                    "percentage": 100,
                    "message": "Model ready",
                    "summary": summary.dictionary
                ])
                callbackWrapper.send(json: response)
            } catch let error as NativeAIError {
                var errorEvent: [String: Any] = [
                    "type": "error",
                    "state": "error",
                    "percentage": 0,
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
                    "state": "error",
                    "percentage": 0,
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

    // MARK: - Vision-Language Model (VLM) Support

    /// Generates text using a vision-language model with image input.
    ///
    /// Processes images alongside text prompts to generate contextual responses.
    /// Supports both base64-encoded images and image URLs.
    ///
    /// - Parameters:
    ///   - requestJSON: JSON payload with model, prompt, and images
    ///   - callback: Invoked with generated response
    ///
    /// # Request Format
    /// ```json
    /// {
    ///   "model": "vlm-model-name",
    ///   "prompt": "What's in this image?",
    ///   "images": [
    ///     { "base64": "iVBORw0KGgoAAAANS..." },
    ///     { "url": "https://example.com/image.jpg" }
    ///   ],
    ///   "temperature": 0.7,
    ///   "maxTokens": 256
    /// }
    /// ```
    ///
    /// # Success Response
    /// ```json
    /// {
    ///   "success": true,
    ///   "data": {
    ///     "model": "vlm-model",
    ///     "content": "I see a cat sitting on a chair.",
    ///     "duration": 1.23,
    ///     "imageCount": 2
    ///   }
    /// }
    /// ```
    ///
    /// - Important: Model must be a VLM type, not an LLM
    /// - Note: Images are resized to 1024x1024 for processing
    public func generateWithImage(_ requestJSON: NSString, callback: @escaping (NSString) -> Void) {
        let requestString = requestJSON as String
        let callbackWrapper = NativeAICallback(callback)

        Task(priority: .userInitiated) { [chatService] in
            do {
                let request = try VLMGenerationRequest.parse(jsonString: requestString)

                // Verify model is VLM type
                let model = try chatService.model(named: request.modelName)
                guard model.type == .vlm else {
                    throw NativeAIError.invalidRequest("Model '\(request.modelName)' is not a vision-language model")
                }

                // Convert image inputs to UIImage
                var images: [UIImage] = []
                for imageInput in request.images {
                    if let uiImage = imageInput.toUIImage() {
                        images.append(uiImage)
                    } else {
                        throw NativeAIError.invalidRequest("Failed to load image from provided data")
                    }
                }

                guard !images.isEmpty else {
                    throw NativeAIError.invalidRequest("At least one valid image is required")
                }

                let startTime = Date()

                // Load model if not already loaded
                let container = try await chatService.load(model: model)

                // Create user input with images
                // Convert UIImage to CIImage for MLX processing
                let userInput = UserInput(
                    prompt: .text(request.prompt),
                    images: images.compactMap { uiImage -> UserInput.Image? in
                        guard let ciImage = CIImage(image: uiImage) else { return nil }
                        return .ciImage(ciImage)
                    },
                    processing: .init(resize: .init(width: 1024, height: 1024))
                )

                // Generate with VLM
                // Create parameters as an immutable value to avoid concurrency issues
                let params: GenerateParameters = {
                    var p = GenerateParameters(temperature: Float(request.temperature ?? 0.7))
                    p.maxTokens = request.maxTokens ?? 256
                    return p
                }()

                let generated = try await container.perform { (context: ModelContext) in
                    let preparedInput = try await context.processor.prepare(input: userInput)

                    var fullText = ""
                    let stream = try MLXLMCommon.generate(
                        input: preparedInput,
                        parameters: params,
                        context: context
                    )

                    for await generation in stream {
                        if case .chunk(let chunk) = generation {
                            fullText.append(chunk)
                        }
                    }

                    return fullText
                }

                let duration = Date().timeIntervalSince(startTime)
                let payload: [String: Any] = [
                    "model": request.modelName,
                    "content": generated.trimmingCharacters(in: .whitespacesAndNewlines),
                    "duration": duration,
                    "imageCount": images.count
                ]

                callbackWrapper.send(json: NativeAIModule.successJSON(payload))
            } catch let error as NativeAIError {
                callbackWrapper.send(json: error.jsonString)
            } catch {
                let runtimeError = NativeAIError.runtime(error.localizedDescription)
                callbackWrapper.send(json: runtimeError.jsonString)
            }
        }
    }

    // MARK: - Token Utilities

    /// Counts the number of tokens in the provided text for a specific model.
    ///
    /// - Parameter requestJSON: JSON payload with model name and text
    /// - Parameter callback: Invoked with token count result
    ///
    /// # Request Format
    /// ```json
    /// {
    ///   "model": "gemma3:2b",
    ///   "text": "Hello, world!"
    /// }
    /// ```
    ///
    /// # Success Response
    /// ```json
    /// {
    ///   "success": true,
    ///   "data": {
    ///     "model": "gemma3:2b",
    ///     "text": "Hello, world!",
    ///     "tokenCount": 5
    ///   }
    /// }
    /// ```
    public func countTokens(_ requestJSON: NSString, callback: @escaping (NSString) -> Void) {
        let requestString = requestJSON as String
        let callbackWrapper = NativeAICallback(callback)

        Task { [chatService] in
            do {
                let request = try TokenCountRequest.parse(jsonString: requestString)

                guard chatService.isModelLoaded(request.modelName) else {
                    callbackWrapper.send(json: NativeAIError.invalidRequest("Model '\(request.modelName)' is not loaded. Load the model first.").jsonString)
                    return
                }

                let model = try chatService.model(named: request.modelName)
                guard let container = chatService.cachedContainer(for: model.name) else {
                    callbackWrapper.send(json: NativeAIError.modelNotFound(request.modelName).jsonString)
                    return
                }

                let tokenCount = try await container.perform { (context: ModelContext) in
                    context.tokenizer.encode(text: request.text).count
                }

                let payload: [String: Any] = [
                    "model": request.modelName,
                    "text": request.text,
                    "tokenCount": tokenCount
                ]

                callbackWrapper.send(json: NativeAIModule.successJSON(payload))
            } catch let error as NativeAIError {
                callbackWrapper.send(json: error.jsonString)
            } catch {
                callbackWrapper.send(json: NativeAIError.runtime(error.localizedDescription).jsonString)
            }
        }
    }

    /// Encodes text into token IDs using the model's tokenizer.
    ///
    /// - Parameter requestJSON: JSON payload with model name and text
    /// - Parameter callback: Invoked with encoded tokens result
    ///
    /// # Request Format
    /// ```json
    /// {
    ///   "model": "gemma3:2b",
    ///   "text": "Hello, world!"
    /// }
    /// ```
    ///
    /// # Success Response
    /// ```json
    /// {
    ///   "success": true,
    ///   "data": {
    ///     "model": "gemma3:2b",
    ///     "text": "Hello, world!",
    ///     "tokens": [15339, 11, 1917, 0]
    ///   }
    /// }
    /// ```
    public func encodeText(_ requestJSON: NSString, callback: @escaping (NSString) -> Void) {
        let requestString = requestJSON as String
        let callbackWrapper = NativeAICallback(callback)

        Task { [chatService] in
            do {
                let request = try TokenEncodeRequest.parse(jsonString: requestString)

                guard chatService.isModelLoaded(request.modelName) else {
                    callbackWrapper.send(json: NativeAIError.invalidRequest("Model '\(request.modelName)' is not loaded. Load the model first.").jsonString)
                    return
                }

                let model = try chatService.model(named: request.modelName)
                guard let container = chatService.cachedContainer(for: model.name) else {
                    callbackWrapper.send(json: NativeAIError.modelNotFound(request.modelName).jsonString)
                    return
                }

                let tokens = try await container.perform { (context: ModelContext) in
                    context.tokenizer.encode(text: request.text)
                }

                let payload: [String: Any] = [
                    "model": request.modelName,
                    "text": request.text,
                    "tokens": tokens
                ]

                callbackWrapper.send(json: NativeAIModule.successJSON(payload))
            } catch let error as NativeAIError {
                callbackWrapper.send(json: error.jsonString)
            } catch {
                callbackWrapper.send(json: NativeAIError.runtime(error.localizedDescription).jsonString)
            }
        }
    }

    /// Decodes token IDs back into text using the model's tokenizer.
    ///
    /// - Parameter requestJSON: JSON payload with model name and token array
    /// - Parameter callback: Invoked with decoded text result
    ///
    /// # Request Format
    /// ```json
    /// {
    ///   "model": "gemma3:2b",
    ///   "tokens": [15339, 11, 1917, 0]
    /// }
    /// ```
    ///
    /// # Success Response
    /// ```json
    /// {
    ///   "success": true,
    ///   "data": {
    ///     "model": "gemma3:2b",
    ///     "tokens": [15339, 11, 1917, 0],
    ///     "text": "Hello, world!"
    ///   }
    /// }
    /// ```
    public func decodeTokens(_ requestJSON: NSString, callback: @escaping (NSString) -> Void) {
        let requestString = requestJSON as String
        let callbackWrapper = NativeAICallback(callback)

        Task { [chatService] in
            do {
                let request = try TokenDecodeRequest.parse(jsonString: requestString)

                guard chatService.isModelLoaded(request.modelName) else {
                    callbackWrapper.send(json: NativeAIError.invalidRequest("Model '\(request.modelName)' is not loaded. Load the model first.").jsonString)
                    return
                }

                let model = try chatService.model(named: request.modelName)
                guard let container = chatService.cachedContainer(for: model.name) else {
                    callbackWrapper.send(json: NativeAIError.modelNotFound(request.modelName).jsonString)
                    return
                }

                let text = try await container.perform { (context: ModelContext) in
                    context.tokenizer.decode(tokens: request.tokens)
                }

                let payload: [String: Any] = [
                    "model": request.modelName,
                    "tokens": request.tokens,
                    "text": text
                ]

                callbackWrapper.send(json: NativeAIModule.successJSON(payload))
            } catch let error as NativeAIError {
                callbackWrapper.send(json: error.jsonString)
            } catch {
                callbackWrapper.send(json: NativeAIError.runtime(error.localizedDescription).jsonString)
            }
        }
    }

    // MARK: - Advanced Model Management

    /// Downloads a model with progress tracking.
    ///
    /// Initiates background download of model files from Hugging Face.
    /// Emits progress events throughout the download.
    ///
    /// - Parameters:
    ///   - requestJSON: JSON payload with model name
    ///   - callback: Invoked with download completion status
    ///
    /// # Request Format
    /// ```json
    /// {
    ///   "model": "gemma3:2b"
    /// }
    /// ```
    ///
    /// # Progress Events
    /// Emits `native_ai:model` events:
    /// - `download_started`: Download initiated
    /// - `download_progress`: Progress updates with percentage
    /// - `download_complete`: Download finished
    /// - `download_error`: Download failed
    ///
    /// # Success Response
    /// ```json
    /// {
    ///   "success": true,
    ///   "data": {
    ///     "model": "gemma3:2b",
    ///     "status": "downloaded"
    ///   }
    /// }
    /// ```
    public func downloadModel(_ requestJSON: NSString, callback: @escaping (NSString) -> Void) {
        let requestString = requestJSON as String
        print("[NativeAIModule.downloadModel] Received request:", requestString)
        let callbackWrapper = NativeAICallback(callback)

        Task(priority: .userInitiated) { [chatService, downloadManager, eventEmitter] in
            do {
                print("[NativeAIModule.downloadModel] Parsing request...")
                let request = try ModelDownloadRequest.parse(jsonString: requestString)
                print("[NativeAIModule.downloadModel] Parsed model name:", request.modelName)

                print("[NativeAIModule.downloadModel] Looking up model in registry...")
                let model = try chatService.model(named: request.modelName)
                print("[NativeAIModule.downloadModel] Found model:", model.name)

                print("[NativeAIModule.downloadModel] Emitting download_started event")
                eventEmitter.emitModelEvent([
                    "type": "download_started",
                    "model": request.modelName
                ])

                print("[NativeAIModule.downloadModel] Starting download...")
                try await downloadManager.downloadModel(
                    model: model,
                    hub: .default
                )
                print("[NativeAIModule.downloadModel] Download complete")

                eventEmitter.emitModelEvent([
                    "type": "download_complete",
                    "model": request.modelName
                ])

                let payload: [String: Any] = [
                    "model": request.modelName,
                    "status": "downloaded"
                ]
                print("[NativeAIModule.downloadModel] Sending success callback")
                callbackWrapper.send(json: NativeAIModule.successJSON(payload))
            } catch let error as NativeAIError {
                print("[NativeAIModule.downloadModel] NativeAIError:", error.message)
                eventEmitter.emitModelEvent([
                    "type": "download_error",
                    "model": error.relatedModel ?? "unknown",
                    "message": error.message
                ])
                callbackWrapper.send(json: error.jsonString)
            } catch {
                print("[NativeAIModule.downloadModel] Unexpected error:", error.localizedDescription)
                let runtimeError = NativeAIError.runtime(error.localizedDescription)
                eventEmitter.emitModelEvent([
                    "type": "download_error",
                    "message": error.localizedDescription
                ])
                callbackWrapper.send(json: runtimeError.jsonString)
            }
        }
    }

    /// Pauses an active model download.
    ///
    /// - Parameter modelName: Model identifier
    /// - Returns: JSON string indicating success or failure
    ///
    /// # Success Response
    /// ```json
    /// {
    ///   "success": true,
    ///   "data": {
    ///     "model": "gemma3:2b",
    ///     "status": "paused"
    ///   }
    /// }
    /// ```
    public func pauseModelDownload(_ modelName: NSString) -> NSString {
        let name = (modelName as String).trimmingCharacters(in: .whitespacesAndNewlines)
        guard !name.isEmpty else {
            return NativeAIError.invalidRequest("Model name cannot be empty").jsonString as NSString
        }

        let paused = downloadManager.pauseDownload(for: name)
        guard paused else {
            return NativeAIError.invalidRequest("No active download found for model '\(name)'").jsonString as NSString
        }

        let payload: [String: Any] = [
            "model": name,
            "status": "paused"
        ]
        return NativeAIModule.successJSON(payload) as NSString
    }

    /// Resumes a paused model download.
    ///
    /// - Parameter modelName: Model identifier
    /// - Returns: JSON string indicating success or failure
    ///
    /// # Success Response
    /// ```json
    /// {
    ///   "success": true,
    ///   "data": {
    ///     "model": "gemma3:2b",
    ///     "status": "resumed"
    ///   }
    /// }
    /// ```
    public func resumeModelDownload(_ modelName: NSString) -> NSString {
        let name = (modelName as String).trimmingCharacters(in: .whitespacesAndNewlines)
        guard !name.isEmpty else {
            return NativeAIError.invalidRequest("Model name cannot be empty").jsonString as NSString
        }

        let resumed = downloadManager.resumeDownload(for: name)
        guard resumed else {
            return NativeAIError.invalidRequest("No paused download found for model '\(name)'").jsonString as NSString
        }

        let payload: [String: Any] = [
            "model": name,
            "status": "resumed"
        ]
        return NativeAIModule.successJSON(payload) as NSString
    }

    /// Cancels an active or paused model download.
    ///
    /// - Parameter modelName: Model identifier
    /// - Returns: JSON string indicating success or failure
    ///
    /// # Success Response
    /// ```json
    /// {
    ///   "success": true,
    ///   "data": {
    ///     "model": "gemma3:2b",
    ///     "status": "cancelled"
    ///   }
    /// }
    /// ```
    public func cancelModelDownload(_ modelName: NSString) -> NSString {
        let name = (modelName as String).trimmingCharacters(in: .whitespacesAndNewlines)
        guard !name.isEmpty else {
            return NativeAIError.invalidRequest("Model name cannot be empty").jsonString as NSString
        }

        let cancelled = downloadManager.cancelDownload(for: name)
        guard cancelled else {
            return NativeAIError.invalidRequest("No active download found for model '\(name)'").jsonString as NSString
        }

        let payload: [String: Any] = [
            "model": name,
            "status": "cancelled"
        ]
        return NativeAIModule.successJSON(payload) as NSString
    }

    /// Deletes cached model files from disk.
    ///
    /// - Parameter modelName: Model identifier
    /// - Returns: JSON string indicating success or failure
    ///
    /// # Success Response
    /// ```json
    /// {
    ///   "success": true,
    ///   "data": {
    ///     "model": "gemma3:2b",
    ///     "status": "deleted",
    ///     "freedSpace": 1234567890
    ///   }
    /// }
    /// ```
    public func deleteModelCache(_ modelName: NSString) -> NSString {
        let name = (modelName as String).trimmingCharacters(in: .whitespacesAndNewlines)
        guard !name.isEmpty else {
            return NativeAIError.invalidRequest("Model name cannot be empty").jsonString as NSString
        }

        do {
            let model = try chatService.model(named: name)

            // Unload model first if loaded
            _ = chatService.unloadModel(named: name)

            // Get cache directory and calculate size
            let cacheDir = model.configuration.details.cacheDirectory
            guard let cachePath = cacheDir else {
                return NativeAIError.invalidRequest("Model cache directory not found").jsonString as NSString
            }

            let cacheURL = URL(fileURLWithPath: cachePath)
            let fileManager = FileManager.default

            var freedSpace: Int64 = 0
            if fileManager.fileExists(atPath: cachePath) {
                freedSpace = Self.calculateDirectorySize(at: cacheURL)
                try fileManager.removeItem(at: cacheURL)
            }

            let payload: [String: Any] = [
                "model": name,
                "status": "deleted",
                "freedSpace": freedSpace
            ]
            return NativeAIModule.successJSON(payload) as NSString
        } catch let error as NativeAIError {
            return error.jsonString as NSString
        } catch {
            return NativeAIError.runtime(error.localizedDescription).jsonString as NSString
        }
    }

    /// Gets the disk space used by a model's cached files.
    ///
    /// - Parameter modelName: Model identifier
    /// - Returns: JSON string with size information
    ///
    /// # Success Response
    /// ```json
    /// {
    ///   "success": true,
    ///   "data": {
    ///     "model": "gemma3:2b",
    ///     "sizeBytes": 1234567890,
    ///     "sizeMB": 1177.38,
    ///     "sizeGB": 1.15,
    ///     "cached": true
    ///   }
    /// }
    /// ```
    public func getModelSize(_ modelName: NSString) -> NSString {
        let name = (modelName as String).trimmingCharacters(in: .whitespacesAndNewlines)
        guard !name.isEmpty else {
            return NativeAIError.invalidRequest("Model name cannot be empty").jsonString as NSString
        }

        do {
            let model = try chatService.model(named: name)
            let cacheDir = model.configuration.details.cacheDirectory

            guard let cachePath = cacheDir else {
                let payload: [String: Any] = [
                    "model": name,
                    "sizeBytes": 0,
                    "sizeMB": 0.0,
                    "sizeGB": 0.0,
                    "cached": false
                ]
                return NativeAIModule.successJSON(payload) as NSString
            }

            let cacheURL = URL(fileURLWithPath: cachePath)
            let fileManager = FileManager.default

            let cached = fileManager.fileExists(atPath: cachePath)
            let sizeBytes = cached ? Self.calculateDirectorySize(at: cacheURL) : 0
            let sizeMB = Double(sizeBytes) / 1_048_576.0
            let sizeGB = Double(sizeBytes) / 1_073_741_824.0

            let payload: [String: Any] = [
                "model": name,
                "sizeBytes": sizeBytes,
                "sizeMB": sizeMB,
                "sizeGB": sizeGB,
                "cached": cached
            ]
            return NativeAIModule.successJSON(payload) as NSString
        } catch let error as NativeAIError {
            return error.jsonString as NSString
        } catch {
            return NativeAIError.runtime(error.localizedDescription).jsonString as NSString
        }
    }

    /// Checks if a newer version of the model is available.
    ///
    /// - Parameter modelName: Model identifier
    /// - Returns: JSON string with update information
    ///
    /// # Success Response
    /// ```json
    /// {
    ///   "success": true,
    ///   "data": {
    ///     "model": "gemma3:2b",
    ///     "currentRevision": "abc123",
    ///     "updateAvailable": false
    ///   }
    /// }
    /// ```
    public func checkModelUpdate(_ modelName: NSString) -> NSString {
        let name = (modelName as String).trimmingCharacters(in: .whitespacesAndNewlines)
        guard !name.isEmpty else {
            return NativeAIError.invalidRequest("Model name cannot be empty").jsonString as NSString
        }

        do {
            let model = try chatService.model(named: name)
            let currentRevision = model.configuration.details.revision ?? "main"

            // Note: Actual update checking would require querying Hugging Face API
            // For now, we return current revision info
            let payload: [String: Any] = [
                "model": name,
                "currentRevision": currentRevision,
                "updateAvailable": false
            ]
            return NativeAIModule.successJSON(payload) as NSString
        } catch let error as NativeAIError {
            return error.jsonString as NSString
        } catch {
            return NativeAIError.runtime(error.localizedDescription).jsonString as NSString
        }
    }

    // MARK: - Dynamic Model Registration

    /// Registers a new model configuration dynamically from TypeScript.
    ///
    /// This method allows TypeScript/JavaScript code to register models at runtime
    /// without requiring Swift code changes or recompilation. Registered models
    /// are stored in memory and can be loaded like built-in models.
    ///
    /// - Parameter requestJSON: JSON payload with model configuration
    /// - Returns: JSON string indicating success or failure
    ///
    /// # Request Format
    /// ```json
    /// {
    ///   "name": "My Custom Model",
    ///   "modelId": "mlx-community/Llama-3.2-1B-Instruct-4bit",
    ///   "type": "llm",
    ///   "revision": "main",
    ///   "extraEOSTokens": ["</s>"],
    ///   "defaultPrompt": "You are a helpful assistant",
    ///   "tokenizerId": "optional-tokenizer-id",
    ///   "overrideTokenizer": "PreTrainedTokenizer"
    /// }
    /// ```
    ///
    /// # Success Response
    /// ```json
    /// {
    ///   "success": true,
    ///   "data": {
    ///     "name": "My Custom Model",
    ///     "status": "registered",
    ///     "configuration": { ... }
    ///   }
    /// }
    /// ```
    ///
    /// # Error Response
    /// ```json
    /// {
    ///   "success": false,
    ///   "message": "Model with name 'My Custom Model' is already registered"
    /// }
    /// ```
    ///
    /// - Important: Model name must be unique across both built-in and registered models
    /// - Note: Registered models persist only in memory and are lost on app restart
    public func registerModel(_ requestJSON: NSString) -> NSString {
        let requestString = requestJSON as String

        do {
            let request = try ModelConfigurationRequest.parse(jsonString: requestString)
            let lmModel = request.toLMModel()

            // Check if model already exists (either built-in or registered)
            if (try? chatService.model(named: lmModel.name)) != nil {
                return NativeAIError.invalidRequest("Model with name '\(lmModel.name)' is already registered or exists as a built-in model").jsonString as NSString
            }

            // Register the model
            chatService.registerModel(lmModel)

            let payload: [String: Any] = [
                "name": lmModel.name,
                "status": "registered",
                "configuration": lmModel.toDictionary()
            ]
            return NativeAIModule.successJSON(payload) as NSString
        } catch let error as NativeAIError {
            return error.jsonString as NSString
        } catch {
            return NativeAIError.runtime(error.localizedDescription).jsonString as NSString
        }
    }

    /// Unregisters a dynamically registered model.
    ///
    /// Removes a model from the dynamic registry. Built-in models cannot be unregistered.
    /// If the model is currently loaded, it will be unloaded first.
    ///
    /// - Parameter modelName: Name of the model to unregister
    /// - Returns: JSON string indicating success or failure
    ///
    /// # Success Response
    /// ```json
    /// {
    ///   "success": true,
    ///   "data": {
    ///     "model": "My Custom Model",
    ///     "status": "unregistered"
    ///   }
    /// }
    /// ```
    ///
    /// # Error Response
    /// ```json
    /// {
    ///   "success": false,
    ///   "message": "Model 'My Custom Model' is not registered or is a built-in model"
    /// }
    /// ```
    public func unregisterModel(_ modelName: NSString) -> NSString {
        let name = (modelName as String).trimmingCharacters(in: .whitespacesAndNewlines)
        guard !name.isEmpty else {
            return NativeAIError.invalidRequest("Model name cannot be empty").jsonString as NSString
        }

        // Unload first if loaded
        _ = chatService.unloadModel(named: name)

        let unregistered = chatService.unregisterModel(named: name)
        guard unregistered else {
            return NativeAIError.invalidRequest("Model '\(name)' is not registered or is a built-in model").jsonString as NSString
        }

        let payload: [String: Any] = [
            "model": name,
            "status": "unregistered"
        ]
        return NativeAIModule.successJSON(payload) as NSString
    }

    /// Lists all dynamically registered models.
    ///
    /// Returns metadata for models that were registered at runtime via `registerModel`.
    /// Does not include built-in models (use `listAvailableModels` for all models).
    ///
    /// - Returns: JSON string with array of registered models
    ///
    /// # Success Response
    /// ```json
    /// {
    ///   "success": true,
    ///   "data": {
    ///     "models": [
    ///       {
    ///         "name": "My Custom Model",
    ///         "type": "llm",
    ///         "configuration": { ... }
    ///       }
    ///     ]
    ///   }
    /// }
    /// ```
    public func listRegisteredModels() -> NSString {
        let models = chatService.registeredModels.map { $0.toDictionary() }
        let payload: [String: Any] = [
            "models": models
        ]
        return NativeAIModule.successJSON(payload) as NSString
    }

    /// Loads a model with inline configuration (without pre-registration).
    ///
    /// This method allows loading a model by providing its full configuration
    /// in the request, bypassing the need to call `registerModel` first.
    /// Useful for one-off model loads or testing.
    ///
    /// - Parameters:
    ///   - requestJSON: JSON payload with model configuration
    ///   - callback: Invoked with load completion status
    ///
    /// # Request Format
    /// ```json
    /// {
    ///   "name": "Temporary Model",
    ///   "modelId": "mlx-community/model-repo",
    ///   "type": "llm",
    ///   "revision": "main",
    ///   "extraEOSTokens": ["</s>"],
    ///   "defaultPrompt": "Hello"
    /// }
    /// ```
    ///
    /// # Success Response
    /// ```json
    /// {
    ///   "success": true,
    ///   "data": {
    ///     "name": "Temporary Model",
    ///     "status": "loaded",
    ///     "loadedAt": 1704067200,
    ///     ...
    ///   }
    /// }
    /// ```
    ///
    /// # Progress Events
    /// Emits `native_ai:model` events during loading:
    /// - `loading_started`: Load initiated
    /// - `download_progress`: Download progress (0-100%)
    /// - `loaded`: Model successfully loaded
    /// - `error`: Load failed
    ///
    /// - Important: Model is automatically registered if not already present
    /// - Note: Runs on `.userInitiated` priority background thread
    public func loadModelWithConfig(_ requestJSON: NSString, callback: @escaping (NSString) -> Void) {
        let requestString = requestJSON as String
        let callbackWrapper = NativeAICallback(callback)

        Task(priority: .userInitiated) { [chatService, eventEmitter] in
            do {
                let request = try ModelConfigurationRequest.parse(jsonString: requestString)
                let lmModel = request.toLMModel()

                // Register model if not already present
                if (try? chatService.model(named: lmModel.name)) == nil {
                    chatService.registerModel(lmModel)
                }

                eventEmitter.emitModelEvent([
                    "type": "loading_started",
                    "model": lmModel.name,
                    "state": "loading",
                    "percentage": 0,
                    "message": "Starting model load..."
                ])

                let summary = try await chatService.loadModel(
                    named: lmModel.name
                ) { progress in
                    let percentage = max(0, min(100, progress * 100.0))
                    let isDownloading = percentage < 100
                    let message = isDownloading
                        ? String(format: "Downloading model files... %.0f%%", percentage)
                        : "Loading model into memory..."

                    eventEmitter.emitModelEvent([
                        "type": "download_progress",
                        "model": lmModel.name,
                        "state": "loading",
                        "progress": progress,
                        "percentage": percentage,
                        "message": message,
                        "phase": isDownloading ? "downloading" : "loading"
                    ])
                }

                let response = NativeAIModule.successJSON(summary.dictionary)
                eventEmitter.emitModelEvent([
                    "type": "loaded",
                    "model": lmModel.name,
                    "state": "loaded",
                    "percentage": 100,
                    "message": "Model ready",
                    "summary": summary.dictionary
                ])
                callbackWrapper.send(json: response)
            } catch let error as NativeAIError {
                var errorEvent: [String: Any] = [
                    "type": "error",
                    "state": "error",
                    "percentage": 0,
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
                    "state": "error",
                    "percentage": 0,
                    "message": error.localizedDescription
                ])
                callbackWrapper.send(json: runtimeError.jsonString)
            }
        }
    }

    // MARK: - Helper Methods

    /// Calculates total size of a directory and its contents.
    ///
    /// - Parameter url: Directory URL to measure
    /// - Returns: Total size in bytes
    private static func calculateDirectorySize(at url: URL) -> Int64 {
        let fileManager = FileManager.default
        var totalSize: Int64 = 0

        guard let enumerator = fileManager.enumerator(
            at: url,
            includingPropertiesForKeys: [.fileSizeKey, .isRegularFileKey]
        ) else {
            return 0
        }

        for case let fileURL as URL in enumerator {
            guard let resourceValues = try? fileURL.resourceValues(forKeys: [.isRegularFileKey, .fileSizeKey]),
                  let isRegularFile = resourceValues.isRegularFile,
                  isRegularFile,
                  let fileSize = resourceValues.fileSize else {
                continue
            }
            totalSize += Int64(fileSize)
        }

        return totalSize
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

/// VLM generation request with image support.
@available(iOS 16.0, *)
private struct VLMGenerationRequest {
    let modelName: String
    let prompt: String
    let images: [ImageInput]
    let temperature: Double?
    let maxTokens: Int?

    /// Parses JSON string into VLM generation request.
    ///
    /// - Parameter jsonString: JSON with model, prompt, images, and optional parameters
    /// - Returns: Parsed request
    /// - Throws: `NativeAIError` if parsing fails
    static func parse(jsonString: String) throws -> VLMGenerationRequest {
        guard let data = jsonString.data(using: .utf8),
              let root = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw NativeAIError.invalidJSON
        }

        guard let modelName = (root["model"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines),
              !modelName.isEmpty else {
            throw NativeAIError.invalidRequest("Missing or empty model field")
        }

        guard let prompt = root["prompt"] as? String, !prompt.isEmpty else {
            throw NativeAIError.invalidRequest("Missing or empty prompt field")
        }

        guard let imagesArray = root["images"] as? [[String: Any]], !imagesArray.isEmpty else {
            throw NativeAIError.invalidRequest("Missing images array")
        }

        let images = try imagesArray.map { imageDict -> ImageInput in
            if let base64String = imageDict["base64"] as? String {
                return .base64(base64String)
            } else if let urlString = imageDict["url"] as? String {
                return .url(urlString)
            } else {
                throw NativeAIError.invalidRequest("Each image must have either 'base64' or 'url' field")
            }
        }

        let temperature = root["temperature"] as? Double
        let maxTokens = root["maxTokens"] as? Int

        return VLMGenerationRequest(
            modelName: modelName,
            prompt: prompt,
            images: images,
            temperature: temperature,
            maxTokens: maxTokens
        )
    }
}

/// Image input format for VLM requests.
@available(iOS 16.0, *)
private enum ImageInput {
    case base64(String)
    case url(String)

    /// Converts image input to UIImage.
    ///
    /// - Returns: UIImage if conversion succeeds, nil otherwise
    func toUIImage() -> UIImage? {
        switch self {
        case .base64(let base64String):
            guard let imageData = Data(base64Encoded: base64String) else {
                return nil
            }
            return UIImage(data: imageData)
        case .url(let urlString):
            guard let url = URL(string: urlString),
                  let imageData = try? Data(contentsOf: url) else {
                return nil
            }
            return UIImage(data: imageData)
        }
    }
}

/// Token count request payload.
@available(iOS 16.0, *)
private struct TokenCountRequest {
    let modelName: String
    let text: String

    static func parse(jsonString: String) throws -> TokenCountRequest {
        guard let data = jsonString.data(using: .utf8),
              let root = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw NativeAIError.invalidJSON
        }

        guard let modelName = (root["model"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines),
              !modelName.isEmpty else {
            throw NativeAIError.invalidRequest("Missing or empty model field")
        }

        guard let text = root["text"] as? String else {
            throw NativeAIError.invalidRequest("Missing text field")
        }

        return TokenCountRequest(modelName: modelName, text: text)
    }
}

/// Token encode request payload.
@available(iOS 16.0, *)
private struct TokenEncodeRequest {
    let modelName: String
    let text: String

    static func parse(jsonString: String) throws -> TokenEncodeRequest {
        guard let data = jsonString.data(using: .utf8),
              let root = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw NativeAIError.invalidJSON
        }

        guard let modelName = (root["model"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines),
              !modelName.isEmpty else {
            throw NativeAIError.invalidRequest("Missing or empty model field")
        }

        guard let text = root["text"] as? String else {
            throw NativeAIError.invalidRequest("Missing text field")
        }

        return TokenEncodeRequest(modelName: modelName, text: text)
    }
}

/// Token decode request payload.
@available(iOS 16.0, *)
private struct TokenDecodeRequest {
    let modelName: String
    let tokens: [Int]

    static func parse(jsonString: String) throws -> TokenDecodeRequest {
        guard let data = jsonString.data(using: .utf8),
              let root = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw NativeAIError.invalidJSON
        }

        guard let modelName = (root["model"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines),
              !modelName.isEmpty else {
            throw NativeAIError.invalidRequest("Missing or empty model field")
        }

        guard let tokens = root["tokens"] as? [Int] else {
            throw NativeAIError.invalidRequest("Missing tokens array")
        }

        return TokenDecodeRequest(modelName: modelName, tokens: tokens)
    }
}

/// Model download request payload.
@available(iOS 16.0, *)
private struct ModelDownloadRequest {
    let modelName: String

    static func parse(jsonString: String) throws -> ModelDownloadRequest {
        guard let data = jsonString.data(using: .utf8),
              let root = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw NativeAIError.invalidJSON
        }

        guard let modelName = (root["model"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines),
              !modelName.isEmpty else {
            throw NativeAIError.invalidRequest("Missing or empty model field")
        }

        return ModelDownloadRequest(modelName: modelName)
    }
}

/// Model configuration request for dynamic model registration.
///
/// Represents a complete model configuration sent from TypeScript/JavaScript
/// to register a new model dynamically without requiring Swift code changes.
///
/// # Request Format
/// ```json
/// {
///   "name": "Custom Model Name",
///   "modelId": "mlx-community/model-repo-id",
///   "type": "llm",
///   "revision": "main",
///   "extraEOSTokens": ["</s>", "<|endoftext|>"],
///   "defaultPrompt": "You are a helpful assistant",
///   "tokenizerID": "optional-tokenizer-id",
///   "overrideTokenizer": "PreTrainedTokenizer"
/// }
/// ```
@available(iOS 16.0, *)
private struct ModelConfigurationRequest {
    let name: String
    let modelId: String
    let type: LMModel.ModelType
    let revision: String
    let extraEOSTokens: Set<String>
    let defaultPrompt: String
    let tokenizerId: String?
    let overrideTokenizer: String?

    /// Parses JSON string into model configuration request.
    ///
    /// - Parameter jsonString: JSON with model configuration fields
    /// - Returns: Parsed configuration request
    /// - Throws: `NativeAIError` if parsing fails or required fields are missing
    static func parse(jsonString: String) throws -> ModelConfigurationRequest {
        guard let data = jsonString.data(using: .utf8),
              let root = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw NativeAIError.invalidJSON
        }

        // Required: name
        guard let name = (root["name"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines),
              !name.isEmpty else {
            throw NativeAIError.invalidRequest("Missing or empty 'name' field")
        }

        // Required: modelId (HuggingFace repo ID)
        guard let modelId = (root["modelId"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines),
              !modelId.isEmpty else {
            throw NativeAIError.invalidRequest("Missing or empty 'modelId' field")
        }

        // Required: type (llm or vlm)
        guard let typeString = (root["type"] as? String)?.lowercased(),
              let modelType = LMModel.ModelType(rawValue: typeString) else {
            throw NativeAIError.invalidRequest("Invalid or missing 'type' field. Must be 'llm' or 'vlm'")
        }

        // Optional fields with defaults
        let revision = (root["revision"] as? String)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? "main"
        let defaultPrompt = (root["defaultPrompt"] as? String) ?? "Hello"
        let tokenizerId = root["tokenizerId"] as? String
        let overrideTokenizer = root["overrideTokenizer"] as? String

        // Optional: extraEOSTokens array
        var extraEOSTokens = Set<String>()
        if let eosArray = root["extraEOSTokens"] as? [String] {
            extraEOSTokens = Set(eosArray.map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }.filter { !$0.isEmpty })
        }

        return ModelConfigurationRequest(
            name: name,
            modelId: modelId,
            type: modelType,
            revision: revision,
            extraEOSTokens: extraEOSTokens,
            defaultPrompt: defaultPrompt,
            tokenizerId: tokenizerId,
            overrideTokenizer: overrideTokenizer
        )
    }

    /// Converts request to MLX ModelConfiguration.
    ///
    /// - Returns: ModelConfiguration instance ready for MLX loading
    func toModelConfiguration() -> ModelConfiguration {
        return ModelConfiguration(
            id: modelId,
            revision: revision,
            tokenizerId: tokenizerId,
            overrideTokenizer: overrideTokenizer,
            defaultPrompt: defaultPrompt,
            extraEOSTokens: extraEOSTokens
        )
    }

    /// Converts request to LMModel.
    ///
    /// - Returns: LMModel instance for registration
    func toLMModel() -> LMModel {
        return LMModel(
            name: name,
            configuration: toModelConfiguration(),
            type: type
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
    static let defaultModelName: String = "Qwen 3B"

    /// Registry of available models with their configurations.
    let availableModels: [LMModel] = [
        // Ultra-small models (0.5B-1B) - Best for basic tasks
        LMModel(
            name: "Qwen 0.5B",
            configuration: ModelConfiguration(
                id: "mlx-community/Qwen2.5-0.5B-Instruct-4bit"),
            type: .llm),
        LMModel(
            name: "TinyLlama 1.1B",
            configuration: ModelConfiguration(
                id: "mlx-community/JOSIE-TinyLlama-1.1B-32k-base-4bit"),
            type: .llm),

        // Small models (1B-2B) - Balanced performance
        LMModel(
            name: "Qwen 1.5B",
            configuration: ModelConfiguration(
                id: "mlx-community/Qwen2.5-1.5B-Instruct-4bit"),
            type: .llm),
        LMModel(
            name: "DeepSeek 1.5B",
            configuration: ModelConfiguration(
                id: "mlx-community/DeepSeek-R1-Distill-Qwen-1.5B-4bit"),
            type: .llm),
        LMModel(
            name: "Gemma 2B",
            configuration: ModelConfiguration(
                id: "mlx-community/gemma-2-2b-it-4bit"),
            type: .llm),

        // Medium models (3B-4B) - Best quality for mobile
        LMModel(
            name: "Qwen 3B",
            configuration: LLMRegistry.qwen3_0_6b_4bit,
            type: .llm),
        LMModel(
            name: "Qwen 3B Pro",
            configuration: ModelConfiguration(
                id: "mlx-community/Qwen2.5-3B-Instruct-4bit"),
            type: .llm),
        LMModel(
            name: "Llama 3B",
            configuration: ModelConfiguration(
                id: "mlx-community/Llama-3.2-3B-Instruct-4bit"),
            type: .llm),
        LMModel(
            name: "Phi 14B",
            configuration: ModelConfiguration(
                id: "mlx-community/phi-4-4bit"),
            type: .llm),
    ]

    /// Dynamic registry for models registered at runtime from TypeScript.
    ///
    /// This dictionary stores models that are registered via `registerModel()` method,
    /// allowing TypeScript/JavaScript code to add models without Swift recompilation.
    ///
    /// - Important: Access is protected by `registryLock` for thread safety
    /// - Note: Registered models are stored in memory only and cleared on app restart
    private var dynamicRegistry: [String: LMModel] = [:]

    private let cacheLock = NSLock()
    private let registryLock = NSLock()
    private var containerCache: [String: ModelContainer] = [:]
    private var metadataCache: [String: ModelLoadRecord] = [:]

    /// Returns all dynamically registered models.
    ///
    /// - Returns: Array of models registered at runtime
    var registeredModels: [LMModel] {
        registryLock.lock()
        defer { registryLock.unlock() }
        return Array(dynamicRegistry.values)
    }

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

    // MARK: - Dynamic Model Registration

    /// Registers a model dynamically at runtime.
    ///
    /// This method adds a model to the dynamic registry, making it available
    /// for loading via `loadModel()` or other model operations.
    ///
    /// - Parameter model: LMModel instance to register
    ///
    /// - Important: Thread-safe operation protected by `registryLock`
    /// - Note: Model name must be unique (checked by caller)
    func registerModel(_ model: LMModel) {
        registryLock.lock()
        dynamicRegistry[model.name] = model
        registryLock.unlock()
    }

    /// Unregisters a dynamically registered model.
    ///
    /// Removes a model from the dynamic registry. Built-in models in `availableModels`
    /// cannot be unregistered.
    ///
    /// - Parameter name: Name of the model to unregister
    /// - Returns: True if model was unregistered, false if not found or is built-in
    ///
    /// - Important: Thread-safe operation protected by `registryLock`
    func unregisterModel(named name: String) -> Bool {
        registryLock.lock()
        defer { registryLock.unlock() }
        return dynamicRegistry.removeValue(forKey: name) != nil
    }

    // MARK: - Internal Methods (Package-visible)

    /// Retrieves a model by name from both built-in and dynamic registries.
    ///
    /// This method first checks the dynamic registry for runtime-registered models,
    /// then falls back to the built-in `availableModels` array.
    ///
    /// - Parameter name: Model identifier
    /// - Returns: LMModel if found
    /// - Throws: `NativeAIError.modelNotFound` if model doesn't exist in either registry
    ///
    /// - Important: Checks dynamic registry first for override capability
    func model(named name: String) throws -> LMModel {
        // Check dynamic registry first (allows overriding built-in models)
        registryLock.lock()
        if let dynamicModel = dynamicRegistry[name] {
            registryLock.unlock()
            return dynamicModel
        }
        registryLock.unlock()

        // Check built-in models
        guard let model = availableModels.first(where: { $0.name == name }) else {
            throw NativeAIError.modelNotFound(name)
        }
        return model
    }

    func cachedContainer(for name: String) -> ModelContainer? {
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

    func load(
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
internal struct LMModel {
    let name: String
    let configuration: ModelConfiguration
    let type: ModelType

    enum ModelType: String {
        case llm
        case vlm
    }

    fileprivate func toDictionary() -> [String: Any] {
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

// MARK: - Model Download Manager

/// Manages background downloads of model files with pause/resume/cancel support.
///
/// This manager handles downloading model files from Hugging Face repositories,
/// tracking download progress, and supporting pause/resume/cancel operations.
///
/// # Thread Safety
/// - All operations are synchronized using DispatchQueue
/// - Progress tracking uses Foundation's Progress API
/// - Event emission happens on main thread
///
/// # Features
/// - Progress tracking for active downloads
/// - Pause and resume capability
/// - Download cancellation
/// - Event emission for download progress
@available(iOS 16.0, *)
final class ModelDownloadManager: @unchecked Sendable {

    private let syncQueue = DispatchQueue(label: "com.ariob.modeldownload.sync")
    private var activeDownloads: [String: Progress] = [:]
    private weak var eventEmitter: NativeAIEventEmitter?

    /// Sets the event emitter for progress notifications.
    ///
    /// - Parameter emitter: Event emitter instance
    fileprivate func setEventEmitter(_ emitter: NativeAIEventEmitter) {
        syncQueue.sync {
            self.eventEmitter = emitter
        }
    }

    /// Downloads a model from Hugging Face with progress tracking.
    ///
    /// - Parameters:
    ///   - model: Model to download
    ///   - hub: HubApi instance for downloads
    /// - Throws: Download errors
    func downloadModel(model: LMModel, hub: HubApi) async throws {
        let modelName = model.name

        // Create progress object for tracking
        let progress = Progress(totalUnitCount: 100)

        syncQueue.sync {
            activeDownloads[modelName] = progress
        }

        defer {
            syncQueue.sync {
                activeDownloads.removeValue(forKey: modelName)
            }
        }

        // Get repo configuration
        guard case .id(let repoId, _) = model.configuration.id else {
            throw NativeAIError.invalidRequest("Model must have a Hugging Face repository ID")
        }

        let repo = Hub.Repo(id: repoId)

        // Download model files with progress tracking
        let progressHandler: @Sendable (Progress) -> Void = { [weak self, weak eventEmitter] downloadProgress in
            guard let self = self, let eventEmitter = eventEmitter else { return }

            let fractionCompleted = downloadProgress.fractionCompleted
            let percentage = max(0, min(100, fractionCompleted * 100.0))

            // Update our progress object
            progress.completedUnitCount = Int64(percentage)

            // Emit progress event
            eventEmitter.emitModelEvent([
                "type": "download_progress",
                "model": modelName,
                "progress": fractionCompleted,
                "percentage": percentage
            ])
        }

        // Use Hub API to download repository files
        // Note: This downloads all model files to the cache directory
        let factory: ModelFactory = {
            switch model.type {
            case .llm:
                return LLMModelFactory.shared
            case .vlm:
                return VLMModelFactory.shared
            }
        }()

        _ = try await factory.loadContainer(
            hub: hub,
            configuration: model.configuration,
            progressHandler: progressHandler
        )
    }

    /// Pauses an active download.
    ///
    /// - Parameter modelName: Model identifier
    /// - Returns: True if download was paused, false if not found
    func pauseDownload(for modelName: String) -> Bool {
        syncQueue.sync {
            guard let progress = activeDownloads[modelName] else {
                return false
            }
            progress.pause()
            return true
        }
    }

    /// Resumes a paused download.
    ///
    /// - Parameter modelName: Model identifier
    /// - Returns: True if download was resumed, false if not found
    func resumeDownload(for modelName: String) -> Bool {
        syncQueue.sync {
            guard let progress = activeDownloads[modelName] else {
                return false
            }
            progress.resume()
            return true
        }
    }

    /// Cancels an active download.
    ///
    /// - Parameter modelName: Model identifier
    /// - Returns: True if download was cancelled, false if not found
    func cancelDownload(for modelName: String) -> Bool {
        syncQueue.sync {
            guard let progress = activeDownloads[modelName] else {
                return false
            }
            progress.cancel()
            activeDownloads.removeValue(forKey: modelName)
            return true
        }
    }
}

