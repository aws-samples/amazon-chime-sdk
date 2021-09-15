//
//  WebSocketAdapterObserver.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

public protocol WebSocketAdapterObserver {
    func onConnect()

    func onMessage(message: String)

    func onClose(status: MessagingSessionStatus)
}
