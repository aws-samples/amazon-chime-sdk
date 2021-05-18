# Amazon Chime SDK WKWebView Sample

## Summary

This sample shows how to run a WebRTC based meeting application inside of an iOS WKWebView. Prior to iOS 14.3, WKWebViews did not support WebRTC, meaning WKWebViews were not able to access WebRTC APIs. iOS 14.3 released support for WebRTC in WKWebViews - allowing developers to run WebRTC-based applications in a WKWebView. The sample itself is a bare-bones iOS app that loads a WKWebView, which then navigates to a specified URL.

### Pre-requisites:
- XCode 12.3+ installed on your machine

### Deploy a Chime SDK for Javascript Meeting Demo
If you'd like to try joining a WebRTC meeting demo from within a WKWebView in iOS, you first need a meeting demo running in a browser so that when you load the WKWebView it can navigate to this meeting demo URL. Follow the instructions for the [Amazon Chime JS SDK Serverless Meeting Demo](https://github.com/aws/amazon-chime-sdk-js/tree/master/demos/serverless) in order to deploy a meeting demo.

After you've deployed a meeting demo URL, take note of the meeting demo URL that was outputted to your terminal as part of the last step of deploying the [Amazon Chime SDK for Javascript Serverless Meeting Demo](https://github.com/aws/amazon-chime-sdk-js/tree/master/demos/serverless). Take the meeting demo URL, and replace the variable `url` in `./AppConfiguration.swift` with the value of the meeting demo URL. 

For example:
```
struct AppConfiguration {
    static let url = "https://xxxx.execute-api.us-east-1.amazonaws.com/Prod/"
}
```

You can now build and run the iOS application.  
