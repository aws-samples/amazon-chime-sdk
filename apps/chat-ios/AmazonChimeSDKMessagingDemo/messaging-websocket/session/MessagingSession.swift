//
//  MessagingSession.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: Apache-2.0
//
import Foundation

@objc public protocol MessagingSession {
    func start()

    func stop()

    func addMessagingSessionObserver(observer: MessagingSessionObserver)

    func removeMessagingSessionObserver(observer: MessagingSessionObserver)
}
