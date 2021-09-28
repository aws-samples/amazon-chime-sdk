//
//  SettingsModel.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import AWSChimeSDKIdentity

class SettingsModel: NSObject {
    private let userArn = AuthService.currentUser?.chimeAppInstanceUserArn ?? ""
    private let chimeIdentityService = AWSChimeSDKIdentityService.shared
    private var userEndpoint: AWSChimeSDKIdentityAppInstanceUserEndpoint?
    private let TAG = "SettingsModel"
    
    func getCurrentUserEndpoint(completion: @escaping (Bool) -> Void) {
        let endpointId = Utils.getUserDefaultsString(forKey: K.endpointIdKey)
        chimeIdentityService.describeAppInstanceUserEndpoint(endpointId: endpointId, appInstanceUserArn: userArn) { response, error in
            if let error = error {
                print("\(self.TAG) getCurrentUserEndpoint() chimeIdentityService.describeAppInstanceUserEndpoint() error \(error)")
                return
            }
            guard let userEndpoint = response?.appInstanceUserEndpoint else {
                print("\(self.TAG) getCurrentUserEndpoint() chimeIdentityService.describeAppInstanceUserEndpoint() response is nil")
                return
            }
            self.userEndpoint = userEndpoint
            print("\(self.TAG) getCurrentUserEndpoint() userEndpoint.allowMessages \(userEndpoint.allowMessages.rawValue)")
            completion(userEndpoint.allowMessages != .none)
        }
    }
    
    func updateUserEndpoint(isSwitchStateOn: Bool) {
        guard let userEndpoint = userEndpoint else {
            print("\(TAG) updateUserEndpoint() userEndpoint is nil")
            return
        }
        let allowMessages = isSwitchStateOn ? AWSChimeSDKIdentityAllowMessages.all : .none
        
        chimeIdentityService.updateAppInstanceUserEndpoint(name: userEndpoint.name,
                                                           allowMessage: allowMessages,
                                                           endpointId: userEndpoint.endpointId,
                                                           appInstanceUserArn: userEndpoint.appInstanceUserArn) { response, error in
            if let error = error {
                print("\(self.TAG) updateUserEndpoint() chimeIdentityService.updateAppInstanceUserEndpoint() error \(error)")
            }
        }
    }
    
    func signOut() {
        clearUserDefaults()
        AuthService.signOut { success in
            if success {
                self.chimeIdentityService.deregisterAppInstanceUserEndpoint(endpointId: self.userEndpoint?.endpointId,appInstanceUserArn: self.userEndpoint?.appInstanceUserArn) { error in
                    if let error = error {
                        print("\(self.TAG) signOut() chimeIdentityService.deregisterAppInstanceUserEndpoint() error \(error)")
                    }
                }
                DispatchQueue.main.async {
                    let storyboard = UIStoryboard(name: "Main", bundle: nil)
                    let signinViewController = storyboard.instantiateViewController(identifier: K.signinViewControllerId)
                    (UIApplication.shared.connectedScenes.first?.delegate as? SceneDelegate)?.changeRootViewController(signinViewController)
                }
            } else {
                print("\(self.TAG) sign out failed")
            }
        }
    }
    
    private func clearUserDefaults() {
        Utils.removeUserDefaults(forKey: K.deviceTokenKey)
        Utils.removeUserDefaults(forKey: K.endpointIdKey)
        Utils.removeUserDefaults(forKey: K.usernameKey)
    }
}
