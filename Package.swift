// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "AriobNativeModules",
    platforms: [
        .iOS(.v16) // MLX requires iOS 16+ for Swift Package Manager
    ],
    products: [
        .library(
            name: "AriobNativeModules",
            targets: ["AriobNativeModules"]),
    ],
    dependencies: [
        // MLX dependencies for SPM users
        .package(url: "https://github.com/ml-explore/mlx-swift", from: "0.10.0"),
        .package(url: "https://github.com/huggingface/swift-transformers", from: "0.1.0")
    ],
    targets: [
        .target(
            name: "AriobNativeModules",
            dependencies: [
                .product(name: "MLX", package: "mlx-swift"),
                .product(name: "MLXNN", package: "mlx-swift"),
                .product(name: "MLXOptimizers", package: "mlx-swift"),
                .product(name: "MLXRandom", package: "mlx-swift"),
                .product(name: "Transformers", package: "swift-transformers")
            ],
            path: "platforms/ios/Ariob/Ariob/modules",
            sources: [
                "NativeMLXModule.swift"
            ],
            swiftSettings: [
                .define("MLX_AVAILABLE", .when(platforms: [.iOS]))
            ]
        )
    ]
)