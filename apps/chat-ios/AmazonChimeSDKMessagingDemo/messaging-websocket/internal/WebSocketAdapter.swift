//
//  WebSocketAdapter.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

public protocol WebSocketAdapter {
    func connect(url: String, observer: WebSocketAdapterObserver)

    func close()
}
