/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.chime.sdkdemo

import android.os.Bundle
import androidx.lifecycle.AbstractSavedStateViewModelFactory
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.savedstate.SavedStateRegistryOwner
import com.amazonaws.services.chime.sdkdemo.data.source.MessageRepository
import com.amazonaws.services.chime.sdkdemo.data.source.UserRepository
import com.amazonaws.services.chime.sdkdemo.ui.channel.presentation.AppInstanceSettingsViewModel
import com.amazonaws.services.chime.sdkdemo.ui.channel.presentation.ChannelViewModel
import com.amazonaws.services.chime.sdkdemo.ui.messaging.presentation.MessagingViewModel
import com.amazonaws.services.chime.sdkdemo.ui.messaging.presentation.NotificationSettingsViewModel
import com.amazonaws.services.chime.sdkdemo.ui.signin.presentation.SignInViewModel
import java.lang.IllegalArgumentException

class ViewModelFactory(
    private val userRepository: UserRepository,
    private val messageRepository: MessageRepository,
    owner: SavedStateRegistryOwner,
    defaultArgs: Bundle? = null
) : AbstractSavedStateViewModelFactory(owner, defaultArgs) {
    override fun <T : ViewModel?> create(
        key: String,
        modelClass: Class<T>,
        handle: SavedStateHandle
    ) = with(modelClass) {
        when {
            isAssignableFrom(SignInViewModel::class.java) ->
                SignInViewModel(userRepository)
            isAssignableFrom(MessagingViewModel::class.java) ->
                MessagingViewModel(userRepository, messageRepository, handle)
            isAssignableFrom(ChannelViewModel::class.java) ->
                ChannelViewModel(userRepository, messageRepository, handle)
            isAssignableFrom(NotificationSettingsViewModel::class.java) ->
                NotificationSettingsViewModel(userRepository, messageRepository, handle)
            isAssignableFrom(AppInstanceSettingsViewModel::class.java) ->
                AppInstanceSettingsViewModel(userRepository, messageRepository, handle)
            else ->
                throw IllegalArgumentException("Unknown ViewModel class: ${modelClass.name}")
        }
    } as T
}
