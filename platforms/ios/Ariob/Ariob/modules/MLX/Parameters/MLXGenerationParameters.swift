import Foundation

// MARK: - MLX Text Generation Parameters

@available(iOS 16.0, *)
public struct MLXGenerationParameters {
    public let maxTokens: Int
    public let temperature: Float
    public let topP: Float
    public let topK: Int?
    public let repetitionPenalty: Float
    public let seed: Int?
    public let stopTokens: [String]
    public let presencePenalty: Float
    public let frequencyPenalty: Float

    // Default initializer
    public init(
        maxTokens: Int = 256,
        temperature: Float = 0.8,
        topP: Float = 0.9,
        topK: Int? = nil,
        repetitionPenalty: Float = 1.0,
        seed: Int? = nil,
        stopTokens: [String] = [],
        presencePenalty: Float = 0.0,
        frequencyPenalty: Float = 0.0
    ) {
        self.maxTokens = maxTokens
        self.temperature = temperature
        self.topP = topP
        self.topK = topK
        self.repetitionPenalty = repetitionPenalty
        self.seed = seed
        self.stopTokens = stopTokens
        self.presencePenalty = presencePenalty
        self.frequencyPenalty = frequencyPenalty
    }

    // Initialize from dictionary (for JSON parsing)
    public init(from options: [String: Any]) {
        self.maxTokens = options["maxTokens"] as? Int ?? 256
        self.temperature = options["temperature"] as? Float ?? 0.8
        self.topP = options["topP"] as? Float ?? 0.9
        self.topK = options["topK"] as? Int
        self.repetitionPenalty = options["repetitionPenalty"] as? Float ?? 1.0
        self.seed = options["seed"] as? Int
        self.stopTokens = options["stopTokens"] as? [String] ?? []
        self.presencePenalty = options["presencePenalty"] as? Float ?? 0.0
        self.frequencyPenalty = options["frequencyPenalty"] as? Float ?? 0.0
    }

    // Convert to dictionary
    public func toDictionary() -> [String: Any] {
        var dict: [String: Any] = [
            "maxTokens": maxTokens,
            "temperature": temperature,
            "topP": topP,
            "repetitionPenalty": repetitionPenalty,
            "stopTokens": stopTokens,
            "presencePenalty": presencePenalty,
            "frequencyPenalty": frequencyPenalty
        ]

        if let topK = topK {
            dict["topK"] = topK
        }

        if let seed = seed {
            dict["seed"] = seed
        }

        return dict
    }

    // Validation
    public var isValid: Bool {
        return maxTokens > 0 &&
               temperature >= 0.0 &&
               topP >= 0.0 && topP <= 1.0 &&
               repetitionPenalty >= 0.0 &&
               presencePenalty >= -2.0 && presencePenalty <= 2.0 &&
               frequencyPenalty >= -2.0 && frequencyPenalty <= 2.0
    }

    // Common presets
    public static let `default` = MLXGenerationParameters()

    public static let creative = MLXGenerationParameters(
        maxTokens: 512,
        temperature: 1.0,
        topP: 0.95,
        repetitionPenalty: 1.1
    )

    public static let focused = MLXGenerationParameters(
        maxTokens: 256,
        temperature: 0.3,
        topP: 0.7,
        repetitionPenalty: 1.05
    )

    public static let balanced = MLXGenerationParameters(
        maxTokens: 384,
        temperature: 0.7,
        topP: 0.8,
        repetitionPenalty: 1.0
    )

    public static let deterministic = MLXGenerationParameters(
        maxTokens: 256,
        temperature: 0.0,
        topP: 1.0,
        repetitionPenalty: 1.0
    )
}

// MARK: - Sendable Conformance
@available(iOS 16.0, *)
extension MLXGenerationParameters: Sendable {}

// MARK: - Equatable Conformance
@available(iOS 16.0, *)
extension MLXGenerationParameters: Equatable {
    public static func == (lhs: MLXGenerationParameters, rhs: MLXGenerationParameters) -> Bool {
        return lhs.maxTokens == rhs.maxTokens &&
               lhs.temperature == rhs.temperature &&
               lhs.topP == rhs.topP &&
               lhs.topK == rhs.topK &&
               lhs.repetitionPenalty == rhs.repetitionPenalty &&
               lhs.seed == rhs.seed &&
               lhs.stopTokens == rhs.stopTokens &&
               lhs.presencePenalty == rhs.presencePenalty &&
               lhs.frequencyPenalty == rhs.frequencyPenalty
    }
}

// MARK: - CustomStringConvertible
@available(iOS 16.0, *)
extension MLXGenerationParameters: CustomStringConvertible {
    public var description: String {
        return """
        MLXGenerationParameters(
          maxTokens: \(maxTokens),
          temperature: \(temperature),
          topP: \(topP),
          topK: \(topK?.description ?? "none"),
          repetitionPenalty: \(repetitionPenalty),
          seed: \(seed?.description ?? "random"),
          stopTokens: \(stopTokens.count) tokens,
          presencePenalty: \(presencePenalty),
          frequencyPenalty: \(frequencyPenalty)
        )
        """
    }
}