//
//  Payload.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation

struct Payload: Codable {
    let content: String
    let createdTimestamp: String
    let channelArn: String
    let sender: Sender
    let metadata: Metadata?
    
    enum CodingKeys: String, CodingKey {
        case content = "Content"
        case createdTimestamp = "CreatedTimestamp"
        case channelArn = "ChannelArn"
        case sender = "Sender"
        case metadata = "Metadata"
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.content = try container.decode(String.self, forKey: .content)
        self.createdTimestamp = try container.decode(String.self, forKey: .createdTimestamp)
        self.channelArn = try container.decode(String.self, forKey: .channelArn)
        self.sender = try container.decode(Sender.self, forKey: .sender)
        let metadataStr = try container.decodeIfPresent(String.self, forKey: .metadata)

        if let metadataStr = metadataStr {
            self.metadata = try JSONDecoder().decode(Metadata.self, from: Data(metadataStr.utf8))
        } else {
            self.metadata = nil
        }
    }
}

struct Sender: Codable {
    let name: String
    let arn: String
    
    enum CodingKeys: String, CodingKey {
        case name = "Name"
        case arn = "Arn"
    }
}

struct Metadata: Codable {
    let attachments: [Attachment]?
}

struct Attachment: Codable {
    let name: String
    let size: Int
    let fileKey: String
}
