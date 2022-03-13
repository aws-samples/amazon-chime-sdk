/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.chime.sdkdemo.ui.messaging.presentation

import android.content.SharedPreferences
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.amazonaws.services.chime.sdk.messaging.session.ChimeUserCredentials
import com.amazonaws.services.chime.sdkdemo.common.APP_INSTANCE_USER_NOT_FOUND
import com.amazonaws.services.chime.sdkdemo.data.User
import com.amazonaws.services.chime.sdkdemo.data.onFailure
import com.amazonaws.services.chime.sdkdemo.data.onSuccess
import com.amazonaws.services.chime.sdkdemo.data.source.MessageRepository
import com.amazonaws.services.chime.sdkdemo.data.source.UserRepository
import com.amazonaws.services.chime.sdkdemo.ui.base.Error
import com.amazonaws.services.chime.sdkdemo.ui.base.Loading
import com.amazonaws.services.chime.sdkdemo.ui.base.Success
import com.amazonaws.services.chime.sdkdemo.ui.base.ViewState
import com.amazonaws.services.chimesdkmessaging.model.ChannelMembershipPreferences
import com.amazonaws.services.chimesdkmessaging.model.PushNotificationPreferences
import kotlinx.coroutines.launch

class NotificationSettingsViewModel(
    val userRepository: UserRepository,
    private val messageRepository: MessageRepository,
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val _viewState = MutableLiveData<ViewState<Any>>()
    val viewState: LiveData<ViewState<Any>> = _viewState

    lateinit var currentUser: User
    lateinit var currentUserCredentials: ChimeUserCredentials
    lateinit var sharedPrefs: SharedPreferences

    fun initialize() {
        if (!this::currentUser.isInitialized || !this::currentUserCredentials.isInitialized) {
            _viewState.value = Error(java.lang.RuntimeException(APP_INSTANCE_USER_NOT_FOUND))
            return
        }

        userRepository.initialize(currentUserCredentials)
        messageRepository.initialize(currentUserCredentials)
    }

    suspend fun getPreferenceType(channelArn: String?): String {
        _viewState.value = Loading()
        if (channelArn != null) {
            messageRepository.getChannelMembershipPreferences(channelArn, currentUser.chimeAppInstanceUserArn)
                .onSuccess {
                    if (it.preferences != null && it.preferences.pushNotifications != null) {
                        when (it.preferences.pushNotifications.allowNotifications) {
                            "ALL" -> {
                                return "FULL"
                            }
                            "NONE" -> {
                                return "MUTE"
                            }
                            "FILTERED" -> {
                                return "MENTIONS"
                            }
                            else -> {
                                return "FULL"
                            }
                        }
                    }
                }
        }
        return "DEFAULT"
    }

    fun setPreferences(type: String, channelArn: String?) {
        _viewState.value = Loading()
        if (channelArn != null) {
            if ("FULL" == type) {
                val prefs = ChannelMembershipPreferences()
                    .withPushNotifications(
                        PushNotificationPreferences()
                            .withAllowNotifications("ALL")
                    )
                invokeAPI(channelArn, prefs)
            } else if ("MUTE" == type) {
                val prefs = ChannelMembershipPreferences()
                    .withPushNotifications(
                        PushNotificationPreferences()
                            .withAllowNotifications("NONE")
                    )
                invokeAPI(channelArn, prefs)
            } else if ("MENTIONS" == type) {
                val prefs = ChannelMembershipPreferences()
                    .withPushNotifications(
                        PushNotificationPreferences()
                            .withAllowNotifications("FILTERED")
                            .withFilterRule("{\"mention\":[\"@${currentUser.chimeDisplayName}\"]}")
                    )
                invokeAPI(channelArn, prefs)
            }
        } else {
            _viewState.value = Error(RuntimeException("Channel has not been selected yet."))
        }
    }

    private fun invokeAPI(channelArn: String, prefs: ChannelMembershipPreferences) {
        viewModelScope.launch {
            messageRepository.putChannelMembershipPreferences(
                channelArn,
                currentUser.chimeAppInstanceUserArn,
                prefs
            )
                .onSuccess {
                    _viewState.value = Success()
                }
                .onFailure {
                    _viewState.value = Error(it)
                }
        }
    }
}
