# Amazon Chime SDK iOS Chat Demo

## Overview

By completing the steps below, you will learn how to run the Amazon Chime SDK iOS chat demo applications on your mobile device or on a simulator. This application enables users to send and receive messages/image attachments in chat channels in real time. This application is designed in a way that can be used as a starting point for your own application, or as a quick way to explore the features of the Amazon Chime SDK messaging. Please see the [Build chat applications in iOS and Android with Amazon Chime SDK messaging](https://aws.amazon.com/blogs/business-productivity/build-chat-applications-in-ios-and-android-with-amazon-chime-sdk-messaging) for more information.

<p align="center">
<img src="./media/awsChimeSDKMessagingDemo.png" alt="image" width="80%"/>
</p>

## Prerequisites

1. You have read [Build chat features into your application with Amazon Chime SDK messaging](https://aws.amazon.com/blogs/business-productivity/build-chat-features-into-your-application-with-amazon-chime-sdk-messaging/). You understand the architecture of the chat demo web application built with Amazon Chime SDK messaging. 
2. You have completed the following operations
    1. [Deploy the solution](https://github.com/aws-samples/amazon-chime-sdk/tree/main/apps/chat#deploying-the-solution).
    2. [Run the Amazon Chime SDK Chat Demo](https://github.com/aws-samples/amazon-chime-sdk/tree/main/apps/chat#running-the-amazon-chime-sdk-chat-demo).
    3. [Create Amazon Cognito Users](https://github.com/aws-samples/amazon-chime-sdk/tree/main/apps/chat#cognito-user-pools) OR [Use Credential Exchange Service](https://github.com/aws-samples/amazon-chime-sdk/tree/main/apps/chat#credential-exchange-service) to join a chat session.
3. You have installed Xcode version 11.0 or later.
4. You have [CocoaPods](https://cocoapods.org/) installed.

## Build and Run iOS Chat Demo Application
1. Clone the project from Github.
   ```
   git clone https://github.com/aws-samples/amazon-chime-sdk.git
   ```
2. Navigate to the root folder of the iOS chat demo application.
   ```
   cd apps/chat-ios
   ```
3. Install dependencies.
   ```
   pod install
   ```
4. Open `AmazonChimeMessagingSDKDemo.xcworkspace` using Xcode.
5. Open `AmazonChimeMessagingSDKDemo/amplifyconfiguration.json` and update the configuration with the values from outputs from the deployment of AWS CloudFormation template.
6. Open `AmazonChimeMessagingSDKDemo/AppConfiguration.swift` and update the configuration.
   ```
    static let apiGatewayInvokeUrl = "<apiGatewayInvokeUrl from CloudFormation Outputs>"
    static let appInstanceArn = "<appInstanceArn from CloudFormation Outputs>"
   ```
7. Run the application on a simulator or a physical device. Sign in with `username` and `password` of desired Amazon Cognito user or via Credential Exchange Service.