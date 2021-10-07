/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.chime.sdkdemo.ui.signin.presentation

import android.content.SharedPreferences
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.amazonaws.auth.AWSSessionCredentials
import com.amazonaws.services.chime.sdk.messaging.session.ChimeUserCredentials
import com.amazonaws.services.chime.sdkdemo.common.PASSWORD_KEY
import com.amazonaws.services.chime.sdkdemo.common.USERNAME_KEY
import com.amazonaws.services.chime.sdkdemo.data.User
import com.amazonaws.services.chime.sdkdemo.data.onFailure
import com.amazonaws.services.chime.sdkdemo.data.onSuccess
import com.amazonaws.services.chime.sdkdemo.data.source.UserRepository
import com.amazonaws.services.chime.sdkdemo.ui.base.Error
import com.amazonaws.services.chime.sdkdemo.ui.base.Loading
import com.amazonaws.services.chime.sdkdemo.ui.base.Success
import com.amazonaws.services.chime.sdkdemo.ui.base.ViewState
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.util.logging.Logger

class SignInViewModel(
    private val userRepository: UserRepository
) : ViewModel() {
    val userName = MutableLiveData<String>()
    val password = MutableLiveData<String>()
    val sessionId = MutableLiveData<String>()
    var anonymousUser: User? = null
    var anonymousUserCredentials: ChimeUserCredentials? = null

    private val _viewState = MutableLiveData<ViewState<Any>>()
    val viewState: LiveData<ViewState<Any>> = _viewState

    lateinit var sharedPrefs: SharedPreferences

    fun checkSignedIn() {
        val username = sharedPrefs.getString(USERNAME_KEY, "")
        val password = sharedPrefs.getString(PASSWORD_KEY, "")

        if (!username.isNullOrBlank() && !password.isNullOrBlank()) {
            // already signed in from local prefs
            // redirect to next screen
            _viewState.value = Success()
        }
    }

    fun signIn() {
        val currentUserName = userName.value?.trim()
        val currentPassword = password.value?.trim()

        if (currentUserName.isNullOrBlank() || currentPassword.isNullOrBlank()) {
            _viewState.value = Error(Exception("User name or password cannot be empty"))
            return
        }

        _viewState.value = Loading()

        viewModelScope.launch {
            userRepository.signIn(currentUserName, currentPassword)
                .onSuccess {

                    // This is probably not a great way to store credentials locally
                    with (sharedPrefs.edit()) {
                        putString(USERNAME_KEY, userName.value)
                        putString(PASSWORD_KEY, password.value)
                        apply()
                    }

                    userRepository.getCurrentUser()
                        .onSuccess {
                            userRepository.getAWSCredentials().onSuccess {
                                userRepository.initialize(
                                    ChimeUserCredentials(
                                        it.awsAccessKeyId,
                                        it.awsSecretKey,
                                        if (it is AWSSessionCredentials) it.sessionToken else null
                                    )
                                )
                            }
                        }
                    _viewState.value = Success()
                }
                .onFailure { _viewState.value = Error(it) }
        }
    }

    fun exchangeTokenForAwsCredential() {
        val accessToken = "{defaultsTo: 'anonymousAccess'}"
        viewModelScope.launch {
            val response: String? = userRepository.exchangeTokenForAwsCredential(accessToken)
            if (response == null) {
                _viewState.value = Error(Exception("Unable to exchange for AWS Credential"))
            } else {
                val obj = JSONObject(response)
                val appInstanceUserArn = obj.getString("ChimeAppInstanceUserArn")
                val chimeUserId = obj.getString("ChimeUserId")
                val chimeDisplayName = obj.getString("ChimeDisplayName")
                anonymousUser = User(chimeDisplayName, chimeUserId, appInstanceUserArn)

                val credential = JSONObject(obj.getString("ChimeCredentials"))
                anonymousUserCredentials = ChimeUserCredentials(
                    credential.getString("AccessKeyId"),
                    credential.getString("SecretAccessKey"),
                    credential.getString("SessionToken")
                )
                _viewState.value = Success()
            }
        }
    }
}
