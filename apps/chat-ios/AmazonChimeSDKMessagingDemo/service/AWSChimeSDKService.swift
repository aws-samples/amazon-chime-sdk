//
//  AWSChimeSDKService.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: Apache-2.0
//

import AWSChimeSDKMessaging
import AWSPluginsCore

class AWSChimeSDKService {

    private var awsChimeSDKMessagingClient: AWSChimeSDKMessaging?

    func initialize () {
        guard let credentials = AuthService.currentUserCredentials else {
            print("AWSChimeSDKService initialize() cannot get current user credential")
            return
        }
        let credentialsProvider = AWSBasicSessionCredentialsProvider(accessKey: credentials.accessKeyId,
                                                                     secretKey: credentials.secretAccessKey,
                                                                     sessionToken: credentials.sessionToken)
        if let configuration = AWSServiceConfiguration(region: .USEast1, credentialsProvider: credentialsProvider) {
            AWSChimeSDKMessaging.register(with: configuration, forKey: Constants.awsChimeSDKMessagingClientKey)
            awsChimeSDKMessagingClient = AWSChimeSDKMessaging(forKey: Constants.awsChimeSDKMessagingClientKey)
        } else {
            print("AWSChimeSDKService initialize() cannot initiate AWSServiceConfiguration")
        }
    }

    func getMessagingEndpoint(completion: @escaping (String) -> Void) {
        self.awsChimeSDKMessagingClient?.getSessionEndpoint(AWSChimeSDKMessagingGetMessagingSessionEndpointRequest()).continueWith(block: { (task) -> Void in
            if let error = task.error {
                print("AWSChimeSDKService getMessagingEndpoint() error: \(error)")
                return
            }
            if let endpointUrl = task.result?.endpoint?.url {
                completion(endpointUrl)
            }
        })
    }

    // use metadata to send attachment
    func sendMessage(content: String, channel: String, chimeBearer: String, metadata: String? = nil, completion: @escaping (AWSChimeSDKMessagingSendChannelMessageResponse?, Error?) -> Void) {
        let sendChannelMessageRequest: AWSChimeSDKMessagingSendChannelMessageRequest = AWSChimeSDKMessagingSendChannelMessageRequest()
        sendChannelMessageRequest.channelArn = channel
        sendChannelMessageRequest.content = content
        sendChannelMessageRequest.chimeBearer = chimeBearer
        sendChannelMessageRequest.persistence = AWSChimeSDKMessagingChannelMessagePersistenceType.persistent
        sendChannelMessageRequest.types = AWSChimeSDKMessagingChannelMessageType.standard
        sendChannelMessageRequest.clientRequestToken = UUID().uuidString
        if let metadata = metadata {
            sendChannelMessageRequest.metadata = metadata
        }

        awsChimeSDKMessagingClient?.sendChannelMessage(sendChannelMessageRequest) { response, error  in
            completion(response, error)
        }
    }

    func listChannels(appInstanceUserArn: String, completion: @escaping (AWSChimeSDKMessagingListChannelMembershipsForAppInstanceUserResponse?, Error?) -> Void) {
        let listChannelMembershipsRequest: AWSChimeSDKMessagingListChannelMembershipsForAppInstanceUserRequest = AWSChimeSDKMessagingListChannelMembershipsForAppInstanceUserRequest()
        listChannelMembershipsRequest.appInstanceUserArn = appInstanceUserArn
        listChannelMembershipsRequest.chimeBearer = appInstanceUserArn
        listChannelMembershipsRequest.maxResults = 10

        awsChimeSDKMessagingClient?.listChannelMemberships(forAppInstanceUser: listChannelMembershipsRequest) { response, error in
            completion(response, error)
        }
    }
}
