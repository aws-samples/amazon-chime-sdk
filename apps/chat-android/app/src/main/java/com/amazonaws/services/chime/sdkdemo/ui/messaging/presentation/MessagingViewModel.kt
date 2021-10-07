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
import com.amazonaws.auth.AWSSessionCredentials
import com.amazonaws.services.chime.sdk.messaging.Message
import com.amazonaws.services.chime.sdk.messaging.session.ChimeUserCredentials
import com.amazonaws.services.chime.sdk.messaging.session.DefaultMessagingSession
import com.amazonaws.services.chime.sdk.messaging.session.MessagingSession
import com.amazonaws.services.chime.sdk.messaging.session.MessagingSessionConfiguration
import com.amazonaws.services.chime.sdk.messaging.session.MessagingSessionObserver
import com.amazonaws.services.chime.sdk.messaging.session.MessagingSessionStatus
import com.amazonaws.services.chime.sdk.messaging.utils.logger.ConsoleLogger
import com.amazonaws.services.chime.sdkdemo.common.*
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
import com.amazonaws.services.chimesdkmessaging.model.ListChannelMessagesResult
import com.amazonaws.services.chimesdkmessaging.model.MessageAttributeValue
import com.amazonaws.services.chimesdkmessaging.model.PushNotificationConfiguration
import com.google.gson.FieldNamingPolicy
import com.google.gson.GsonBuilder
import kotlinx.coroutines.launch
import java.lang.RuntimeException

