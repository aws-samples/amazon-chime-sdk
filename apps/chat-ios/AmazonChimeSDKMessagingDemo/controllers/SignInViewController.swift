//
//  ViewController.swift
//  AmazonChimeSDKMessagingDemo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import UIKit

class SignInViewController: UIViewController {

    @IBOutlet var usernameTextField: UITextField!
    @IBOutlet var passwordTextField: UITextField!
    @IBOutlet var identityTokenTextField: UITextField!
    
    private let TAG = "SignInViewController"
    
    override func viewDidLoad() {
        super.viewDidLoad()

        usernameTextField.delegate = self
        passwordTextField.delegate = self

        setupHideKeyboardOnTap()
        AuthService.signOut(signedOutHandler: nil)
        
        identityTokenTextField.text = "{\n  defaultsTo: 'anonymousAccess',\n}\n"
    }

    @IBAction func exchangeTokenForAwsCredentialButtonPressed(_ sender: UIButton) {
        
        guard let accessToken = identityTokenTextField.text else {
            print("\(TAG) accessToken is nil")
            return
        }
        AuthService.exchangeTokenForAwsCredential(accessToken: accessToken) { success in
            if success {
                DispatchQueue.main.async {
                    self.didSignInSucceed(username: "anonymous")
                }
            } else {
                print("\(self.TAG) AuthService.exchangeTokenForAwsCredential failed")
            }
        }
    }
    
    @IBAction func signInButtonPressed(_ sender: UIButton) {
        view.endEditing(true)
        let username = usernameTextField.text ?? ""
        let password = passwordTextField.text ?? ""

        if username.isEmpty || password.isEmpty {
            print("\(TAG) username or password is empty")
            return
        }

        AuthService.signIn(username: username, password: password) {
            success in
            if success {
                DispatchQueue.main.async {
                    self.didSignInSucceed(username: username)
                }
            } else {
                print("\(self.TAG) sign in failed")
            }
        }
    }

    private func didSignInSucceed(username: String) {
        Utils.setUserDefaultsString(value: username, forKey: K.usernameKey)
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
        let tabBarController = storyboard.instantiateViewController(identifier: K.tabBarControllerId) as UITabBarController
        (UIApplication.shared.connectedScenes.first?.delegate as? SceneDelegate)?.changeRootViewController(tabBarController)
    }
}

extension SignInViewController: UITextFieldDelegate {
    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        textField.resignFirstResponder()
        return true
    }
}

