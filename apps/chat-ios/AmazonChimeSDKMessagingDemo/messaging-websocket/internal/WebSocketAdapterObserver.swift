//
//  WebSocketAdapterObserver.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: Apache-2.0
//

public protocol WebSocketAdapterObserver {
    func onConnect()

    func onMessage(message: String)

    func onClose(status: MessagingSessionStatus)
}
