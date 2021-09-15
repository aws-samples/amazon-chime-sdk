//
//  Utils.swift
//  AmazonChimeSDKDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation

class Utils {
    static func formatTimestamp(timestamp: String) -> String {
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        dateFormatter.timeZone = TimeZone(abbreviation: "UTC")

        if let date = dateFormatter.date(from: timestamp) {
            dateFormatter.timeZone = TimeZone.current
            dateFormatter.dateFormat = "HH:mm:ss"
            return dateFormatter.string(from: date)
        }
        return ""
    }

    static func getUserIdFromArn(arn: String) -> String {
        let components = arn.components(separatedBy: ":")
        return components.last ?? ""
    }
}
