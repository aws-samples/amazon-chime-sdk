package com.amazonaws.services.chime.sdkdemo.ui.messaging.presentation

import androidx.lifecycle.*
import com.amazonaws.services.chime.sdk.messaging.session.ChimeUserCredentials
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
import java.lang.RuntimeException

class NotificationSettingsViewModel(
    val userRepository: UserRepository,
    private val messageRepository: MessageRepository,
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val _viewState = MutableLiveData<ViewState<Any>>()
    val viewState: LiveData<ViewState<Any>> = _viewState

    lateinit var currentUser: User

    suspend fun initializeUser() {
        userRepository.getCurrentUser()
            .onSuccess {
                currentUser = it
            }
            .onFailure {
                _viewState.value = Error(it)
            }
    }

    suspend fun getPreferenceType(channelArn: String?): String {
        _viewState.value = Loading()
        if (channelArn != null) {
            messageRepository.getChannelMembershipPreferences(channelArn, currentUser.chimeAppInstanceUserArn)
                .onSuccess {
                    if (it.preferences != null && it.preferences.pushNotifications != null) {
                        when(it.preferences.pushNotifications.allowNotifications) {
                            "ALL" -> {
                                return "FULL"
                            }
                            "NONE" -> {
                                return "MUTE"
                            }
                            "FILTERED" -> {
                                return "MENTIONS"
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
                    .withPushNotifications(PushNotificationPreferences()
                        .withAllowNotifications("ALL"))
                invokeAPI(channelArn, prefs)
            } else if ("MUTE" == type) {
                val prefs = ChannelMembershipPreferences()
                    .withPushNotifications(PushNotificationPreferences()
                        .withAllowNotifications("NONE"))
                invokeAPI(channelArn, prefs)
            } else if ("MENTIONS" == type) {
                val prefs = ChannelMembershipPreferences()
                    .withPushNotifications(PushNotificationPreferences()
                        .withAllowNotifications("FILTERED")
                        .withFilterRule("{\"mention\":[\"@${currentUser.chimeDisplayName}\"]}"))
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
                prefs)
                .onSuccess {
                    _viewState.value = Success()
                }
                .onFailure {
                    _viewState.value = Error(it)
                }
        }
    }
}