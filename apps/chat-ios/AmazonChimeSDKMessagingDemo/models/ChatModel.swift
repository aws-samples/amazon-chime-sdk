//
//  ChatModel.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import UIKit
import AWSPluginsCore
import AWSChimeSDKMessaging

class ChatModel: NSObject {
    private var chatMessages: [ChatMessage] = []
    private let chimeService = AWSChimeSDKMessagingService.shared
    private var session: MessagingSession?
    private let userArn = AuthService.currentUser?.chimeAppInstanceUserArn ?? ""
    private let userDisplayName = AuthService.currentUser?.chimeDisplayName ?? ""
    private let TAG = "ChatModel"

    var chatMessageCount: Int {
        get { return chatMessages.count }
    }
    var chatMessageTableUpdatedHandler: (() -> Void)?
    var channelName: String = String()
    var channelArn: String = String() {
        didSet {
            loadMessages()
        }
    }

    func startMessagingSession() {
        chimeService.getMessagingSessionEndpoint { endpointUrl in
            if let userCreds = AuthService.currentUserCredentials {
                self.connect(userCredentials: userCreds, endpoint: endpointUrl, userArn: self.userArn)
            } else {
                print("\(self.TAG) AuthService.currentUserCredentials is nil")
            }
        }
    }

    func stopMessagingSession() {
        session?.stop()
        session?.removeMessagingSessionObserver(observer: self)
    }

    func sendMessage(content: String, fileName: String = "", fileUrl: URL? = nil) {
        // mentionArray is array of strings where @mentions are extracted
        let mentionArray = content.mentions()
        let messageAttributeValue: AWSChimeSDKMessagingMessageAttributeValue = AWSChimeSDKMessagingMessageAttributeValue()
        messageAttributeValue.stringValues = mentionArray
        let messageAttributes = ["mention": messageAttributeValue]
        
        let pushConfig: AWSChimeSDKMessagingPushNotificationConfiguration = AWSChimeSDKMessagingPushNotificationConfiguration()
        pushConfig.title = channelName
        pushConfig.body = "\(userDisplayName): \(content)"
        pushConfig.types = .default
        
        // if no attachment
        if fileName.isEmpty {
            chimeService.sendChannelMessage(content: content,
                                     channelArn: channelArn,
                                     chimeBearer: userArn,
                                     messageAttributes: messageAttributes,
                                     pushNotification: pushConfig) { (response, error)  in
                if let error = error {
                    print("\(self.TAG) sendMessage() chimeService.sendChannelMessage() error \(error)")
                    return
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

                        let pair: [String: Any] = ["fileKey": fileKey, "name": fileName, "size": fileSize ?? "unknown"]
                        let metadata: [String: [Any]] = ["attachments": [pair]]

                        let metadataJSON = try JSONSerialization.data(withJSONObject: metadata, options: [])
                        let metadataStr = String(data: metadataJSON, encoding: .utf8)
                        self.chimeService.sendChannelMessage(content: content,
                                                      channelArn: self.channelArn,
                                                      chimeBearer: self.userArn,
                                                      metadata: metadataStr,
                                                      messageAttributes: messageAttributes,
                                                      pushNotification: pushConfig) { (response, error)  in
                            if let error = error {
                                print("\(self.TAG) sendMessage() chimeService.sendChannelMessage() error \(error)")
                                return
                            }
                            // TODO: update UI to mitigate attachment upload/download delay
                        }
                    } catch {
                        print("\(self.TAG) sendMessage() AttachmentService.upload() exception \(error)")
                    }
                } else {
                    print("\(self.TAG) sendMessage() AttachmentService.upload() failed")
                }
            }
        }
    }

    func addMessage(chatMessage: ChatMessage) {
        chatMessages.append(chatMessage)
    }
    
    // MARK: - Private Method
    // Get messages in the selected channel
    private func loadMessages() {
        if channelArn.isEmpty || userArn.isEmpty {
            print("\(TAG) loadMessages() channelArn or userArn is empty")
        } else {
            chimeService.listChannelMessages(channelArn: channelArn, chimeBearer: userArn) { (response, error)  in
                if let error = error {
                    print("\(self.TAG) loadMessages() error \(error)")
                    return
                }
                guard let response = response else { return }
                self.chatMessages =  response.channelMessages?.map { (messageSummary) -> ChatMessage in
                    var newMessage = ChatMessage(senderName: messageSummary.sender?.name ?? "unknown",
                                                 content: messageSummary.content ?? "",
                                                 displayTime: Utils.formatDateToDisplayTime(with: messageSummary.createdTimestamp),
                                                 isSelf: messageSummary.sender?.arn == self.userArn,
                                                 imageUrl: nil)
                    if messageSummary.metadata != nil {
                        newMessage.displayAttachmentHolder = true
                    }
                    return newMessage
                } ?? []
                self.chatMessages.reverse()
                self.chatMessageTableUpdatedHandler?()
            }
        }
    }

    // Establish a WebSocket connect
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
            let displayTime = Utils.formatTimestamp(with: payload.createdTimestamp)
            
            if self.channelArn != payload.channelArn {
                print("\(TAG) processChannelMessage() currently the demo will only process messages sent to the selected channel")
                return
            }
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
                        self.chatMessageTableUpdatedHandler?()
                    }
                } else {
                    print("\(TAG) processChannelMessage() the metadata does not contain attachments")
                }
            } else {
                // process message that has no metadata
                let newMessage = ChatMessage(senderName: payload.sender.name,
                                             content: payload.content,
                                             displayTime: displayTime,
                                             isSelf: payload.sender.arn == self.userArn,
                                             imageUrl: nil)
                addMessage(chatMessage: newMessage)
                self.chatMessageTableUpdatedHandler?()
            }
        } catch {
            print("\(TAG) processChannelMessage() JSON parse error: \(error)")
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
                print("\(self.TAG) fetchAttachment() AttachmentService.download() download attachment failed")
            }
        }
        
    }
}

extension ChatModel: UITableViewDataSource, UITableViewDelegate {
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
}

extension ChatModel: MessagingSessionObserver {
    func onMessagingSessionStarted() {
        print("\(TAG) MessagingSessionObserver onMessagingSessionStarted()")
    }

    func onMessagingSessionConnecting(reconnecting: Bool) {
        print("\(TAG) MessagingSessionObserver onMessagingSessionConnecting() reconnecting \(reconnecting)")
    }

    func onMessagingSessionStopped(status: MessagingSessionStatus) {
        print("\(TAG) MessagingSessionObserver onMessagingSessionStopped() code \(status.code), reason \(status.reason)")
    }

    func onMessagingSessionMessageReceived(message: Message) {
        let type = message.headers[K.headerChimeEventType]
        switch type {
        case "CREATE_CHANNEL_MESSAGE", "DELETE_CHANNEL_MESSAGE", "UPDATE_CHANNEL_MESSAGE", "REDACT_CHANNEL_MESSAGE":
            processChannelMessage(message: message)
        case "SESSION_ESTABLISHED":
            print("\(TAG) onMessagingSessionMessageReceived() type: \(String(describing: type))")
        default:
            print("\(TAG) onMessagingSessionMessageReceived() type: \(String(describing: type)), unexpected message type, ignoring")
        }
    }
}
