//  ChatViewController.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import UIKit
import AWSCore
import AWSPluginsCore

class ChatViewController: UIViewController {

    @IBOutlet var chatView: UIView!
    @IBOutlet var chatMessageTable: UITableView!
    @IBOutlet var inputBox: UIView!
    @IBOutlet var inputText: UITextField!
    @IBOutlet var sendMessageButton: UIButton!
    @IBOutlet var attachButton: UIButton!
    @IBOutlet var attachmentFileNameLabel: UILabel!
    @IBOutlet var attachmentDeleteButton: UIButton!
    @IBOutlet var inputBoxBottomConstrain: NSLayoutConstraint!

    let chatModel = ChatModel()

    // attachment
    let imagePicker = UIImagePickerController()
    var fileName: String = ""
    var fileUrl: URL? = nil

    override func viewDidLoad() {
        super.viewDidLoad()

        // deletates
        imagePicker.delegate = self
        chatMessageTable.delegate = chatModel
        chatMessageTable.dataSource = chatModel
        inputText.delegate = self

        navigationItem.title = chatModel.channelName
        chatMessageTable.separatorStyle = .none
        sendMessageButton.isEnabled = false
        setupHideKeyboardOnTap()
        registerForKeyboardNotifications()

        chatModel.chatMessageTableUpdatedHandler = { [weak self] in
            DispatchQueue.main.async {
                self?.chatMessageTable.reloadData()
                // scroll to bottom of the table automatically
                if let count = self?.chatModel.chatMessageCount {
                    if count > 0 {
                        let indexPath = IndexPath(item: count - 1, section: 0)
                        self?.chatMessageTable.scrollToRow(at: indexPath, at: .bottom, animated: true)
                    }
                }
            }
        }

        chatModel.startMessagingSession()
    }
    
    deinit {
        chatModel.stopMessagingSession()
        deregisterFromKeyboardNotifications()
    }

    // MARK: - IBAction functions
    @IBAction func inputTextChanged(_ sender: Any) {
        guard let text = inputText.text else {
            return
        }
        sendMessageButton.isEnabled = !text.isEmpty
    }

    @IBAction func attachButtonPressed(_ sender: UIButton) {
        imagePicker.allowsEditing = false
        imagePicker.sourceType = .photoLibrary
        present(imagePicker, animated: true, completion: nil)
    }

    @IBAction func attachmentDeleteButtonPressed(_ sender: UIButton) {
        deleteAttachment()
    }

    @IBAction func sendButtonPressed(_ sender: UIButton) {
        let messageToSend = inputText.text!.trimmingCharacters(in: .whitespacesAndNewlines)
        if messageToSend.isEmpty {
            return
        }
        if fileName.isEmpty {
            chatModel.sendMessage(content: messageToSend)
        } else {
            chatModel.sendMessage(content: messageToSend, fileName: fileName, fileUrl: fileUrl)
        }

        inputText.text = ""
        sendMessageButton.isEnabled = false
        deleteAttachment()
    }

    @IBAction func settingsBarButtonPressed(_ sender: UIBarButtonItem) {
        let optionMenu = UIAlertController(title: K.channelSettingsAlertTitle, message: "", preferredStyle: .actionSheet)
        
        let notificationSettinsAction = UIAlertAction(title: K.channelSettingsAlertNotificationSettings, style: .default) { _ in
            self.performSegue(withIdentifier: K.segueNavigateToNotificationSettingsViewId, sender: self)
        }
        
        let cancelAction = UIAlertAction(title: K.channelSettingsAlertCancel, style: .cancel)
        optionMenu.addAction(cancelAction)
        
        optionMenu.addAction(notificationSettinsAction)
        present(optionMenu, animated: true, completion: nil)
    }
    
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        let notificationSettingsVC = segue.destination as! NotificationSettingsViewController
        notificationSettingsVC.notificationSettingsModel.channelArn = chatModel.channelArn
    }

    // MARK: - Private Methods
    private func addAttachment(fileName: String, fileUrl: URL) {
        self.fileName = fileName
        self.fileUrl = fileUrl
        attachmentFileNameLabel.text = fileName
        attachmentDeleteButton.isHidden = false
    }

    private func deleteAttachment() {
        fileName = ""
        fileUrl = nil
        attachmentFileNameLabel.text = fileName
        attachmentDeleteButton.isHidden = true
    }

    private func registerForKeyboardNotifications() {
        // Adding notifies on keyboard appearing
        NotificationCenter
            .default
            .addObserver(self,
                         selector: #selector(keyboardShowHandler),
                         name: UIResponder.keyboardDidShowNotification, object: nil)
        NotificationCenter
            .default
            .addObserver(self,
                         selector: #selector(keyboardHideHandler),
                         name: UIResponder.keyboardWillHideNotification,
                         object: nil)
    }

    private func deregisterFromKeyboardNotifications() {
        // Removing notifies on keyboard appearing
        NotificationCenter
            .default
            .removeObserver(self, name: UIResponder.keyboardWillShowNotification, object: nil)
        NotificationCenter
            .default
            .removeObserver(self, name: UIResponder.keyboardWillHideNotification, object: nil)
    }

    @objc private func keyboardShowHandler(notification: NSNotification) {
        // Need to calculate keyboard exact size due to Apple suggestions
        guard let info: NSDictionary = notification.userInfo as NSDictionary? else {
            return
        }
        guard let keyboardSize = (info[UIResponder.keyboardFrameEndUserInfoKey] as? NSValue)?.cgRectValue.size else {
            return
        }

        let viewHeight = view.frame.size.height
        let realOrigin = chatView.convert(inputBox.frame.origin, to: view)
        let inputBoxDistanceToBottom = viewHeight - realOrigin.y - inputBox.frame.height
        self.inputBoxBottomConstrain.constant = keyboardSize.height - inputBoxDistanceToBottom + 10
    }

    @objc private func keyboardHideHandler(notification _: NSNotification) {
        self.inputBoxBottomConstrain.constant = 0
    }
}

extension ChatViewController: UITextFieldDelegate {
    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        textField.resignFirstResponder()
        return true
    }
}

extension ChatViewController: UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
        if let imageUrl = info[UIImagePickerController.InfoKey.imageURL] as? URL {
            addAttachment(fileName: imageUrl.lastPathComponent, fileUrl: imageUrl)
        }
        dismiss(animated: true, completion: nil)
    }
}
