//
//  Utils.swift
//  AmazonChimeSDKDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation

class Utils {
    static let defaults = UserDefaults.standard
    
    // Format a timestamp string from "2021-06-03T16:26:31.013Z" to "16:26:31"
    static func formatTimestamp(with timestamp: String) -> String {
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
    
    // Format a Date object to "HH:mm:ss"
    static func formatDateToDisplayTime(with date: Date?) -> String {
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "HH:mm:ss"
        guard let date = date else {
            return ""
        }
        return dateFormatter.string(from: date)
    }

    static func getUserIdFromArn(arn: String) -> String {
        let components = arn.components(separatedBy: ":")
        return components.last ?? ""
    }
    
    static func getUserDefaultsString(forKey key: String) -> String? {
        return defaults.string(forKey: key)
    }
    
    static func setUserDefaultsString(value: String?, forKey key: String) {
        defaults.set(value, forKey: key)
    }
    
    static func removeUserDefaults(forKey key: String) {
        defaults.removeObject(forKey: key)
    }
}
