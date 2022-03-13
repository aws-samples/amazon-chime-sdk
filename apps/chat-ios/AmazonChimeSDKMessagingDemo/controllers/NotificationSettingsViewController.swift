//
//  NotificationSettingsViewController.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import UIKit

class NotificationSettingsViewController: UIViewController {
    @IBOutlet var notificationLevelTable: UITableView!
    
    let notificationSettingsModel = NotificationSettingsModel()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        notificationLevelTable.dataSource = notificationSettingsModel
        notificationLevelTable.delegate = notificationSettingsModel
        notificationLevelTable.isMultipleTouchEnabled = false

        notificationSettingsModel.notificationLevelTableUpdatedHandler = { [weak self] in
            DispatchQueue.main.async {
                self?.notificationLevelTable.reloadData()
            }
        }
    }
    
    @IBAction func cancelButtonPressed(_ sender: UIBarButtonItem) {
        dismiss(animated: true, completion: nil)
    }
    
    @IBAction func saveButtonPressed(_ sender: UIBarButtonItem) {
        notificationSettingsModel.setChannelPreferences()
        dismiss(animated: true, completion: nil)
    }
}
