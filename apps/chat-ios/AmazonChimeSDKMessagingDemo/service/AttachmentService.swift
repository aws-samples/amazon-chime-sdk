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

    static func upload(fileName: String, fileUrl: URL, completionHandler: @escaping (Bool, String) -> Void) {
        Amplify.Storage.uploadFile(
            key: "\(userUploadDir)/\(fileName)",
            local: fileUrl,
            options: .init(accessLevel: StorageAccessLevel.protected),
            progressListener: { progress in
                print("AttachmentService upload() progressListener progress: \(progress)")
            },
            resultListener: { event in
                switch event {
                case .success(let data):
                    print("AttachmentService upload() completed: \(data)")
                    completionHandler(true, data)
                case .failure(let storageError):
                    print("AttachmentService upload() failed: \(storageError.errorDescription). \(storageError.recoverySuggestion)")
                    completionHandler(false, storageError.errorDescription)
                }
            })
    }

    static func download(key: String, url: URL, userId: String, completionHandler: @escaping (Bool) -> Void) {
        Amplify.Storage.downloadFile(
            key: key,
            local: url,
            options: .init(accessLevel: StorageAccessLevel.protected,
                           targetIdentityId: userId),
            progressListener: { progress in
                print("AttachmentService download() progressListener progress: \(progress)")
            }, resultListener: { event in
                switch event {
                case .success:
                    print("AttachmentService download() completed")
                    completionHandler(true)
                case .failure(let storageError):
                    print("AttachmentService download() failed: \(storageError.errorDescription). \(storageError.recoverySuggestion)")
                }
            })
    }
}
