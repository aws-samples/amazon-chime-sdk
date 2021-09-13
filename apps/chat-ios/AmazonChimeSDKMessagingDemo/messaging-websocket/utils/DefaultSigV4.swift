//
//  DefaultSigV4.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: Apache-2.0
//

import AWSCore

let X_AMZ_ALGORITHM: String = "X-Amz-Algorithm"
let X_AMZ_CREDENTIAL: String = "X-Amz-Credential"
let X_AMZ_DATE: String = "X-Amz-Date"
let X_AMZ_EXPIRES: String = "X-Amz-Expires"
let X_AMZ_SIGNED_HEADERS: String = "X-Amz-SignedHeaders"
let X_AMZ_SECURITY_TOKEN: String = "X-Amz-Security-Token"

public class DefaultSigV4: SigV4 {
    private var credentials: ChimeUserCredentials
    private var region: String

    init(credentials: ChimeUserCredentials, region: String) {
        self.credentials = credentials
        self.region = region
    }

    public func signUrl(method: String,
                 scheme: String,
                 serviceName: String,
                 hostname: String,
                 path: String,
                 payload: String,
                 queryParams: [String: String]) -> String {

        let now = getDateTimeString()
        let today = getDateString(dateTimeString: now)

        let algorithm = "AWS4-HMAC-SHA256"
        let signedHeaders = "host"
        let canonicalHeaders = "host:\(hostname.lowercased())\n"
        let credentialScope = "\(today)/\(region)/\(serviceName)/aws4_request"

        var params: [String : String] = [
            X_AMZ_ALGORITHM: algorithm,
            X_AMZ_CREDENTIAL: encodeURI(content: "\(credentials.accessKeyId)/\(credentialScope)"),
            X_AMZ_DATE: now,
            X_AMZ_EXPIRES: "10",
            X_AMZ_SIGNED_HEADERS: signedHeaders,
            X_AMZ_SECURITY_TOKEN: encodeURI(content: credentials.sessionToken)
        ]

        if !queryParams.isEmpty {
            for (key, value) in queryParams {
                params[key] = encodeURI(content: value)
            }
        }

        let sorted = params.sorted(by: { $0.0 < $1.0 })
        var canonicalQueryString = ""
        for (key, value) in sorted {
            if !canonicalQueryString.isEmpty {
                canonicalQueryString.append("&")
            }
            canonicalQueryString.append(key)
            canonicalQueryString.append("=")
            canonicalQueryString.append(value)
        }

        let canonicalRequest = method + "\n" +
                               path + "\n" +
                               canonicalQueryString + "\n" +
                               canonicalHeaders + "\n" +
                               signedHeaders + "\n" +
                               sha256(content: payload)

        let hashedCanonicalRequest: String = sha256(content: canonicalRequest)
        let stringToSign = algorithm + "\n" +
                           now + "\n" +
                           credentialScope + "\n" +
                           hashedCanonicalRequest
        print("DefaultSigV4 signURL stringToSign: \(stringToSign)")

        let signingKey = getSignatureKey(key: credentials.secretAccessKey, date: today, regionName: region, serviceName: serviceName)
        let signature = hmac(data: stringToSign, key: signingKey).hexEncodedString()

        let finalParams = "\(canonicalQueryString)&X-Amz-Signature=\(signature)"
        return "\(scheme)://\(hostname)\(path)?\(finalParams)"
    }

    private func getDateTimeString() -> String {
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyyMMdd'T'HHmmss'Z'"
        dateFormatter.timeZone = (NSTimeZone(name: "UTC")! as TimeZone)
        dateFormatter.locale = Locale(identifier: Locale.current.languageCode!)
        return dateFormatter.string(from: Date())
    }

    private func getDateString(dateTimeString: String) -> String {
        return String(dateTimeString[..<dateTimeString.firstIndex(of: "T")!])
    }

    private func encodeURI(content: String) -> String {
        let allowedCharacterSet = CharacterSet(charactersIn: "!*'();:@&=+$,/?%#[] ").inverted
        return content.addingPercentEncoding(withAllowedCharacters: allowedCharacterSet)!
    }

    private func sha256(content: String) -> String {
        return AWSSignatureSignerUtility.hexEncode(AWSSignatureSignerUtility.hashString(content))
    }

    private func getSignatureKey(key: String, date: String, regionName: String, serviceName: String) -> Data {
        let kSecret = Data("AWS4\(key)".utf8)
        let kDate = hmac(data: date, key: kSecret)
        let kRegion = hmac(data: regionName, key: kDate)
        let kService = hmac(data: serviceName, key: kRegion)
        let kSigning = hmac(data: "aws4_request", key: kService)
        return kSigning
    }

    func hmac(data: String, key: Data) -> Data {
        return AWSSignatureSignerUtility.sha256HMac(with: Data(data.utf8), withKey: key)
    }
}
