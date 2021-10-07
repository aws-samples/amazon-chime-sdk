package com.amazonaws.services.chime.sdkdemo.ui.channel.presentation

import androidx.lifecycle.*
import com.amazonaws.auth.AWSSessionCredentials
import com.amazonaws.services.chime.sdk.messaging.session.ChimeUserCredentials
import com.amazonaws.services.chime.sdkdemo.data.User
import com.amazonaws.services.chime.sdkdemo.data.onFailure
import com.amazonaws.services.chime.sdkdemo.data.onSuccess
import com.amazonaws.services.chime.sdkdemo.data.Channel
import com.amazonaws.services.chime.sdkdemo.data.source.MessageRepository
import com.amazonaws.services.chime.sdkdemo.data.source.UserRepository
import com.amazonaws.services.chime.sdkdemo.ui.base.Error
import com.amazonaws.services.chime.sdkdemo.ui.base.Loading
import com.amazonaws.services.chime.sdkdemo.ui.base.Success
import com.amazonaws.services.chime.sdkdemo.ui.base.ViewState
import kotlinx.coroutines.launch
import java.util.logging.Logger

class ChannelViewModel(
    val userRepository: UserRepository,
    private val messageRepository: MessageRepository,
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {
    private val _items: MutableLiveData<List<Channel>> = MutableLiveData(mutableListOf())
    val items: LiveData<List<Channel>> = _items

    private val log = Logger.getLogger("ChannelViewModel")

    private val _viewState = MutableLiveData<ViewState<Any>>()
    val viewState: LiveData<ViewState<Any>> = _viewState

    lateinit var currentUser: User
    lateinit var currentUserCredentials: ChimeUserCredentials

    fun loadChannels() {
        _viewState.value = Loading()
        if (this::currentUser.isInitialized && this::currentUserCredentials.isInitialized) {
            log.info("loadChannels with lambda validated user")
            viewModelScope.launch {
                listChannelsForUser(currentUserCredentials)
            }
        } else {
            log.info("loadChannels with Cognito Pools User")
            viewModelScope.launch {
                userRepository.getCurrentUser()
                    .onSuccess { user ->
                        currentUser = user

                        userRepository.getAWSCredentials()
                            .onSuccess {
                                listChannelsForUser(ChimeUserCredentials(
                                    it.awsAccessKeyId,
                                    it.awsSecretKey,
                                    if (it is AWSSessionCredentials) it.sessionToken else null
                                ))
                            }
                            .onFailure { _viewState.value = Error(it) }
                    }
                    .onFailure { _viewState.value = Error(it) }
            }
        }
    }

    private fun listChannelsForUser(chimeUserCredentials: ChimeUserCredentials) {
        messageRepository.initialize(chimeUserCredentials)
        viewModelScope.launch {
            messageRepository.listChannelMembershipsForAppInstanceUser(currentUser.chimeAppInstanceUserArn)
                .onSuccess {
                    val channels = arrayListOf<Channel>()
                    for (channel in it.channelMemberships) {
                        val channelSummary = channel.channelSummary
                        val channelModel = Channel(channelSummary.channelArn, channelSummary.name,
                            channelSummary.privacy, channelSummary.mode)
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