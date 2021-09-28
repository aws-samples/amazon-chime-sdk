//
//  AWSChimeSDKService.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import AWSChimeSDKMessaging
import AWSPluginsCore

class AWSChimeSDKMessagingService {

    static let shared = AWSChimeSDKMessagingService()
    private var awsChimeSDKMessagingClient: AWSChimeSDKMessaging?
    private let TAG = "AWSChimeSDKMessagingService"

    private init() {
        guard let credentials = AuthService.currentUserCredentials else {
            print("\(TAG) init() current user credentials is nil")
            return
        }
        let credentialsProvider = AWSBasicSessionCredentialsProvider(accessKey: credentials.accessKeyId,
                                                                     secretKey: credentials.secretAccessKey,
                                                                     sessionToken: credentials.sessionToken)
        if let configuration = AWSServiceConfiguration(region: .USEast1, credentialsProvider: credentialsProvider) {
            AWSChimeSDKMessaging.register(with: configuration, forKey: K.awsChimeSDKMessagingClientKey)
            awsChimeSDKMessagingClient = AWSChimeSDKMessaging(forKey: K.awsChimeSDKMessagingClientKey)
        } else {
            print("\(TAG) init() configuration is nil")
        }
    }

    func getMessagingSessionEndpoint(completion: @escaping (String) -> Void) {
        self.awsChimeSDKMessagingClient?.getSessionEndpoint(AWSChimeSDKMessagingGetMessagingSessionEndpointRequest()).continueWith(block: { (task) -> Void in
            if let error = task.error {
                print("\(self.TAG) getMessagingSessionEndpoint() error: \(error)")
                return
            }
            if let endpointUrl = task.result?.endpoint?.url {
                completion(endpointUrl)
            }
        })
    }

    // use metadata to send attachment
    func sendChannelMessage(content: String,
                     channelArn: String,
                     chimeBearer: String,
                     metadata: String? = nil,
                     messageAttributes: [String: AWSChimeSDKMessagingMessageAttributeValue],
                     pushNotification: AWSChimeSDKMessagingPushNotificationConfiguration,
                     completion: @escaping (AWSChimeSDKMessagingSendChannelMessageResponse?, Error?) -> Void) {
        let request: AWSChimeSDKMessagingSendChannelMessageRequest = AWSChimeSDKMessagingSendChannelMessageRequest()
        request.channelArn = channelArn
        request.content = content
        request.chimeBearer = chimeBearer
        request.persistence = AWSChimeSDKMessagingChannelMessagePersistenceType.persistent
        request.types = AWSChimeSDKMessagingChannelMessageType.standard
        request.messageAttributes = messageAttributes
        request.pushNotification = pushNotification
        request.clientRequestToken = UUID().uuidString
        if let metadata = metadata {
            request.metadata = metadata
        }

        awsChimeSDKMessagingClient?.sendChannelMessage(request) { response, error  in
            completion(response, error)
        }
    }

    func listChannelsForUser(appInstanceUserArn: String,
                          completion: @escaping (AWSChimeSDKMessagingListChannelMembershipsForAppInstanceUserResponse?, Error?) -> Void) {
        let listChannelMembershipsRequest: AWSChimeSDKMessagingListChannelMembershipsForAppInstanceUserRequest = AWSChimeSDKMessagingListChannelMembershipsForAppInstanceUserRequest()
        listChannelMembershipsRequest.appInstanceUserArn = appInstanceUserArn
        listChannelMembershipsRequest.chimeBearer = appInstanceUserArn
        listChannelMembershipsRequest.maxResults = 20

        awsChimeSDKMessagingClient?.listChannelMemberships(forAppInstanceUser: listChannelMembershipsRequest) { response, error in
            completion(response, error)
        }
    }
    
    func listChannelMessages(channelArn: String, chimeBearer: String, completion: @escaping (AWSChimeSDKMessagingListChannelMessagesResponse?, Error?) -> Void) {
        let listChannelMessagesRequest: AWSChimeSDKMessagingListChannelMessagesRequest = AWSChimeSDKMessagingListChannelMessagesRequest()
        listChannelMessagesRequest.channelArn = channelArn
        listChannelMessagesRequest.chimeBearer = chimeBearer
        listChannelMessagesRequest.maxResults = 20
        
        awsChimeSDKMessagingClient?.listChannelMessages(listChannelMessagesRequest) { response, error in
            completion(response, error)
        }
    }
    
    func getChannelMembershipPreferences(channelArn: String,
                                         chimeBearer: String,
                                         completion: @escaping (AWSChimeSDKMessagingGetChannelMembershipPreferencesResponse?, Error?) -> Void) {
        let request: AWSChimeSDKMessagingGetChannelMembershipPreferencesRequest = AWSChimeSDKMessagingGetChannelMembershipPreferencesRequest()
        request.channelArn = channelArn
        request.chimeBearer = chimeBearer
        request.memberArn = chimeBearer
        
        awsChimeSDKMessagingClient?.getChannelMembershipPreferences(request) { response, error in
            completion(response, error)
        }
    }
    
    func putChannelMembershipPreferences(channelArn: String,
                                         chimeBearer: String,
                                         preferences: AWSChimeSDKMessagingChannelMembershipPreferences,
                                         completion: @escaping (AWSChimeSDKMessagingPutChannelMembershipPreferencesResponse?, Error?) -> Void) {
        let request: AWSChimeSDKMessagingPutChannelMembershipPreferencesRequest = AWSChimeSDKMessagingPutChannelMembershipPreferencesRequest()
        request.channelArn = channelArn
        request.chimeBearer = chimeBearer
        request.memberArn = chimeBearer
        request.preferences = preferences
        
        awsChimeSDKMessagingClient?.putChannelMembershipPreferences(request) { response, error in
            completion(response, error)
        }
    }
}
