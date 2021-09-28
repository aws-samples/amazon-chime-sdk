//
//  AuthService.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Amplify
import AWSPluginsCore
import AWSAuthCore

class AuthService {
    static var currentUser: User?
    static var currentUserCredentials: ChimeUserCredentials?
    private static let TAG = "AuthService"
    
    static func signIn(username: String, password: String, signedInHandler: @escaping (Bool) -> Void) {
        Amplify.Auth.signIn(username: username, password: password) { result in
            switch result {
            case .success:
                print("\(TAG) sign in success")
                getAWSCredentials {
                    getCurrentUser {
                        signedInHandler(true)
                    }
                }
            case .failure(let error):
                print("\(TAG) sign in error \(error)")
                signedInHandler(false)
            }
        }
    }

    static func signOut(signedOutHandler: ((Bool) -> Void)?) {
        Amplify.Auth.signOut() { result in
            switch result {
            case .success:
                print("\(TAG) sign out success")
                signedOutHandler?(true)
            case .failure(let error):
                print("\(TAG) sign out error \(error)")
                signedOutHandler?(false)
            }
        }
    }

    private static func getAWSCredentials(completion: @escaping () -> Void) {
        Amplify.Auth.fetchAuthSession { result in
            do {
                let session = try result.get()
                // Get aws credentialss
                if let awsCredentialsProvider = session as? AuthAWSCredentialsProvider {
                    let credentials = try awsCredentialsProvider.getAWSCredentials().get() as? AuthAWSTemporaryCredentials
                    guard let creds = credentials else {
                        print("\(TAG) getAWSCredentials() credentials is nil")
                        return
                    }
                    self.currentUserCredentials = ChimeUserCredentials(accessKeyId: creds.accessKey,
                                                                       secretAccessKey: creds.secretKey,
                                                                       sessionToken: creds.sessionKey)
                    completion()
                } else {
                    print("\(TAG) getAWSCredentials() awsCredentialsProvider is nil")
                }
            } catch {
                print("\(TAG) getAWSCredentials() error \(error)")
            }
        }
    }

    private static func getCurrentUser(completion: @escaping () -> Void) {
        Amplify.Auth.fetchAuthSession { result in
            do {
                let session = try result.get()
                if let identityProvider = session as? AuthCognitoIdentityProvider {
                    let identityId = try identityProvider.getIdentityId().get()
                    
                    let userArn = "\(AppConfiguration.appInstanceArn)/user/\(identityId)"
                    self.currentUser = User(chimeDisplayName: Amplify.Auth.getCurrentUser()?.username ?? "unknown",
                                            chimeUserId: identityId,
                                            chimeAppInstanceUserArn: userArn)
                    completion()
                } else {
                    print("\(TAG) getCurrentUser() identityProvider is nil")
                }
            } catch {
                print("\(TAG) getCurrentUser() error - \(error)")
            }
        }
    }
    
    // The Credential Exchange Service is a small AWS Lambda function running behind Amazon API Gateway that enables
    // exchanging your application's or identity provider's (IDP) token for AWS credentials, or for you to implement
    // custom authentication.
    // https://github.com/aws-samples/amazon-chime-sdk/tree/main/apps/chat#credential-exchange-service
    // By default the AWS Lambda function returns anonymous access regardless of the token provided
    static func exchangeTokenForAwsCredential(accessToken: String, credentialExchanged: @escaping (Bool) -> Void) {
        let serviceUrl = "\(AppConfiguration.apiGatewayInvokeUrl)creds"
        let headers = ["Authorization" : "Bearer \(accessToken)"]
        HttpUtils.postRequest(url: serviceUrl,
                              jsonData: nil,
                              headers: headers) { (data, error) in
            if error != nil {
                print("\(TAG) exchangeTokenForAwsCredential() error: \(String(describing: error))")
                credentialExchanged(false)
            }
            if let data = data {
                do{
                    let credentialExchangeResponse = try JSONDecoder().decode(CredentialExchangeResponse.self,
                                                                              from: data)
                    self.currentUser = User(chimeDisplayName: credentialExchangeResponse.chimeDisplayName,
                                            chimeUserId: credentialExchangeResponse.chimeUserId,
                                            chimeAppInstanceUserArn: credentialExchangeResponse.chimeAppInstanceUserArn)
                    self.currentUserCredentials = credentialExchangeResponse.chimeCredentials
                    credentialExchanged(true)
                } catch {
                    print("\(TAG) exchangeTokenForAwsCredential() JSON parsing error: \(error)")
                }
            }
        }
    }
}
