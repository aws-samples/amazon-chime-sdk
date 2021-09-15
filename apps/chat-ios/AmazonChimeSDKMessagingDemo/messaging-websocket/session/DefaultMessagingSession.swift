//
//  DefaultMessagingSession.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation

public class DefaultMessagingSession: MessagingSession, WebSocketAdapterObserver {
    private var configuration: MessagingSessionConfiguration
    private let observers = ConcurrentMutableSet()
    private let sigv4: SigV4
    private let webSocketAdapter: WebSocketAdapter = DefaultWebSocketAdapter()
    private var isFirstMessageReceived: Bool = false

    init(configuration: MessagingSessionConfiguration) {
        self.configuration = configuration
        self.sigv4 = DefaultSigV4(credentials: configuration.credentials, region: configuration.region)
    }

    public func start() {
        let signedUrl = prepareWebSocketUrl()
        webSocketAdapter.connect(url: signedUrl, observer: self)
    }

    public func stop() {
        webSocketAdapter.close()
    }

    public func addMessagingSessionObserver(observer: MessagingSessionObserver) {
        observers.add(observer)
    }

    public func removeMessagingSessionObserver(observer: MessagingSessionObserver) {
        observers.remove(observer)
    }

    // WebSocketAdapterObserver
    public func onConnect() {
        ObserverUtils.forEach(observers: observers) { (observer: MessagingSessionObserver) in
            observer.onMessagingSessionConnecting(reconnecting: false)
        }
        isFirstMessageReceived = false
    }

    public func onMessage(message: String) {
        handleMessage(message: message)
    }

    public func onClose(status: MessagingSessionStatus) {
        ObserverUtils.forEach(observers: observers) { (observer: MessagingSessionObserver) in
            observer.onMessagingSessionStopped(status: status)
        }
    }

    private func handleMessage(message messageStr: String) {
        do {
            let message = try JSONDecoder().decode(Message.self, from: Data(messageStr.utf8))
            if (!isFirstMessageReceived) {
                ObserverUtils.forEach(observers: observers) { (observer: MessagingSessionObserver) in
                    observer.onMessagingSessionStarted()
                }
                isFirstMessageReceived = true
            }

            ObserverUtils.forEach(observers: observers) { (observer: MessagingSessionObserver) in
                observer.onMessagingSessionMessageReceived(message: message)
            }
        } catch {
            print("DefaultMessagingSession handleMessage() JSON parsing error: \(error)")
        }
    }

    private func prepareWebSocketUrl() -> String {
        let queryParams: [String : String] = [
            "userArn": configuration.userArn,
            "sessionId": configuration.messagingSessionId
        ]

        return sigv4.signUrl(
            method: "GET",
            scheme: "wss",
            serviceName: "chime",
            hostname: configuration.endpointUrl,
            path: "/connect",
            payload: "",
            queryParams: queryParams)
    }
}
