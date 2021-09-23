//
//  MessagingSessionConfiguration.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation

struct MessagingSessionConfiguration {
    var userArn: String
    var endpointUrl: String
    var region: String
    var credentials: ChimeUserCredentials
    var messagingSessionId: String = UUID().uuidString
}
