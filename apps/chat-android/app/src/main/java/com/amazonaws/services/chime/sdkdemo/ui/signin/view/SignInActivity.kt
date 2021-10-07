/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.chime.sdkdemo.ui.signin.view

import android.content.Context
import android.content.Intent
import android.os.Bundle
import androidx.activity.viewModels
import androidx.databinding.DataBindingUtil
import com.amazonaws.services.chime.sdkdemo.R
import com.amazonaws.services.chime.sdkdemo.common.*
import com.amazonaws.services.chime.sdkdemo.common.extensions.getViewModelFactory
import com.amazonaws.services.chime.sdkdemo.common.extensions.subscribe
import com.amazonaws.services.chime.sdkdemo.databinding.ActivitySigninBinding
import com.amazonaws.services.chime.sdkdemo.ui.base.BaseActivity
import com.amazonaws.services.chime.sdkdemo.ui.base.Error
import com.amazonaws.services.chime.sdkdemo.ui.base.Loading
import com.amazonaws.services.chime.sdkdemo.ui.base.Success
import com.amazonaws.services.chime.sdkdemo.ui.base.ViewState
import com.amazonaws.services.chime.sdkdemo.ui.channel.view.activity.ChannelActivity
import com.amazonaws.services.chime.sdkdemo.ui.messaging.view.activity.MessagingActivity
import com.amazonaws.services.chime.sdkdemo.ui.signin.presentation.SignInViewModel
import com.google.android.gms.tasks.OnCompleteListener
import com.google.firebase.ktx.Firebase
import com.google.firebase.messaging.ktx.messaging
import kotlinx.android.synthetic.main.activity_messaging.*
import kotlinx.android.synthetic.main.activity_messaging.toolbar
import kotlinx.android.synthetic.main.activity_signin.*

class SignInActivity : BaseActivity() {
    private val viewModel: SignInViewModel by viewModels { getViewModelFactory() }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val binding: ActivitySigninBinding =
            DataBindingUtil.setContentView(this, R.layout.activity_signin)

        binding.viewModel = viewModel

        storeDeviceToken()
        subscribeToData()
        setSupportActionBar(toolbar3)

        viewModel.sharedPrefs = applicationContext.getSharedPreferences(null, Context.MODE_PRIVATE)

        viewModel.checkSignedIn()
    }

    private fun storeDeviceToken() {
        Firebase.messaging.token.addOnCompleteListener(OnCompleteListener { task ->
            if (!task.isSuccessful) {
                return@OnCompleteListener
            }

            val sharedPrefs = applicationContext.getSharedPreferences(null, Context.MODE_PRIVATE)
            // Get new FCM registration token
            with (sharedPrefs.edit()) {
                putString(DEVICE_TOKEN_KEY, task.result.toString())
                apply()
            }
        })
    }

    private fun subscribeToData() {
        viewModel.viewState.subscribe(this, ::handleViewState)
    }

    private fun handleViewState(viewState: ViewState<Any>) {
        when (viewState) {
            is Loading -> showLoading(progressAuthentication)
            is Success -> navigate()
            is Error -> handleError(viewState.error.localizedMessage)
        }
    }

    private fun navigate() {
        if (intent.getStringExtra(CHANNEL_ARN).isNullOrBlank()) {
            navigateToChannelList()
        } else {
            navigateToMessageSession()
        }
    }

    private fun navigateToChannelList() {
        hideLoading(progressAuthentication)
        startActivity(
            Intent(applicationContext, ChannelActivity::class.java).apply {
                putExtra(SESSION_ID, editSessionId.text.toString().trim())
                viewModel.anonymousUser?.let { putExtra(ANONYMOUS_USER_ID, viewModel.anonymousUser) }
                viewModel.anonymousUserCredentials?.let {
                    putExtra(ANONYMOUS_USER_CREDENTIALS_ID, viewModel.anonymousUserCredentials)
                }
            }
        )
    }

    private fun navigateToMessageSession() {
        hideLoading(progressAuthentication)
        startActivity(
            Intent(applicationContext, MessagingActivity::class.java).apply {
                putExtra(SESSION_ID, editSessionId.text.toString().trim())
                putExtra(CHANNEL_ARN, intent.getStringExtra(CHANNEL_ARN))
                viewModel.anonymousUser?.let { putExtra(ANONYMOUS_USER_ID, viewModel.anonymousUser) }
                viewModel.anonymousUserCredentials?.let {
                    putExtra(ANONYMOUS_USER_CREDENTIALS_ID, viewModel.anonymousUserCredentials)
                }
            }
        )
    }

    private fun handleError(error: String?) {
        hideLoading(progressAuthentication)
        showError(error, signInContainer)
    }
}
