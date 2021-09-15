//
//  ChimeUserCredentials.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation

struct ChimeUserCredentials: Codable {
    let accessKeyId: String
    let secretAccessKey: String
    let sessionToken: String
    
    enum CodingKeys: String, CodingKey {
        case accessKeyId = "AccessKeyId"
        case secretAccessKey = "SecretAccessKey"
        case sessionToken = "SessionToken"
    }
}
