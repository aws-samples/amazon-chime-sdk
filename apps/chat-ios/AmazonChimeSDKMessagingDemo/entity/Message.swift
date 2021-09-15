//
//  Message.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation

@objcMembers public class Message: NSObject, Codable {
    let headers: [String: String]
    let payload: String?

    enum CodingKeys: String, CodingKey {
        case headers = "Headers"
        case payload = "Payload"
    }
}
