//
//  WkWebView_DemoUITests.swift
//  WkWebView DemoUITests
//
//

import XCTest

class WkWebViewDemoUITests: XCTestCase {

    override func setUpWithError() throws {
        continueAfterFailure = false
    }

    func testJoinMeeting() throws {
        // Launch the application
        let app = XCUIApplication()
        app.launch()
        
        // Navigate to the WebView
        app.buttons["Go to WebView"].tap()
        let webView = app.webViews
        
        // Fill out the meeting form
        _ = webView.textFields.element(boundBy: 0).waitForExistence(timeout: 10)
        let meetingTitleField = webView.textFields.element(boundBy: 0);
        meetingTitleField.tap()
        let meetingTitle = UUID().uuidString
        meetingTitleField.typeText(meetingTitle)
        let nameField = webView.textFields.element(boundBy: 1)
        nameField.tap()
        let attendeeName = UUID().uuidString
        nameField.typeText(attendeeName)
        app.toolbars.buttons["Done"].tap()
        webView.buttons["Continue"].tap()
        
        // Allow the getUserMedia device permissions request
        _ = app.alerts.element.waitForExistence(timeout: 10)
        app.alerts.element.buttons["Allow"].tap()
        
        // Join the meeting
        _ = webView.buttons["Join"].waitForExistence(timeout: 10)
        webView.buttons["Join"].tap()
        
        // Verify that we're in the meeting
        XCTAssertTrue(webView.buttons["Toggle microphone"].exists)
        XCTAssertTrue(webView.buttons["Toggle camera"].exists)
    }
}
