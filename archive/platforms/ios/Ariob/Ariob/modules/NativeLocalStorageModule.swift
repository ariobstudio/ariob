//
//  NativeLocalStorageModule.swift
//  Ariob
//
//  Created by Natnael Teferi on 5/11/25.
//



import Foundation


@objcMembers
public final class NativeLocalStorageModule: NSObject, LynxModule {

    @objc public static var name: String {
        return "NativeLocalStorageModule"
    }

    @objc public static var methodLookup: [String : String] {
        return [
            "setStorageItem": NSStringFromSelector(#selector(setStorageItem(_:value:))),
            "getStorageItem": NSStringFromSelector(#selector(getStorageItem(_:))),
            "clearStorage": NSStringFromSelector(#selector(clearStorage))
        ]
    }

    private let localStorage: UserDefaults
    private static let storageKey = "MyLocalStorage"

    @objc public init(param: Any) {
      guard let suite = UserDefaults(suiteName: NativeLocalStorageModule.storageKey) else {
          fatalError("Failed to initialize UserDefaults with suiteName: \(NativeLocalStorageModule.storageKey)")
      }
      localStorage = suite
      super.init()
    }

    @objc public override init() {
        guard let suite = UserDefaults(suiteName: NativeLocalStorageModule.storageKey) else {
            fatalError("Failed to initialize UserDefaults with suiteName: \(NativeLocalStorageModule.storageKey)")
        }
        localStorage = suite
        super.init()
    }

    @objc func setStorageItem(_ key: String, value: String) {
        localStorage.set(value, forKey: key)
    }

    @objc func getStorageItem(_ key: String) -> String? {
        return localStorage.string(forKey: key)
    }

    @objc func clearStorage() {
        localStorage.dictionaryRepresentation().keys.forEach {
            localStorage.removeObject(forKey: $0)
        }
    }

}
