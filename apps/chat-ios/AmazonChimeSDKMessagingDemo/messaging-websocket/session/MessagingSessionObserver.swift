//
//  MessagingSessionObserver.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: Apache-2.0
//

import Foundation

@objc public protocol MessagingSessionObserver {

    func onMessagingSessionStarted()

    func onMessagingSessionConnecting(reconnecting: Bool)

    func onMessagingSessionStopped(status: MessagingSessionStatus)

    func onMessagingSessionMessageReceived(message: Message)
}
