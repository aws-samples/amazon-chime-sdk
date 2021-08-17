# Amazon Chime SDK WKWebView Sample

## Summary

This sample shows how to run a WebRTC based meeting application inside of an Android Chromium WebView. The sample itself is a bare-bones Android app that loads a Chromium WebView, which then navigates to a URL that is specified in the `./app/java/AppConfig.kt` file. Currently Android Chromium WebView [does not support grabbing](https://bugs.chromium.org/p/chromium/issues/detail?id=669492) media device label, so you may need to make some minor changes to your application in order for Chromium WebView to work correctly.

### Pre-requisites:
- Android Studio 4.2.2+ installed on your machine

### Deploy a Chime SDK for Javascript Meeting Demo
If you'd like to try joining a WebRTC meeting demo from within a Chromium WebView in Android, you first need a meeting demo running in a browser so that when you load the WKWebView it can navigate to this meeting demo URL. Follow the instructions for the [Amazon Chime JS SDK Serverless Meeting Demo](https://github.com/aws/amazon-chime-sdk-js/tree/master/demos/serverless) in order to deploy a meeting demo.

After you've deployed a meeting demo URL, take note of the meeting demo URL that was outputted to your terminal or in the Outputs tab of your cloudformation stack as part of the last step of deploying the [Amazon Chime SDK for Javascript Serverless Meeting Demo](https://github.com/aws/amazon-chime-sdk-js/tree/master/demos/serverless). Take the meeting demo URL, and replace the variable `url` in `./app/java/AppConfig.kt` with the value of the meeting demo URL.

For example:
```
class AppConfig {
    static String url = "https://xxxx.execute-api.us-east-1.amazonaws.com/Prod/"
}
```

You can now build and run the Android application. There are issues with Android Studio's emulator that may cause issues for WebRTC, for best results deploy on a physical device.