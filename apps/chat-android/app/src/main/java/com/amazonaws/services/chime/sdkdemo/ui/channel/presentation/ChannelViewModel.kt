/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.chime.sdkdemo.ui.channel.presentation

import android.content.SharedPreferences
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.amazonaws.auth.AWSSessionCredentials
import com.amazonaws.services.chime.sdk.messaging.session.ChimeUserCredentials
import com.amazonaws.services.chime.sdkdemo.common.APP_INSTANCE_USER_NOT_FOUND
import com.amazonaws.services.chime.sdkdemo.common.PASSWORD_KEY
import com.amazonaws.services.chime.sdkdemo.common.USERNAME_KEY
import com.amazonaws.services.chime.sdkdemo.data.Channel
import com.amazonaws.services.chime.sdkdemo.data.User
import com.amazonaws.services.chime.sdkdemo.data.onFailure
import com.amazonaws.services.chime.sdkdemo.data.onSuccess
import com.amazonaws.services.chime.sdkdemo.data.source.MessageRepository
import com.amazonaws.services.chime.sdkdemo.data.source.UserRepository
import com.amazonaws.services.chime.sdkdemo.ui.base.Error
import com.amazonaws.services.chime.sdkdemo.ui.base.Loading
import com.amazonaws.services.chime.sdkdemo.ui.base.Success
import com.amazonaws.services.chime.sdkdemo.ui.base.ViewState
import kotlinx.coroutines.launch

class ChannelViewModel(
    private val userRepository: UserRepository,
    private val messageRepository: MessageRepository,
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {
    private val _items: MutableLiveData<List<Channel>> = MutableLiveData(mutableListOf())
    val items: LiveData<List<Channel>> = _items

    private val _viewState = MutableLiveData<ViewState<Any>>()
    val viewState: LiveData<ViewState<Any>> = _viewState

    lateinit var currentUser: User
    lateinit var currentUserCredentials: ChimeUserCredentials
    lateinit var sharedPrefs: SharedPreferences

    suspend fun initialize() {
        if (!this::currentUser.isInitialized || !this::currentUserCredentials.isInitialized) {
            val currentUsername = sharedPrefs.getString(USERNAME_KEY, "")
            val currentPassword = sharedPrefs.getString(PASSWORD_KEY, "")

            if (currentPassword.isNullOrEmpty() || currentUsername.isNullOrEmpty()) {
                _viewState.value = Error(RuntimeException(APP_INSTANCE_USER_NOT_FOUND))
                return
            }

            userRepository.signIn(currentUsername, currentPassword)
                .onFailure {
                    _viewState.value = Error(it)
                    return@onFailure
                }

            userRepository.getCurrentUser()
                .onSuccess { user ->
                    currentUser = user

                    userRepository.getAWSCredentials().onSuccess {
                        var creds = ChimeUserCredentials(
                            it.awsAccessKeyId,
                            it.awsSecretKey,
                            if (it is AWSSessionCredentials) it.sessionToken else null
                        )
                        currentUserCredentials = creds
                        userRepository.initialize(creds)
                        messageRepository.initialize(creds)
                    }
                }
                .onFailure { _viewState.value = Error(it) }
        } else {
            userRepository.initialize(currentUserCredentials)
            messageRepository.initialize(currentUserCredentials)
        }
    }

    fun loadChannels() {
        _viewState.value = Loading()
        if (this::currentUser.isInitialized) {
            viewModelScope.launch {
                listChannelsForUser()
            }
        } else {
            _viewState.value = Error(RuntimeException("User has not been initialized"))
        }
    }

    private fun listChannelsForUser() {
        viewModelScope.launch {
            messageRepository.listChannelMembershipsForAppInstanceUser(currentUser.chimeAppInstanceUserArn)
                .onSuccess {
                    val channels = arrayListOf<Channel>()
                    for (channel in it.channelMemberships) {
                        val channelSummary = channel.channelSummary
                        val channelModel = Channel(
                            channelSummary.channelArn, channelSummary.name,
                            channelSummary.privacy, channelSummary.mode
                        )
                        channels.add(channelModel)
                    }
                    _items.postValue(channels)
                    _viewState.value = Success(it)
                }
                .onFailure {
                    _viewState.value = Error(it)
                }
        }
    }
}
