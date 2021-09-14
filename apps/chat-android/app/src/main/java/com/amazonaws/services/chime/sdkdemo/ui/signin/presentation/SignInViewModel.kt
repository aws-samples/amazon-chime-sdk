/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

package com.amazonaws.services.chime.sdkdemo.ui.signin.presentation

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.amazonaws.services.chime.sdk.messaging.session.ChimeUserCredentials
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
                .onSuccess { _viewState.value = Success(it) }
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
