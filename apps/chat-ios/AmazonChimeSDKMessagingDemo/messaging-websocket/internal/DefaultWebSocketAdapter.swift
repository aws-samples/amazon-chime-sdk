//
//  DefaultWebSocketAdapter.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Starscream

public class DefaultWebSocketAdapter: WebSocketAdapter, WebSocketDelegate {
    private var socket: WebSocket?
    private var observer: WebSocketAdapterObserver?
    
    // MARK: - WebSocketAdapter
    public func connect(url: String, observer: WebSocketAdapterObserver) {
        self.observer = observer

        guard let urlObj = URL(string: url) else {
            print("DefaultWebSocketAdapter connect() bad url")
            return
        }
        var request = URLRequest(url: urlObj)
        request.timeoutInterval = 5
        socket = WebSocket(request: request)
        socket?.delegate = self
        socket?.connect()
    }

    public func close() {
        socket?.disconnect()
    }

    // MARK: - WebSocketDelegate
    public func didReceive(event: WebSocketEvent, client: WebSocket) {
        switch event {
            case .connected(let headers):
                print("DefaultWebSocketAdapter websocket is connected: \(headers)")
                observer?.onConnect()
            case .disconnected(let reason, let code):
                print("DefaultWebSocketAdapter websocket is disconnected: \(reason) with code: \(code)")
                observer?.onClose(status: MessagingSessionStatus(code: Int(code), reason: reason))
            case .text(let string):
                print("DefaultWebSocketAdapter text received: \(string)")
                observer?.onMessage(message: string)
            case .binary(let data):
                print("DefaultWebSocketAdapter binary received: \(data.count)")
            case .ping(_):
                print("DefaultWebSocketAdapter ping received")
                break
            case .pong(_):
                print("DefaultWebSocketAdapter pong received")
                break
            case .viabilityChanged(_):
                print("DefaultWebSocketAdapter viability changed")
                break
            case .reconnectSuggested(_):
                print("DefaultWebSocketAdapter reconnect suggested")
                break
            case .cancelled:
                print("DefaultWebSocketAdapter cancelled")
            case .error(let error):
                print("DefaultWebSocketAdapter error \(String(describing: error))")
        }
    }
}
