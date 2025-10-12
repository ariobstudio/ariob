//
//  LynxWebSocketModule.swift
//  Ariob
//
//  Created by Natnael Teferi on 10/5/25.
//


import Foundation
import Network

@objcMembers
public final class NativeWebSocketModule: NSObject, LynxModule {
    
    // MARK: - LynxModule Protocol
    
    @objc public static var name: String {
        return "NativeWebSocketModule"
    }
    
    @objc public static var methodLookup: [String: String] {
        return [
            "connect": NSStringFromSelector(#selector(connect(_:id:))),
            "send": NSStringFromSelector(#selector(send(_:message:))),
            "close": NSStringFromSelector(#selector(close(_:code:reason:)))
        ]
    }
    
    // MARK: - Private Properties
    
    private var webSockets: [Int: URLSessionWebSocketTask] = [:]
    private var urlSessions: [Int: URLSession] = [:]
    private let queue = DispatchQueue(label: "com.lynx.websocket", qos: .default)
    
    // MARK: - Initialization
    
    @objc public init(param: Any) {
        super.init()
    }
    
    @objc public override init() {
        super.init()
    }
    
    // MARK: - Public Methods
    
    @objc func connect(_ url: String, id: Int) {
        print("LynxWebSocketModule: Connecting to WebSocket id: \(id), url: \(url)")
        
        guard let websocketURL = URL(string: url) else {
            emitError(id: id, message: "Invalid URL: \(url)")
            return
        }
        
        queue.async { [weak self] in
            guard let self = self else { return }
            
            let session = URLSession(configuration: .default)
            let webSocketTask = session.webSocketTask(with: websocketURL)
            
            self.webSockets[id] = webSocketTask
            self.urlSessions[id] = session
            
            webSocketTask.resume()
            
            self.emitOpen(id: id)
            self.startReceiving(webSocketTask: webSocketTask, id: id)
        }
    }
    
    @objc func send(_ id: Int, message: String) {
        print("NativeWebSocketModule: Sending message to WebSocket id: \(id), message: \(message)")
        
        queue.async { [weak self] in
            guard let self = self,
                  let webSocketTask = self.webSockets[id] else {
                print("NativeWebSocketModule: WebSocket with id \(id) not found")
                return
            }
            
            let message = URLSessionWebSocketTask.Message.string(message)
            webSocketTask.send(message) { error in
                if let error = error {
                    print("NativeWebSocketModule: Error sending message for id \(id): \(error.localizedDescription)")
                    self.emitError(id: id, message: error.localizedDescription)
                }
            }
        }
    }
    
    @objc func close(_ id: Int, code: Int, reason: String) {
        print("NativeWebSocketModule: Closing WebSocket id: \(id) with code: \(code), reason: \(reason)")
        
        queue.async { [weak self] in
            guard let self = self else { return }
            
            if let webSocketTask = self.webSockets[id] {
                let closeCode = URLSessionWebSocketTask.CloseCode(rawValue: code) ?? .normalClosure
                let reasonData = reason.data(using: .utf8)
                webSocketTask.cancel(with: closeCode, reason: reasonData)
            }
            
            self.cleanup(id: id)
            self.emitClose(id: id, code: code, reason: reason)
        }
    }
    
    // MARK: - Private Methods
    
    private func startReceiving(webSocketTask: URLSessionWebSocketTask, id: Int) {
        webSocketTask.receive { [weak self] result in
            guard let self = self else { return }
            
            switch result {
            case .success(let message):
                switch message {
                case .string(let text):
                    print("NativeWebSocketModule: Message received for WebSocket id: \(id), data: \(text)")
                    self.emitMessage(id: id, data: text)
                case .data(let data):
                    if let text = String(data: data, encoding: .utf8) {
                        print("NativeWebSocketModule: Binary message received for WebSocket id: \(id), converted to text: \(text)")
                        self.emitMessage(id: id, data: text)
                    } else {
                        print("NativeWebSocketModule: Binary message received for WebSocket id: \(id), could not convert to text")
                        self.emitError(id: id, message: "Could not convert binary message to text")
                    }
                @unknown default:
                    print("NativeWebSocketModule: Unknown message type received for WebSocket id: \(id)")
                    self.emitError(id: id, message: "Unknown message type received")
                }
                
                // Continue receiving messages
                if self.webSockets[id] != nil {
                    self.startReceiving(webSocketTask: webSocketTask, id: id)
                }
                
            case .failure(let error):
                print("NativeWebSocketModule: Receive error for WebSocket id: \(id): \(error.localizedDescription)")
                
                // Check if this is a normal closure
                if let wsError = error as? URLError,
                   wsError.code == URLError.cancelled {
                    // This is likely a normal closure, don't emit as error
                    print("NativeWebSocketModule: WebSocket id: \(id) was cancelled (likely normal closure)")
                } else {
                    self.emitError(id: id, message: error.localizedDescription)
                }
                
                self.cleanup(id: id)
            }
        }
    }
    
    private func cleanup(id: Int) {
        webSockets.removeValue(forKey: id)
        urlSessions.removeValue(forKey: id)
    }
    
    // MARK: - Event Emission Methods
    
    private func emitOpen(id: Int) {
        print("NativeWebSocketModule: WebSocket id: \(id) opened.")
        let json = createJSONString(["id": id])
        emitEvent(eventName: "websocket:open", jsonData: json)
    }
    
    private func emitMessage(id: Int, data: String) {
        let json = createJSONString(["id": id, "data": data])
        emitEvent(eventName: "websocket:message", jsonData: json)
    }
    
    private func emitError(id: Int, message: String) {
        print("NativeWebSocketModule: Error for WebSocket id: \(id), message: \(message)")
        let json = createJSONString(["id": id, "message": message])
        emitEvent(eventName: "websocket:error", jsonData: json)
    }
    
    private func emitClose(id: Int, code: Int, reason: String) {
        print("NativeWebSocketModule: WebSocket id: \(id) closed with code: \(code), reason: \(reason)")
        let json = createJSONString(["id": id, "code": code, "reason": reason])
        emitEvent(eventName: "websocket:close", jsonData: json)
    }
    
    private func createJSONString(_ dictionary: [String: Any]) -> String {
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: dictionary, options: [])
            return String(data: jsonData, encoding: .utf8) ?? "{}"
        } catch {
            print("NativeWebSocketModule: Error creating JSON: \(error.localizedDescription)")
            return "{}"
        }
    }
    
    private func emitEvent(eventName: String, jsonData: String) {
        print("NativeWebSocketModule: Emitting event: \(eventName) with payload: \(jsonData)")
        
        DispatchQueue.main.async {
            // This would need to be implemented based on how Lynx handles event emission on iOS
            // The exact implementation depends on the iOS Lynx runtime's event system
            // You may need to access the Lynx context or runtime to emit global events
            
            // Placeholder for event emission - replace with actual Lynx iOS event emission
            NotificationCenter.default.post(
                name: NSNotification.Name(eventName),
                object: nil,
                userInfo: ["payload": jsonData]
            )
        }
    }
}
