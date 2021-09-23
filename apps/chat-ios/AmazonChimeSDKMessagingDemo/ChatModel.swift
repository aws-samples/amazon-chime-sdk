//
//  ChatModel.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import UIKit
import AWSPluginsCore

class ChatModel: NSObject, UITableViewDelegate, UITableViewDataSource, MessagingSessionObserver {
    var chatMessages: [ChatMessage] = []
    private let chimeService = AWSChimeSDKService()
    private var session: MessagingSession?
    private var channelArn: String = ""
    private let userArn = AuthService.currentUser?.chimeAppInstanceUserArn ?? ""

    var messageUpdatedHandler: (() -> Void)?

    func startMessagingSession() {
        chimeService.initialize()
        chimeService.getMessagingEndpoint { endpointUrl in
            if let userCreds = AuthService.currentUserCredentials {
                self.connect(userCredentials: userCreds, endpoint: endpointUrl, userArn: self.userArn)
            } else {
                print("ChatModel AuthService.currentUserCredentials is nil")
            }
        }
        setDefaultChannel()
    }

    func stopMessagingSession() {
        session?.stop()
        session?.removeMessagingSessionObserver(observer: self)
    }

    func sendMessage(content: String, fileName: String = "", fileUrl: URL? = nil) {
        // if no attachment
        if fileName.isEmpty {
            chimeService.sendMessage(content: content,
                                     channel: channelArn,
                                     chimeBearer: userArn) { (response, error)  in
                if let error = error {
                    print("ChatModel sendMessage() error \(error)")
                    return
                }
                if let response = response {
                    print("ChatModel sendMessage() message ID \(String(describing: response.messageId))")
                }
            }
        } else {
            // upload attachment, put attachment info in metadata
            guard let fileUrl = fileUrl else {
                return
            }
            AttachmentService.upload(fileName: fileName, fileUrl: fileUrl) { (success, fileKey) in
                if success {
                    do {
                        let resources = try fileUrl.resourceValues(forKeys:[.fileSizeKey])
                        let fileSize = resources.fileSize
                        print("ChatModel sendMessage() upload callback fileKey \(fileKey), fileSize \(String(describing: fileSize))")

                        let pair: [String: Any] = ["fileKey": fileKey, "name": fileName, "size": fileSize ?? "unknown"]
                        let metadata: [String: [Any]] = ["attachments": [pair]]

                        let metadataJSON = try JSONSerialization.data(withJSONObject: metadata, options: [])
                        let metadataStr = String(data: metadataJSON, encoding: .utf8)
                        self.chimeService.sendMessage(content: content,
                                                      channel: self.channelArn,
                                                      chimeBearer: self.userArn,
                                                      metadata: metadataStr) { (response, error)  in
                            if let error = error {
                                print("ChatModel sendMessage() error \(error)")
                                return
                            }
                            if let response = response {
                                // TODO: update UI to mitigate attachment upload/download delay
                                print("ChatModel sendMessage() message ID \(String(describing: response.messageId))")
                            }
                        }
                    } catch {
                        print("ChatModel AttachmentService.upload() callback failed")
                    }
                } else {
                    print("ChatModel AttachmentService.upload failed")
                }
            }
        }
    }

    func addMessage(chatMessage: ChatMessage) {
        chatMessages.append(chatMessage)
    }

    // MARK: - UITableViewDelegate and UITableViewDataSource
    func numberOfSections(in tableView: UITableView) -> Int {
        return 1
    }

    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return chatMessages.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let message = chatMessages[indexPath.row]

