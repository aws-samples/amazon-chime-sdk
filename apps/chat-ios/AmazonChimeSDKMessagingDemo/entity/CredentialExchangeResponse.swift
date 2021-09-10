//
//  CredentialExchangeResponse.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: Apache-2.0
//

import AWSPluginsCore
import Foundation

struct CredentialExchangeResponse: Codable {
    let chimeDisplayName: String
    let chimeCredentials: ChimeUserCredentials
    let chimeUserId: String
    let chimeAppInstanceUserArn: String
    
    enum CodingKeys: String, CodingKey {
        case chimeDisplayName = "ChimeDisplayName"
        case chimeCredentials = "ChimeCredentials"
        case chimeUserId = "ChimeUserId"
        case chimeAppInstanceUserArn = "ChimeAppInstanceUserArn"
    }
}
