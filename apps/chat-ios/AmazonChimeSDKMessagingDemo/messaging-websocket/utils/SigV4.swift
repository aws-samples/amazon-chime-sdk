//
//  SigV4.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation

public protocol SigV4 {
    func signUrl(method: String,
                 scheme: String,
                 serviceName: String,
                 hostname: String,
                 path: String,
                 payload: String,
                 queryParams: [String: String]) -> String
}
