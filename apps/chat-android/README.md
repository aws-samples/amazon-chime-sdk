# Amazon Chime SDK Android Chat Demo

## Overview

This application is designed in a way that can be used as a starting point for your own application, or as a quick way to explore the features of the Amazon Chime SDK messaging. Please read blog posts below to start with various features.
* [Build chat applications in iOS and Android with Amazon Chime SDK messaging](https://aws.amazon.com/blogs/business-productivity/build-chat-applications-in-ios-and-android-with-amazon-chime-sdk-messaging)
* [Push Notifications for Android and iOS with Amazon Chime SDK messaging](https://aws-blogs-prod.amazon.com/business-productivity/push-notifications-for-android-and-ios-with-amazon-chime-sdk-messaging/)

<p align="center">
<img src="./media/awsChimeSDKMessagingDemo.png" alt="image" width="80%"/>
</p>

## Prerequisites

1. [Deploy the AWS CloudFormation Template](https://github.com/aws-samples/amazon-chime-sdk/tree/main/apps/chat#deploying-the-solution).
2. [Run the Amazon Chime SDK Chat Web Demo](https://github.com/aws-samples/amazon-chime-sdk/tree/main/apps/chat#running-the-amazon-chime-sdk-chat-demo).
3. [Create Amazon Cognito Users](https://github.com/aws-samples/amazon-chime-sdk/tree/main/apps/chat#cognito-user-pools) OR [Use Credential Exchange Service](https://github.com/aws-samples/amazon-chime-sdk/tree/main/apps/chat#credential-exchange-service) to join a chat session.
4. You have installed Android Studio version 4.0 or later.

## Build and Run Android Chat Demo Application
1. Clone the project from Github.
   ```
   git clone https://github.com/aws-samples/amazon-chime-sdk.git
   ```
2. Navigate to the root folder of the Android chat demo application.
   ```
   cd apps/chat-android
   ```
3. Open the project in Android Studio.
4. Open `app/src/main/res/raw/amplifyconfiguration.json` and update the configuration with the values from outputs from the deployment of AWS CloudFormation template.
5. Open `app/src/main/java/com/amazonaws/services/chime/sdkdemo/common/AppConstants.kt` update the configuration.
6. Run the application on a simulator or a physical device. Sign in with `username` and `password` of desired Amazon Cognito user or via Credential Exchange Service.