class MessagingViewModel(
    val userRepository: UserRepository,
    private val messageRepository: MessageRepository,
    private val savedStateHandle: SavedStateHandle
) : ViewModel(), MessagingSessionObserver {
    val messageEditing = MutableLiveData<String>()
    private val gson = GsonBuilder().setFieldNamingStrategy(FieldNamingPolicy.UPPER_CAMEL_CASE).create()

    private val _items: MutableLiveData<List<ChannelMessage>> = MutableLiveData(mutableListOf())
    val items: LiveData<List<ChannelMessage>> = _items

    private val _viewState = MutableLiveData<ViewState<Any>>()
    val viewState: LiveData<ViewState<Any>> = _viewState

    lateinit var currentUser: User
    lateinit var currentUserCredentials: ChimeUserCredentials
    lateinit var sharedPrefs: SharedPreferences

    private val logger = ConsoleLogger()
    private val TAG = "MessagingViewModel"
    private var sessionId = MutableLiveData<String>()
    private var session: MessagingSession? = null
    private val mentionRegex = Regex("(?<!\\w)@\\S+")

    var channelArn = ""
    var channelName:MutableLiveData<String> = MutableLiveData("")

    fun startMessagingSession(channelArnParam: String?) {
        _viewState.value = Loading()
        sessionId = savedStateHandle.getLiveData(SESSION_ID)

        if (channelArnParam == null) {
            _viewState.value = Error(RuntimeException("Channel has not been selected yet."))
        } else {
            channelArn = channelArnParam

            if (this::currentUser.isInitialized && this::currentUserCredentials.isInitialized) {
                logger.info(TAG, "startMessagingSession with lambda validated user")
                viewModelScope.launch {
                    initiateWebSocketConnection(currentUserCredentials)
                }
            } else {
                logger.info(TAG, "startMessagingSession with Cognito Pools User")
                viewModelScope.launch {
                    val currentUsername = sharedPrefs.getString(USERNAME_KEY, "")
                    val currentPassword = sharedPrefs.getString(PASSWORD_KEY, "")

                    if (currentPassword.isNullOrEmpty() || currentUsername.isNullOrEmpty()) {
                        _viewState.value = Error(RuntimeException(APP_INSTANCE_USER_NOT_FOUND))
                        return@launch
                    }

                    userRepository.signIn(currentUsername, currentPassword)
                        .onFailure {
                            _viewState.value = Error(it)
                            return@onFailure
                        }

                    userRepository.getCurrentUser()
                        .onSuccess {
                            currentUser = it
                            fetchCredentials()
                        }
                        .onFailure { _viewState.value = Error(it) }
                }
            }
        }
    }

    private fun fetchCredentials() {
        viewModelScope.launch {
            userRepository.getAWSCredentials()
                .onSuccess {
                    initiateWebSocketConnection(ChimeUserCredentials(
                        it.awsAccessKeyId,
                        it.awsSecretKey,
                        if (it is AWSSessionCredentials) it.sessionToken else null
                    ))
                }
                .onFailure { _viewState.value = Error(it) }
        }
    }

    private fun initiateWebSocketConnection(chimeUserCredentials: ChimeUserCredentials) {
        viewModelScope.launch {
            messageRepository.initialize(chimeUserCredentials)
            messageRepository.getMessagingEndpoint()
                .onSuccess {
                    connect(chimeUserCredentials, it)
                    setChannelName()
                }
                .onFailure { _viewState.value = Error(it) }
        }
    }

    private fun loadChannelMessages() {
        viewModelScope.launch {
            messageRepository.listChannelMessages(channelArn, currentUser.chimeAppInstanceUserArn)
                .onSuccess {
                    processChannelMessages(it)
                }
                .onFailure { _viewState.value = Error(it) }
        }
    }

    private fun setChannelName() {
        viewModelScope.launch {
            messageRepository.describeChannel(channelArn, currentUser.chimeAppInstanceUserArn)
                .onSuccess {
                    channelName.postValue(it.channel.name)
                    logger.info(TAG, "setChannel() set default channelArn to $channelArn")
                    loadChannelMessages()
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
                val extractedMentions = mentionRegex.find(text)
                val matchedValues = extractedMentions?.groupValues
                val messageAttributes = HashMap<String, MessageAttributeValue>()
                if (matchedValues != null) {
                    messageAttributes["mention"] = MessageAttributeValue().withStringValues(matchedValues)
                }
                val pushConfig = PushNotificationConfiguration()
                    .withTitle("${channelName.value}")
                    .withBody("${currentUser.chimeDisplayName}: $text")
                    .withType("DEFAULT")
                messageRepository.sendMessage(text, channelArn, currentUser.chimeAppInstanceUserArn, messageAttributes, pushConfig)
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
        when (val eventType = message.Headers["x-amz-chime-event-type"]) {
            // Channel messages
            "CREATE_CHANNEL_MESSAGE", "REDACT_CHANNEL_MESSAGE",
            "UPDATE_CHANNEL_MESSAGE", "DELETE_CHANNEL_MESSAGE" ->
                processWebsocketChannelMessage(message)
            else ->
                logger.info(TAG, "Unexpected message type $eventType, ignoring")
        }
    }

    private fun processWebsocketChannelMessage(message: Message) {
        val payload = message.Payload
        val channelMessage = gson.fromJson(payload, com.amazonaws.services.chimesdkmessaging.model.ChannelMessage::class.java)

        val channel = channelMessage.channelArn
        if (channel.equals(channelArn)) {
            val messageId = channelMessage.messageId
            val senderName = channelMessage.sender.name
            val senderArn = channelMessage.sender.arn
            val displayTime = channelMessage.createdTimestamp
            val content = channelMessage.content
            val newItem = ChannelMessage(messageId, senderName, senderArn == currentUser.chimeAppInstanceUserArn, displayTime, content)

            _items.value = _items.value?.plus(newItem)
        } else {
            logger.info(TAG, "Message for inactive channel $channel, ignoring")
        }
    }

    private fun processChannelMessages(listChannelMessagesResult: ListChannelMessagesResult) {
        val messageList = arrayListOf<ChannelMessage>()
        for (message in listChannelMessagesResult.channelMessages) {
            val messageId = message.messageId
            val senderName = message.sender.name
            val senderArn = message.sender.arn
            val displayTime = message.createdTimestamp
            val content = message.content
            val newItem = ChannelMessage(messageId, senderName, senderArn == currentUser.chimeAppInstanceUserArn, displayTime, content)
            messageList.add(newItem)
        }

        // Sort messages by descending timestamp
        val sortedItems = messageList.sortedBy { channelMessage -> channelMessage.displayTime }
        _items.postValue(sortedItems)
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