        guard let cell = tableView.dequeueReusableCell(withIdentifier: chatMessageCellReuseIdentifier, for: indexPath) as? ChatMessageTableViewCell else {
            return ChatMessageTableViewCell(chatMessage: message)
        }
        cell.updateCell(chatMessage: message)
        return cell
    }

    // MARK: - MessagingSessionObserver
    func onMessagingSessionStarted() {
        print("ChatModel MessagingSessionObserver onMessagingSessionStarted")
    }

    func onMessagingSessionConnecting(reconnecting: Bool) {
        print("ChatModel MessagingSessionObserver onMessagingSessionConnecting")
    }

    func onMessagingSessionStopped(status: MessagingSessionStatus) {
        print("ChatModel MessagingSessionObserver onMessagingSessionStopped code \(status.code), reason \(status.reason)")
    }

    func onMessagingSessionMessageReceived(message: Message) {
        let type = message.headers[Constants.headerChimeEventType]
        switch type {
        case "CREATE_CHANNEL_MESSAGE", "DELETE_CHANNEL_MESSAGE", "UPDATE_CHANNEL_MESSAGE", "REDACT_CHANNEL_MESSAGE":
            processChannelMessage(message: message)
        case "SESSION_ESTABLISHED":
            print("ChatModel onMessagingSessionMessageReceived: System message")
        default:
            print("ChatModel onMessagingSessionMessageReceived: Unexpected message type, ignoring")
        }
    }

    private func connect(userCredentials: ChimeUserCredentials, endpoint: String, userArn: String) {
        let sessionConfiguration = MessagingSessionConfiguration(userArn: userArn,
                                                                 endpointUrl: endpoint,
                                                                 region: AppConfiguration.region,
                                                                 credentials: userCredentials)
        session = DefaultMessagingSession(configuration: sessionConfiguration)
        session?.addMessagingSessionObserver(observer: self)
        session?.start()
    }

    private func processChannelMessage(message: Message) {
        do {
            guard let payloadStr = message.payload else {
                return
            }
            
            let payload = try JSONDecoder().decode(Payload.self, from: Data(payloadStr.utf8))
            let displayTime = Utils.formatTimestamp(timestamp: payload.createdTimestamp)
            self.channelArn = payload.channelArn
            // process message that contains metadata
            if let metadata = payload.metadata {
                if let attachments = metadata.attachments, attachments.count > 0 {
                    let userId = "\(AppConfiguration.region):\(Utils.getUserIdFromArn(arn: payload.sender.arn))"
                    fetchAttachment(attachment: attachments[0], userId: userId) {fileDestinationPath in
                        let newMessage = ChatMessage(senderName: payload.sender.name,
                                                     content: payload.content,
                                                     displayTime: displayTime,
                                                     isSelf: payload.sender.arn == self.userArn,
                                                     imageUrl: fileDestinationPath)
                        self.addMessage(chatMessage: newMessage)
                        DispatchQueue.main.async {
                            self.messageUpdatedHandler?()
                        }
                    }
                } else {
                    print("ChatModel processChannelMessage() the metadata does not contain attachments")
                }
            } else {
                // process message that has no metadata
                let newMessage = ChatMessage(senderName: payload.sender.name,
                                             content: payload.content,
                                             displayTime: displayTime,
                                             isSelf: payload.sender.arn == self.userArn,
                                             imageUrl: nil)
                addMessage(chatMessage: newMessage)
                DispatchQueue.main.async {
                    self.messageUpdatedHandler?()
                }
            }
        } catch {
            print("ChatModel processChannelMessage() JSON parse error: \(error)")
        }
    }
    
    private func fetchAttachment(attachment: Attachment, userId: String, completion: @escaping (_ fileDestinationPath: URL) -> Void) {
        let name = attachment.name
        let fileKey = attachment.fileKey
        let fileDestinationPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0].appendingPathComponent(name)
        
        AttachmentService.download(key: fileKey, url: fileDestinationPath, userId: userId) { success in
            if success {
                completion(fileDestinationPath)
            } else {
                print("ChatModel fetchAttachment AttachmentService.download() download attachment failed")
            }
        }
        
    }

    // When the messaaging session starts, it fetches a list of channels the AppInstanceUser is a part of.
    // It sets the channelArn to the first channel of the list so that messages will be sent to it by default.
    // The channelArn will be updated to the channel in which the most recent message is sent
    private func setDefaultChannel() {
        chimeService.listChannels(appInstanceUserArn: userArn) { response, error in
            if let error = error {
                print("ChatModel setDefaultChannel() chimeService.listChannels() error \(error)")
                return
            }
            guard let response = response else {
                print("ChatModel setDefaultChannel() chimeService.listChannels() response is nil")
                return
            }
            if response.channelMemberships?.count ?? 0 > 0 {
                if let channel = response.channelMemberships?.first?.channelSummary?.channelArn {
                    self.channelArn = channel
                } else {
                    print("ChatModel setDefaultChannel() chimeService.listChannels() cannot get channelArn")
                }
            } else {
                print("ChatModel setDefaultChannel() chimeService.listChannels() the user is not part of any channel")
            }
        }
    }
}
