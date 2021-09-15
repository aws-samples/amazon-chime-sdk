/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.chime.sdkdemo.ui.messaging.presentation

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.amazonaws.auth.AWSSessionCredentials
import com.amazonaws.services.chime.sdk.messaging.Message
import com.amazonaws.services.chime.sdk.messaging.session.ChimeUserCredentials
import com.amazonaws.services.chime.sdk.messaging.session.DefaultMessagingSession
import com.amazonaws.services.chime.sdk.messaging.session.MessagingSession
import com.amazonaws.services.chime.sdk.messaging.session.MessagingSessionConfiguration
import com.amazonaws.services.chime.sdk.messaging.session.MessagingSessionObserver
import com.amazonaws.services.chime.sdk.messaging.session.MessagingSessionStatus
import com.amazonaws.services.chime.sdk.messaging.utils.logger.ConsoleLogger
import com.amazonaws.services.chime.sdkdemo.common.MESSAGING_SERVICE_REGION
import com.amazonaws.services.chime.sdkdemo.common.SESSION_ID
import com.amazonaws.services.chime.sdkdemo.common.extensions.formatTo
import com.amazonaws.services.chime.sdkdemo.common.extensions.toDate
import com.amazonaws.services.chime.sdkdemo.data.ChannelMessage
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
import org.json.JSONObject

class MessagingViewModel(
    private val userRepository: UserRepository,
    private val messageRepository: MessageRepository,
    private val savedStateHandle: SavedStateHandle
) : ViewModel(), MessagingSessionObserver {
    val messageEditing = MutableLiveData<String>()

    private val _items: MutableLiveData<List<ChannelMessage>> = MutableLiveData(mutableListOf())
    val items: LiveData<List<ChannelMessage>> = _items

    private val _viewState = MutableLiveData<ViewState<Any>>()
    val viewState: LiveData<ViewState<Any>> = _viewState

    lateinit var currentUser: User
    lateinit var currentUserCredentials: ChimeUserCredentials

    private val logger = ConsoleLogger()
    private val TAG = "MessagingViewModel"
    private var sessionId = MutableLiveData<String>()
    private var session: MessagingSession? = null
    private var channelArn = ""

    fun startMessagingSession() {
        _viewState.value = Loading()
        sessionId = savedStateHandle.getLiveData<String>(SESSION_ID)

        if (this::currentUser.isInitialized && this::currentUserCredentials.isInitialized) {
            logger.info(TAG, "startMessagingSession with lambda validated user")
            viewModelScope.launch {
                setEndpoint(currentUserCredentials)
            }
        } else {
            logger.info(TAG, "startMessagingSession with Cognito Pools User")
            viewModelScope.launch {
                userRepository.getCurrentUser()
                    .onSuccess {
                        currentUser = it
                        fetchCredentials()
                    }
                    .onFailure { _viewState.value = Error(it) }
            }
        }
    }

    private fun fetchCredentials() {
        viewModelScope.launch {
            userRepository.getAWSCredentials()
                .onSuccess {
                    setEndpoint(ChimeUserCredentials(
                        it.awsAccessKeyId,
                        it.awsSecretKey,
                        if (it is AWSSessionCredentials) it.sessionToken else null
                    ))
                }
                .onFailure { _viewState.value = Error(it) }
        }
    }

    private fun setEndpoint(chimeUserCredentials: ChimeUserCredentials) {
        messageRepository.initialize(chimeUserCredentials)
        viewModelScope.launch {
            messageRepository.getMessagingEndpoint()
                .onSuccess {
                    connect(chimeUserCredentials, it)
                    setDefaultChannel()
                }
                .onFailure { _viewState.value = Error(it) }
        }
    }

    /**
     * When the messaaging session starts, it fetches a list of channels the AppInstanceUser is a part of.
     * It sets the channelArn to the first channel of the list so that messages will be sent to it by default.
     * The channelArn will be updated to the channel in which the most recent message is sent
     */
    private fun setDefaultChannel() {
        viewModelScope.launch {
            messageRepository.listChannels(currentUser.chimeAppInstanceUserArn)
                .onSuccess {
                    if (!it.channelMemberships.isEmpty()) {
                        val channel = it.channelMemberships.get(0).channelSummary.channelArn
                        channelArn = channel
                        logger.info(TAG, "setDefaultChannel() set default channelArn to $channel")
                    } else {
                        _viewState.value = Error(Error("The user has not been subscribed to any channel yet"))
                    }
                }
                .onFailure { _viewState.value = Error(it) }
        }
    }

    private fun connect(chimeUserCredentials: ChimeUserCredentials, endpoint: String) {
        val sessionConfiguration =
            if (sessionId.value.isNullOrBlank()) {
                MessagingSessionConfiguration(
                    currentUser.chimeAppInstanceUserArn,
                    endpoint,
                    MESSAGING_SERVICE_REGION,
                    chimeUserCredentials
                )
            } else {
                MessagingSessionConfiguration(
                    currentUser.chimeAppInstanceUserArn,
                    endpoint,
                    MESSAGING_SERVICE_REGION,
                    chimeUserCredentials,
                    sessionId.value!!
                )
            }
        session = DefaultMessagingSession(
            sessionConfiguration,
            logger
        )
        session?.addMessagingSessionObserver(this)
        session?.start()
    }

    fun sendMessage() {
        val text = messageEditing.value?.trim()
        if (text.isNullOrBlank()) return
        if (channelArn.isNotBlank()) {
            viewModelScope.launch {
                messageRepository.sendMessage(text, channelArn, currentUser.chimeAppInstanceUserArn)
            }
        } else {
            logger.info(TAG, "channel is not assigned")
        }
    }

    override fun onMessagingSessionStarted() {
        logger.info(TAG, "Session started")
        _viewState.value = Success()
    }

    override fun onMessagingSessionConnecting(reconnecting: Boolean) {
        logger.info(TAG, "Start connecting")
    }

    override fun onMessagingSessionStopped(status: MessagingSessionStatus) {
        logger.info(TAG, "Closed: ${status.code} ${status.reason}")
    }

    override fun onMessagingSessionReceivedMessage(message: Message) {
        logger.info(TAG, "Message received: $message")
        when (message.type) {
            // Channel messages
            "CREATE_CHANNEL_MESSAGE", "REDACT_CHANNEL_MESSAGE",
            "UPDATE_CHANNEL_MESSAGE", "DELETE_CHANNEL_MESSAGE" ->
                processChannelMessage(message)
            else ->
                logger.info(TAG, "Unexpected message type, ignoring")
        }
    }

    private fun processChannelMessage(message: Message) {
        val payload = JSONObject(JSONObject(message.payload).getString("Payload"))
        val messageId = payload.getString("MessageId")
        val sender = payload.getJSONObject("Sender")
        val senderName = sender.getString("Name")
        val senderArn = sender.getString("Arn")
        val displayTime = payload.getString("CreatedTimestamp").toDate()?.formatTo("HH:mm") ?: ""
        val content = payload.getString("Content")
        val channel = payload.getString("ChannelArn")

        val newItem = ChannelMessage(messageId, senderName, senderArn == currentUser.chimeAppInstanceUserArn, displayTime, content)

        _items.value = _items.value?.plus(listOf(newItem))
        // This will track the last active channel and send next message there
        // Will remove after proper channel management
        channelArn = channel
    }

    override fun onCleared() {
        super.onCleared()
        viewModelScope.launch {
            userRepository.signOut()
        }
        session?.stop()
        session?.removeMessagingSessionObserver(this)
    }
}
