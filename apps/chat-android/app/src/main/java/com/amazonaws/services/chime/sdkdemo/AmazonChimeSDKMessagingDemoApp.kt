/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.chime.sdkdemo

import android.app.Application
import com.amazonaws.services.chime.sdk.messaging.utils.logger.ConsoleLogger
import com.amazonaws.services.chime.sdkdemo.data.source.MessageRepository
import com.amazonaws.services.chime.sdkdemo.data.source.UserRepository
import com.amplifyframework.AmplifyException
import com.amplifyframework.auth.cognito.AWSCognitoAuthPlugin
import com.amplifyframework.core.Amplify

class AmazonChimeSDKMessagingDemoApp : Application() {
    val userRepository: UserRepository
        get() = ServiceLocator.provideUserRepository()

    val messageRepository: MessageRepository
        get() = ServiceLocator.provideMessageRepository()

    private val logger = ConsoleLogger()
    private val TAG = "AmazonChimeSDKMessagingDemoApp"

    override fun onCreate() {
        super.onCreate()

        try {
            Amplify.addPlugin(AWSCognitoAuthPlugin())
            Amplify.configure(applicationContext)
            logger.info(TAG, "Initialized Amplify")
        } catch (error: AmplifyException) {
            logger.error(TAG, "Could not initialize Amplify: ${error.localizedMessage} ${error.recoverySuggestion}")
        }
    }
}
