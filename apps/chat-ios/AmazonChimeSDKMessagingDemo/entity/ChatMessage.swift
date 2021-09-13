//
//  ChatMessage.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: Apache-2.0
//

import UIKit

struct ChatMessage {
    let senderName: String
    let content: String
    let displayTime: String
    let isSelf: Bool
    let imageUrl: URL?
}
