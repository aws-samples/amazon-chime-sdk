//
//  ViewController.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import UIKit

class SignInViewController: UIViewController, UITextFieldDelegate {

    @IBOutlet var usernameTextField: UITextField!
    @IBOutlet var passwordTextField: UITextField!
    
    private let mainStoryboard = UIStoryboard(name: "Main", bundle: nil)

    override func viewDidLoad() {
        super.viewDidLoad()

        usernameTextField.delegate = self
        passwordTextField.delegate = self

        setupHideKeyboardOnTap()
        AuthService.signOut()
    }

    @IBAction func exchangeTokenForAwsCredentialButtonClicked(_ sender: UIButton) {
        let accessToken = "{\n  defaultsTo: 'anonymousAccess',\n}\n"
        AuthService.exchangeTokenForAwsCredential(accessToken: accessToken) { success in
            if success {
                DispatchQueue.main.async {
                    self.switchToChatView(isAnonymous: true)
                }
            } else {
                print("SignInViewController exchangeTokenForAwsCredential failed")
                return
            }
        }
    }
    
    @IBAction func signInButtonClicked(_ sender: UIButton) {
        view.endEditing(true)
        let username = usernameTextField.text ?? ""
        let password = passwordTextField.text ?? ""

        if username.isEmpty || password.isEmpty {
            print("SignInViewController username or password is not valid")
            return
        }

        AuthService.signIn(username: username, password: password) {
            success in
            if success {
                DispatchQueue.main.async {
                    self.switchToChatView(isAnonymous: false)
                }
            } else {
                print("SignInViewController signIn failed")
                return
            }
        }
    }

    private func switchToChatView(isAnonymous: Bool) {
        guard let chatVC = self.mainStoryboard.instantiateViewController(withIdentifier: "chatViewController") as? ChatViewController else {
            return
        }
        chatVC.modalPresentationStyle = .fullScreen
        self.present(chatVC, animated: true) {
            // attachment is not enabled for anonymous user
            chatVC.attachButton.isHidden = isAnonymous
        }
    }
    
    // MARK: - UITextFieldDelegate
    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        textField.resignFirstResponder()
        return true
    }
}

