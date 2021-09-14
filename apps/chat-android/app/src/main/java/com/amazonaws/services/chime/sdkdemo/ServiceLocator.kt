/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

package com.amazonaws.services.chime.sdkdemo

import com.amazonaws.services.chime.sdkdemo.data.source.DefaultMessageRepository
import com.amazonaws.services.chime.sdkdemo.data.source.DefaultUserRepository
import com.amazonaws.services.chime.sdkdemo.data.source.MessageRepository
import com.amazonaws.services.chime.sdkdemo.data.source.UserRepository
import com.amazonaws.services.chime.sdkdemo.data.source.service.DefaultAmazonChimeSDKService
import com.amazonaws.services.chime.sdkdemo.data.source.service.DefaultAuthService

// Simplified alternative to dependency injection
object ServiceLocator {
    private val authService by lazy {
        DefaultAuthService()
    }

    private val chimeService by lazy {
        DefaultAmazonChimeSDKService()
    }

    var userRepository: UserRepository? = null
    var messageRepository: MessageRepository? = null

    fun provideUserRepository(): UserRepository {
        synchronized(this) {
            return userRepository ?: userRepository ?: DefaultUserRepository(authService)
        }
    }

    fun provideMessageRepository(): MessageRepository {
        synchronized(this) {
            return messageRepository ?: messageRepository ?: DefaultMessageRepository(chimeService)
        }
    }
}
