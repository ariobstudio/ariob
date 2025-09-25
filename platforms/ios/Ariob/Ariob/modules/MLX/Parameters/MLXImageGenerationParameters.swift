import Foundation

// MARK: - MLX Image Generation Parameters

@available(iOS 16.0, *)
public struct MLXImageGenerationParameters {
    public let width: Int
    public let height: Int
    public let steps: Int
    public let guidanceScale: Float
    public let seed: Int?
    public let negativePrompt: String?
    public let scheduler: String
    public let safetyChecker: Bool

    // Default initializer
    public init(
        width: Int = 512,
        height: Int = 512,
        steps: Int = 20,
        guidanceScale: Float = 7.5,
        seed: Int? = nil,
        negativePrompt: String? = nil,
        scheduler: String = "ddim",
        safetyChecker: Bool = true
    ) {
        self.width = width
        self.height = height
        self.steps = steps
        self.guidanceScale = guidanceScale
        self.seed = seed
        self.negativePrompt = negativePrompt
        self.scheduler = scheduler
        self.safetyChecker = safetyChecker
    }

    // Initialize from dictionary (for JSON parsing)
    public init(from options: [String: Any]) {
        self.width = options["width"] as? Int ?? 512
        self.height = options["height"] as? Int ?? 512
        self.steps = options["steps"] as? Int ?? 20
        self.guidanceScale = options["guidanceScale"] as? Float ?? 7.5
        self.seed = options["seed"] as? Int
        self.negativePrompt = options["negativePrompt"] as? String
        self.scheduler = options["scheduler"] as? String ?? "ddim"
        self.safetyChecker = options["safetyChecker"] as? Bool ?? true
    }

    // Convert to dictionary
    public func toDictionary() -> [String: Any] {
        var dict: [String: Any] = [
            "width": width,
            "height": height,
            "steps": steps,
            "guidanceScale": guidanceScale,
            "scheduler": scheduler,
            "safetyChecker": safetyChecker
        ]

        if let seed = seed {
            dict["seed"] = seed
        }

        if let negativePrompt = negativePrompt {
            dict["negativePrompt"] = negativePrompt
        }

        return dict
    }

    // Validation
    public var isValid: Bool {
        return width > 0 && height > 0 && steps > 0 && guidanceScale > 0
    }

    // Common presets
    public static let `default` = MLXImageGenerationParameters()
    public static let highQuality = MLXImageGenerationParameters(
        width: 768,
        height: 768,
        steps: 50,
        guidanceScale: 10.0
    )
    public static let fastGeneration = MLXImageGenerationParameters(
        width: 512,
        height: 512,
        steps: 10,
        guidanceScale: 5.0
    )
}

// MARK: - Sendable Conformance
@available(iOS 16.0, *)
extension MLXImageGenerationParameters: Sendable {}

// MARK: - Equatable Conformance
@available(iOS 16.0, *)
extension MLXImageGenerationParameters: Equatable {
    public static func == (lhs: MLXImageGenerationParameters, rhs: MLXImageGenerationParameters) -> Bool {
        return lhs.width == rhs.width &&
               lhs.height == rhs.height &&
               lhs.steps == rhs.steps &&
               lhs.guidanceScale == rhs.guidanceScale &&
               lhs.seed == rhs.seed &&
               lhs.negativePrompt == rhs.negativePrompt &&
               lhs.scheduler == rhs.scheduler &&
               lhs.safetyChecker == rhs.safetyChecker
    }
}

// MARK: - CustomStringConvertible
@available(iOS 16.0, *)
extension MLXImageGenerationParameters: CustomStringConvertible {
    public var description: String {
        return """
        MLXImageGenerationParameters(
          dimensions: \(width)x\(height),
          steps: \(steps),
          guidanceScale: \(guidanceScale),
          seed: \(seed?.description ?? "random"),
          scheduler: \(scheduler),
          safetyChecker: \(safetyChecker),
          negativePrompt: \(negativePrompt != nil ? "provided" : "none")
        )
        """
    }
}