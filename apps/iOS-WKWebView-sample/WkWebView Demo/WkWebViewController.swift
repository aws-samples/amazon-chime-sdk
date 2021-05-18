//
//  WkWebViewController.swift
//  WkWebView Demo
//
//  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//  SPDX-License-Identifier: MIT-0
//

import UIKit
import WebKit

class WkWebViewController: UIViewController {
    private let url: URL

    let webView: WKWebView = {
        let preferences = WKWebpagePreferences()
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.allowsPictureInPictureMediaPlayback = true
        configuration.defaultWebpagePreferences = preferences
        let webView = WKWebView(frame: .zero, configuration: configuration)
        return webView
    }()

    override func viewDidLoad() {
        super.viewDidLoad()
        view.addSubview(webView)
        webView.load(URLRequest(url: url))
    }

    init(url: URL, title: String) {
        self.url = url
        super.init(nibName: nil, bundle: nil)
        self.title = title
    }

    @available(*, unavailable)
    required init?(coder _: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        webView.frame = view.bounds
    }
}
