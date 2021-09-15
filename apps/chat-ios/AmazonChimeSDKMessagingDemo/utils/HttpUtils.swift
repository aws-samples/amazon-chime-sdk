//
//  HttpUtils.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation

typealias CompletionFunc = (Data?, Error?) -> Void

class HttpUtils {
    public static func postRequest(url: String,
                                   jsonData: Data? = nil,
                                   headers: [String: String] = [:],
                                   completion: @escaping CompletionFunc) {
        makeHttpRequest(url: url, method: "post", jsonData: jsonData, headers: headers, completion: completion)
    }

    private static func makeHttpRequest(url: String,
                                        method: String,
                                        jsonData: Data?,
                                        headers: [String: String],
                                        completion: @escaping CompletionFunc) {
        guard let serverUrl = URL(string: url) else {
            print("HttpUtils makeeHttpRequest Unable to parse Url please make sure check Url")
            return
        }

        var request = URLRequest(url: serverUrl)
        request.httpMethod = method

        for (key, value) in headers {
            request.addValue(value, forHTTPHeaderField: key)
        }
        
        if let data = jsonData, method.lowercased() == "post" {
            request.addValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = data
        }

        URLSession.shared.dataTask(with: request) { data, resp, error in
            if let error = error {
                print("HttpUtils makeHttpRequest error: \(error.localizedDescription)")
                completion(nil, error)
                return
            }
            if let httpResponse = resp as? HTTPURLResponse {
                guard 200 ... 299 ~= httpResponse.statusCode else {
                    print("HttpUtils makeHttpRequest response status code \(httpResponse.statusCode)")
                    completion(nil, NSError(domain: "", code: httpResponse.statusCode, userInfo: nil))
                    return
                }
            }
            guard let data = data else { return }
            completion(data, nil)
        }.resume()
    }

    public static func encodeStrForURL(str: String) -> String {
        return str.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? str
    }
}
