//
//  AttachmentService.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Amplify

class AttachmentService {
    private static var userUploadDir = "uploadfiles";
    private static let TAG = "AttachmentService"

    static func upload(fileName: String, fileUrl: URL, completionHandler: @escaping (Bool, String) -> Void) {
        Amplify.Storage.uploadFile(
            key: "\(userUploadDir)/\(fileName)",
            local: fileUrl,
            options: .init(accessLevel: StorageAccessLevel.protected),
            progressListener: { progress in print("\(TAG) upload() progressListener progress: \(progress)") },
            resultListener: { event in
                switch event {
                case .success(let data):
                    print("\(TAG) upload() completed: \(data)")
                    completionHandler(true, data)
                case .failure(let storageError):
                    print("\(TAG) upload() failed: \(storageError.errorDescription). \(storageError.recoverySuggestion)")
                    completionHandler(false, storageError.errorDescription)
                }
            })
    }

    static func download(key: String, url: URL, userId: String, completionHandler: @escaping (Bool) -> Void) {
        Amplify.Storage.downloadFile(
            key: key,
            local: url,
            options: .init(accessLevel: StorageAccessLevel.protected, targetIdentityId: userId),
            progressListener: { progress in print("\(TAG) download() progressListener progress: \(progress)") },
            resultListener: { event in
                switch event {
                case .success:
                    print("\(TAG) download() completed")
                    completionHandler(true)
                case .failure(let storageError):
                    print("\(TAG) download() failed: \(storageError.errorDescription). \(storageError.recoverySuggestion)")
                }
            })
    }
}
