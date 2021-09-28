//
//  ChannelTableViewController.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import UIKit
import AWSChimeSDKMessaging

class ChannelTableViewController: UITableViewController {
    
    private var channels = [AWSChimeSDKMessagingChannelSummary]()
    private let userArn = AuthService.currentUser?.chimeAppInstanceUserArn ?? ""
    private let chimeMessagingService = AWSChimeSDKMessagingService.shared
    private let chimeIdentityService = AWSChimeSDKIdentityService.shared
    private let TAG = "ChannelTableViewController"
    
    let delegate = UIApplication.shared.delegate as! AppDelegate

    override func viewDidLoad() {
        super.viewDidLoad()
        registerForPushNotifications()
        loadChannels()
    }

    // MARK: - TableView Data Source
    override func numberOfSections(in tableView: UITableView) -> Int {
        return 1
    }

    override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return channels.count
    }

    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: K.channelCellId, for: indexPath)
        cell.textLabel?.text = channels[indexPath.row].name
        return cell
    }
    
    // MARK: - TableView Delegate
    override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        performSegue(withIdentifier: K.segueNavigateToChatViewId, sender: self)
    }
    
    // MARK: - Private Methods
    private func loadChannels() {
        chimeMessagingService.listChannelsForUser(appInstanceUserArn: userArn) { response, error in
            if let error = error {
                print("\(self.TAG) loadChannels() chimeMessagingService.listChannelsForUser() error \(error)")
                return
            }
            guard let response = response else {
                print("\(self.TAG) loadChannels() chimeMessagingService.listChannelsForUser() response is nil")
                return
            }
            
            if let channels = response.channelMemberships {
                for channel in channels {
                    if let channelSummary = channel.channelSummary {
                        self.channels.append(channelSummary)
                    }
                }
            }
            DispatchQueue.main.async {
                self.tableView.reloadData()
            }
        }
    }
    
    // Register for push notifications using Amazon Chime Identity SDK
    // When the app is installed or device token changes
    private func registerForPushNotifications() {
        guard let deviceToken = delegate.deviceToken else {
            print("\(TAG) registerForPushNotification() no device token")
            return
        }
        
        // if there is no previous device token, or deivce token is updated
        // register the current device token for an endpoint id and store them in UserDefaults
        if let previousDeviceToken = Utils.getUserDefaultsString(forKey: K.deviceTokenKey), deviceToken == previousDeviceToken {
            print("\(TAG) registerForPushNotification() device token not changed")
        } else {
            chimeIdentityService.registerAppInstanceUserEndpoint(deviceToken: deviceToken, appInstanceUserArn: userArn) { response, error in
                if let error = error {
                    print("\(self.TAG) registerForPushNotification() chimeIdentityService.registerAppInstanceUserEndpoint error \(error)")
                    return
                }
                guard let response = response else {
                    print("\(self.TAG) registerForPushNotification() chimeIdentityService.registerAppInstanceUserEndpoint response is nil")
                    return
                }
                Utils.setUserDefaultsString(value: deviceToken, forKey: K.deviceTokenKey)
                Utils.setUserDefaultsString(value: response.endpointId, forKey: K.endpointIdKey)
            }
        }
    }

    // MARK: - Navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        let chatViewController = segue.destination as! ChatViewController
        if let indexPath = tableView.indexPathForSelectedRow,
           let selectedChannelName = channels[indexPath.row].name,
           let selectedChannelArn = channels[indexPath.row].channelArn {
            chatViewController.chatModel.channelArn = selectedChannelArn
            chatViewController.chatModel.channelName = selectedChannelName
            let backButtonItem = UIBarButtonItem()
            backButtonItem.title = ""
            navigationItem.backBarButtonItem = backButtonItem
        }
    }
}
