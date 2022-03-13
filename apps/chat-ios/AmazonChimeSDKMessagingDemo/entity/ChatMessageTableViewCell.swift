//
//  ChatMessageTableViewCell.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import UIKit

let chatMessageCellReuseIdentifier: String = "ChatMessageCell"

class ChatMessageTableViewCell: UITableViewCell {
    @IBOutlet var senderNameLabel: UILabel!
    @IBOutlet var displayTimeLabel: UILabel!
    @IBOutlet var contentLabel: UILabel!
    @IBOutlet var attachmentPreviewImageRight: UIImageView!
    @IBOutlet var attachmentPreviewImageLeft: UIImageView!
    
    init(chatMessage: ChatMessage) {
        super.init(style: .default, reuseIdentifier: chatMessageCellReuseIdentifier)
        self.updateCell(chatMessage: chatMessage)
    }

    func updateCell(chatMessage: ChatMessage) {
        reset()
        senderNameLabel.text = chatMessage.senderName
        senderNameLabel.accessibilityIdentifier = chatMessage.senderName
        contentLabel.text = chatMessage.content
        contentLabel.accessibilityIdentifier = chatMessage.content
        displayTimeLabel.text = chatMessage.displayTime
        
        if chatMessage.isSelf {
            senderNameLabel.textAlignment = .right
            displayTimeLabel.textAlignment = .right
            contentLabel.textAlignment = .right
        } else {
            senderNameLabel.textAlignment = .left
            displayTimeLabel.textAlignment = .left
            contentLabel.textAlignment = .left
        }
        
        if chatMessage.displayAttachmentHolder {
            let config = UIImage.SymbolConfiguration(scale: .small)
            let imageHolder = UIImage(systemName: "paperclip", withConfiguration: config)
            if chatMessage.isSelf {
                attachmentPreviewImageRight.image = imageHolder
                attachmentPreviewImageRight.contentMode = .center
                attachmentPreviewImageLeft.isHidden = true
            } else {
                attachmentPreviewImageLeft.image = imageHolder
                attachmentPreviewImageLeft.contentMode = .center
                attachmentPreviewImageRight.isHidden = true
            }
        }

        if let imageUrl = chatMessage.imageUrl {
            do {
                let imageData = try Data(contentsOf: imageUrl)
                if chatMessage.isSelf {
                    attachmentPreviewImageRight.image = UIImage(data: imageData)
                    attachmentPreviewImageLeft.isHidden = true
                } else {
                    attachmentPreviewImageLeft.image = UIImage(data: imageData)
                    attachmentPreviewImageRight.isHidden = true
                }
            } catch {
                print("ChatMessageTableViewCell updateCell() loading image error: \(error)")
            }
        }
    }
    
    private func reset() {
        attachmentPreviewImageRight.image = nil
        attachmentPreviewImageLeft.image = nil
        attachmentPreviewImageLeft.isHidden = false
        attachmentPreviewImageRight.isHidden = false
        attachmentPreviewImageLeft.contentMode = .scaleAspectFit
        attachmentPreviewImageRight.contentMode = .scaleAspectFit
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
    }
}
