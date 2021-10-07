package com.amazonaws.services.chime.sdkdemo.ui.channel.presentation

import android.content.SharedPreferences
import androidx.lifecycle.*
import com.amazonaws.services.chime.sdkdemo.common.DEVICE_TOKEN_KEY
import com.amazonaws.services.chime.sdkdemo.common.PASSWORD_KEY
import com.amazonaws.services.chime.sdkdemo.common.USERNAME_KEY
import com.amazonaws.services.chime.sdkdemo.data.User
import com.amazonaws.services.chime.sdkdemo.data.UserEndpoint
import com.amazonaws.services.chime.sdkdemo.data.onFailure
import com.amazonaws.services.chime.sdkdemo.data.onSuccess
import com.amazonaws.services.chime.sdkdemo.data.source.MessageRepository
import com.amazonaws.services.chime.sdkdemo.data.source.UserRepository
import com.amazonaws.services.chime.sdkdemo.ui.base.Error
import com.amazonaws.services.chime.sdkdemo.ui.base.Loading
import com.amazonaws.services.chime.sdkdemo.ui.base.Success
import com.amazonaws.services.chime.sdkdemo.ui.base.ViewState
import com.amazonaws.services.chimesdkidentity.model.AllowMessages
import kotlinx.coroutines.launch
import java.lang.RuntimeException
import java.util.logging.Logger

class AppInstanceSettingsViewModel(
    val userRepository: UserRepository,
    private val messageRepository: MessageRepository,
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {
    private val _viewState = MutableLiveData<ViewState<Any>>()
    val viewState: LiveData<ViewState<Any>> = _viewState
    lateinit var currentUser: User
    var signedIn = false
    lateinit var sharedPrefs: SharedPreferences
    lateinit var currentEndpoint: UserEndpoint
    private val log = Logger.getLogger("ViewModel")

    suspend fun initializeUserAndEndpoint() {
        userRepository.getCurrentUser()
            .onSuccess {
                currentUser = it
                signedIn = true
            }
            .onFailure { _viewState.value = Error(it) }
        userRepository.getCurrentUserEndpoint()
            .onSuccess { currentEndpoint = it }
    }

    suspend fun getPushNotificationSwitchState(): Boolean {
        _viewState.value = Loading()
        userRepository.getCurrentUserEndpoint()
            .onSuccess {
                currentEndpoint = it
                if (currentEndpoint.allowMessages != "NONE") {
                    return true
                }
            }

        return false
    }

    fun setEndpointState(enabled: Boolean) {
        if (!this::currentEndpoint.isInitialized) {
            viewModelScope.launch {
                var token = sharedPrefs.getString(DEVICE_TOKEN_KEY, "")

                if (token.isNullOrBlank()) {
                    _viewState.value = Error(RuntimeException("Could not fetch device token to register"))
                    return@launch
                }

                userRepository.registerAppInstanceUserEndpoint(token, currentUser.chimeAppInstanceUserArn)
                    .onSuccess {
                        currentEndpoint = UserEndpoint(it.endpointId, it.appInstanceUserArn, null, "ALL")
                        _viewState.value = Success()
                    }
                    .onFailure { _viewState.value = Error(it) }
            }
        } else {
            viewModelScope.launch {
                val allowMessages = if (enabled) AllowMessages.ALL else AllowMessages.NONE
                userRepository.updateAppInstanceUserEndpoint(currentEndpoint.name, allowMessages, currentEndpoint.endpointId, currentEndpoint.appInstanceUserArn)
                    .onSuccess { _viewState.value = Success() }
                    .onFailure { _viewState.value = Error(it) }
            }
        }
    }

    fun signOut() {
        if (this::currentEndpoint.isInitialized) {
            viewModelScope.launch {
                userRepository.deregisterAppInstanceUserEndpoint(currentEndpoint.endpointId, currentEndpoint.appInstanceUserArn)
                    .onFailure {
                        _viewState.value = Error(it)
                    }
                    .onSuccess {
                        signOutUser()
                    }
            }
        } else {
            viewModelScope.launch {
                signOutUser()
            }
        }
    }

    private suspend fun signOutUser() {
        with(sharedPrefs.edit()) {
            remove(USERNAME_KEY)
            remove(PASSWORD_KEY)
            remove(DEVICE_TOKEN_KEY)
            apply()
        }

        userRepository.signOut()

        // Naive way to sign out
        signedIn = false

        _viewState.value = Success()
    }
}