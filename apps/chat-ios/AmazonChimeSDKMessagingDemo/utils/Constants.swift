//
//  Constants.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import Foundation

struct K {
    static let awsChimeSDKMessagingClientKey = "USEast1Chime"
    static let awsChimeSDKIdentityClientKey = "USEast1ChimeSDKIdentity"
    static let headerChimeEventType = "x-amz-chime-event-type"
    
    static let notificationLevelFull = "Full"
    static let notificationLevelFullDes = "Notifications for all messages activity"
    static let notificationLevelNormal = "Normal"
    static let notificationLevelNormalDes = "Notifications only when you are @mentioned"
    static let notificationLevelMute = "Mute"
    static let notificationLevelMuteDes = "No notifications"
    
    // UserDefaults
    static let deviceTokenKey = "DEVICE_TOKEN"
    static let endpointIdKey = "ENDPOINT_ID"
    static let usernameKey = "USERNAME"
    
    // Storyboard ids
    static let channelCellId = "ChannelCell"
    static let notificationLevelCellId = "NotificationLevelCell"
    static let tabBarControllerId = "TabBarController"
    static let signinViewControllerId = "SigninViewController"
    
    static let segueNavigateToChatViewId = "navigateToChatView"
    static let segueNavigateToNotificationSettingsViewId = "navigateToNotificationSettingsView"
    
    // Constants in UI
    static let loggedInLabel = "Logged in as"
    static let channelSettingsAlertTitle = "Additional Options"
    static let channelSettingsAlertNotificationSettings = "Notification settings"
    static let channelSettingsAlertCancel = "Cancel"
    
}
