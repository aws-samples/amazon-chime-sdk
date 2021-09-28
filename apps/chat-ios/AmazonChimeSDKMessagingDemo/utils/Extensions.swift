//
//  Extensions.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import UIKit

extension UIViewController {
    func setupHideKeyboardOnTap() {
        view.addGestureRecognizer(dismissKeyboardRecognizer())
    }

    private func dismissKeyboardRecognizer() -> UIGestureRecognizer {
        let tap = UITapGestureRecognizer(target: view, action: #selector(view.endEditing(_:)))
        tap.cancelsTouchesInView = false
        return tap
    }
}

extension Data {
    func hexEncodedString() -> String {
        return map { String(format: "%02hhx", $0) }.joined()
    }
}

extension String {
    func mentions() -> [String] {
        if let regex = try? NSRegularExpression(pattern: "(?<!\\w)@\\S+", options: .caseInsensitive) {
            let string = self as NSString
            return regex.matches(in: self, options: [], range: NSRange(location: 0, length: string.length)).map {
                print($0)
                return string.substring(with: $0.range)
            }
        }
        return []
    }
}
