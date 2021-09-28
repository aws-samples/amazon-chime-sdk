//
//  NotificationSettingsModel.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import UIKit
import AWSChimeSDKMessaging

class NotificationSettingsModel: NSObject {
    private let currentUser = AuthService.currentUser
    private var selectedLevelTitle = "Full"
    private let chimeMessagingService = AWSChimeSDKMessagingService.shared
    private let TAG = "NotificationSettingsModel"
    
    let notificationLevels: [NotificationLevel] = [
        NotificationLevel(title: K.notificationLevelFull, subtitle: K.notificationLevelFullDes),
        NotificationLevel(title: K.notificationLevelNormal, subtitle: K.notificationLevelNormalDes),
        NotificationLevel(title: K.notificationLevelMute, subtitle: K.notificationLevelMuteDes)
    ]
    var channelArn: String = String() {
        didSet {
            if let currentUserArn = currentUser?.chimeAppInstanceUserArn {
                getChannelPreferences(channelArn: channelArn, userArn: currentUserArn)
            } else {
                print("\(TAG) currentUserArn is nil")
            }
        }
    }
    var notificationLevelTableUpdatedHandler: (() -> Void)?
    
    func getChannelPreferences(channelArn: String, userArn: String) {
        chimeMessagingService.getChannelMembershipPreferences(channelArn: channelArn, chimeBearer: userArn) { (response, error) in
            if let error = error {
                print("\(self.TAG) getChannelPreferences() chimeMessagingService.getChannelMembershipPreferences() error \(error)")
                return
            }
            guard let response = response else {
                print("\(self.TAG) getChannelPreferences() chimeMessagingService.getChannelMembershipPreferences() response is nil")
                return
            }
            if let allowNotification = response.preferences?.pushNotifications?.allowNotifications {
                print("\(self.TAG) getChannelPreferences() preferences.pushNotifications.allowNotification: \(allowNotification.rawValue)")
                switch allowNotification {
                case .all:
                    self.selectedLevelTitle = K.notificationLevelFull
                case .filtered:
                    self.selectedLevelTitle = K.notificationLevelNormal
                case .none:
                    self.selectedLevelTitle = K.notificationLevelMute
                default:
                    break
                }
                self.notificationLevelTableUpdatedHandler?()
            } else {
                print("\(self.TAG) getChannelPreferences() chimeMessagingService.getChannelMembershipPreferences() allowNotifications is nil")
            }
        }
    }
    
    func setChannelPreferences() {
        guard let currentUser = currentUser else {
            print("\(self.TAG) currentUser is nil")
            return
        }
        let pushNotificationsPreferences: AWSChimeSDKMessagingPushNotificationPreferences = AWSChimeSDKMessagingPushNotificationPreferences()
        if selectedLevelTitle == K.notificationLevelFull {
            pushNotificationsPreferences.allowNotifications = .all
        } else if selectedLevelTitle == K.notificationLevelNormal {
            pushNotificationsPreferences.allowNotifications = .filtered
            pushNotificationsPreferences.filterRule = "{\"mention\":[\"@\(currentUser.chimeDisplayName)\"]}"
        } else if selectedLevelTitle == K.notificationLevelMute {
            pushNotificationsPreferences.allowNotifications = .none
        }
        
        let channelPreferences: AWSChimeSDKMessagingChannelMembershipPreferences = AWSChimeSDKMessagingChannelMembershipPreferences()
        channelPreferences.pushNotifications = pushNotificationsPreferences
            
        chimeMessagingService.putChannelMembershipPreferences(channelArn: channelArn, chimeBearer: currentUser.chimeAppInstanceUserArn, preferences: channelPreferences) { response, error in
            if let error = error {
                print("\(self.TAG) setChannelPreferences() chimeMessagingService.putChannelMembershipPreferences() error \(error)")
                return
            }
            if response == nil {
                print("\(self.TAG) setChannelPreferences() chimeMessagingService.putChannelMembershipPreferences() response is nil")
            }
        }
    }
}

extension NotificationSettingsModel: UITableViewDataSource {
    func numberOfSections(in tableView: UITableView) -> Int {
        return 1
    }

    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return notificationLevels.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let level = notificationLevels[indexPath.row]
        let cell = tableView.dequeueReusableCell(withIdentifier: K.notificationLevelCellId, for: indexPath)
        cell.textLabel?.text = level.title
        cell.detailTextLabel?.text = level.subtitle
        if selectedLevelTitle == level.title {
            cell.isSelected = true
            cell.accessoryType = .checkmark
        } else {
            cell.accessoryType = .none
        }
        return cell
    }
}

extension NotificationSettingsModel: UITableViewDelegate {
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        if let selectedRow = tableView.indexPathForSelectedRow?.row {
            let selectedLevel = notificationLevels[selectedRow]
            selectedLevelTitle = selectedLevel.title
            tableView.reloadData()
        }
        tableView.deselectRow(at: indexPath, animated: true)
    }
}
