//
//  HomeViewController.swift
//  WkWebView Demo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import AVFoundation
import UIKit
import WebKit

class HomeViewController: UIViewController {
    private let button: UIButton = {
        let button = UIButton()
        button.setTitle("Go to WebView", for: .normal)
        button.backgroundColor = .link
        button.setTitleColor(.white, for: .normal)
        return button
    }()

    override func viewDidLoad() {
        super.viewDidLoad()
        button.translatesAutoresizingMaskIntoConstraints = false
        button.addTarget(self, action: #selector(didTapbutton), for: .touchUpInside)
        view.addSubview(button)
        button.centerXAnchor.constraint(equalTo: view.centerXAnchor).isActive = true
        button.centerYAnchor.constraint(equalTo: view.centerYAnchor).isActive = true
    }

    override func viewDidAppear(_: Bool) {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized: // The user has previously granted access to the camera.
            return
        case .notDetermined: // The user has not yet been asked for camera access.
            AVCaptureDevice.requestAccess(for: .video) { granted in
                if granted {
                    return
                } else {
                    self.presentCameraPermissionDeniedAlert()
                }
            }
        case .denied,
             .restricted: // The user has previously denied access.
            presentCameraPermissionDeniedAlert()
        }

        switch AVAudioSession.sharedInstance().recordPermission {
        case AVAudioSessionRecordPermission.granted:
            return
        case AVAudioSessionRecordPermission.denied:
            presentMicrophonePermissionDeniedAlert()
        case AVAudioSessionRecordPermission.undetermined:
            // Request to record audio
            AVAudioSession.sharedInstance().requestRecordPermission { granted in
                if granted {
                    return
                } else {
                    self.presentMicrophonePermissionDeniedAlert()
                }
            }
        }
    }

    @objc private func didTapbutton() {
        let meetingURL = AppConfiguration.url
        guard let url = URL(string: meetingURL) else {
            return
        }
        let webViewVC = WkWebViewController(url: url, title: "WebView")
        let navVC = UINavigationController(rootViewController: webViewVC)
        present(navVC, animated: true)
    }

    func presentAlert(title: String, message: String, acceptText: String) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: acceptText, style: .default, handler: nil))
        present(alert, animated: true)
    }

    func presentCameraPermissionDeniedAlert() {
        presentAlert(title: "Access to Camera Denied",
                     message: "Check Settings to make sure Camera access is enabled for this application.",
                     acceptText: "OK")
    }

    func presentMicrophonePermissionDeniedAlert() {
        presentAlert(title: "Access to Microphone Denied",
                     message: "Check Settings to make sure Camera access is enabled for this application.",
                     acceptText: "OK")
    }
}
