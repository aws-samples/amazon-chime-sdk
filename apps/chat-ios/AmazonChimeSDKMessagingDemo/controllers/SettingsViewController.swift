//
//  SettingsViewController.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import UIKit

class SettingsViewController: UIViewController {
    @IBOutlet var loginAsLabel: UILabel!
    @IBOutlet var pushNotificationsSwitch: UISwitch!
    
    let settingsModel = SettingsModel()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        loginAsLabel.text = "\(K.loggedInLabel) \(AuthService.currentUser?.chimeDisplayName ?? "unknown")"
        settingsModel.getCurrentUserEndpoint { isSwitchStateOn in
            DispatchQueue.main.async {
                self.pushNotificationsSwitch.setOn(isSwitchStateOn, animated: true)
            }
        }
    }
    
    @IBAction func pushNotificationsSwitchPressed(_ sender: Any) {
        settingsModel.updateUserEndpoint(isSwitchStateOn: pushNotificationsSwitch.isOn)
    }
    
    @IBAction func signOutButtonPressed(_ sender: UIButton) {
        settingsModel.signOut()
    }
}
