import UIKit
import AWSCore
import AWSChimeSDKMessaging
import AWSPluginsCore

class ChatViewController: UIViewController,
                          UITextFieldDelegate,
                          UIImagePickerControllerDelegate,
                          UINavigationControllerDelegate {

    @IBOutlet var chatView: UIView!
    @IBOutlet var loginAsLabel: UILabel!
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

        chatMessageTable.separatorStyle = .none
        loginAsLabel.text = "Login as \(AuthService.currentUser?.chimeDisplayName ?? "unknown")"
        sendMessageButton.isEnabled = false
        setupHideKeyboardOnTap()
        registerForKeyboardNotifications()

        chatModel.messageUpdatedHandler = { [weak self] in
            self?.chatMessageTable.reloadData()
        }

        chatModel.startMessagingSession()
    }

    override func viewWillDisappear(_ animated: Bool) {
        chatModel.stopMessagingSession()
        deregisterFromKeyboardNotifications()
        AuthService.signOut()
    }

    @IBAction func inputTextChanged(_ sender: Any) {
        guard let text = inputText.text else {
            return
        }
        sendMessageButton.isEnabled = !text.isEmpty
    }

    @IBAction func attachButtonClicked(_ sender: Any) {
        imagePicker.allowsEditing = false
        imagePicker.sourceType = .photoLibrary
        present(imagePicker, animated: true, completion: nil)
    }

    @IBAction func attachmentDeleteButtonClicked(_ sender: Any) {
        deleteAttachment()
    }

    @IBAction func sendButtonClicked(_ sender: Any) {
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

    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        textField.resignFirstResponder()
        return true
    }

    // MARK: - UIImagePickerControllerDelegate Methods
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
        if let imageUrl = info[UIImagePickerController.InfoKey.imageURL] as? URL {
            addAttachment(fileName: imageUrl.lastPathComponent, fileUrl: imageUrl)
        }
        dismiss(animated: true, completion: nil)
    }

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
