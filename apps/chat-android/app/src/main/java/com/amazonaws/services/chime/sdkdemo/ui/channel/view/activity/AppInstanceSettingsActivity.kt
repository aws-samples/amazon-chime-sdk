/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.chime.sdkdemo.ui.channel.view.activity

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.Window
import android.widget.Toast
import androidx.activity.viewModels
import androidx.databinding.DataBindingUtil
import androidx.lifecycle.viewModelScope
import com.amazonaws.services.chime.sdk.messaging.session.ChimeUserCredentials
import com.amazonaws.services.chime.sdkdemo.R
import com.amazonaws.services.chime.sdkdemo.common.USER_CREDENTIALS
import com.amazonaws.services.chime.sdkdemo.common.USER_DETAILS
import com.amazonaws.services.chime.sdkdemo.common.extensions.getViewModelFactory
import com.amazonaws.services.chime.sdkdemo.common.extensions.subscribe
import com.amazonaws.services.chime.sdkdemo.data.User
import com.amazonaws.services.chime.sdkdemo.databinding.ActivityAppInstanceSettingsBinding
import com.amazonaws.services.chime.sdkdemo.ui.base.BaseActivity
import com.amazonaws.services.chime.sdkdemo.ui.base.Error
import com.amazonaws.services.chime.sdkdemo.ui.base.Loading
import com.amazonaws.services.chime.sdkdemo.ui.base.Success
import com.amazonaws.services.chime.sdkdemo.ui.base.ViewState
import com.amazonaws.services.chime.sdkdemo.ui.channel.presentation.AppInstanceSettingsViewModel
import com.amazonaws.services.chime.sdkdemo.ui.signin.view.SignInActivity
import kotlinx.android.synthetic.main.activity_app_instance_settings.pushNotificationSwitch
import kotlinx.android.synthetic.main.activity_app_instance_settings.signOutButton
import kotlinx.coroutines.launch

class AppInstanceSettingsActivity : BaseActivity() {
    private val viewModel: AppInstanceSettingsViewModel by viewModels { getViewModelFactory() }
    private lateinit var viewDataBinding: ActivityAppInstanceSettingsBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestWindowFeature(Window.FEATURE_ACTION_BAR)
        viewDataBinding = DataBindingUtil.setContentView(this, R.layout.activity_app_instance_settings)
        viewDataBinding.viewModel = viewModel

        val user: User? = intent.extras?.get(USER_DETAILS) as User?
        val cred: ChimeUserCredentials? = intent.extras?.get(USER_CREDENTIALS) as ChimeUserCredentials?
        if (user != null && cred != null) {
            viewModel.currentUser = user
            viewModel.currentUserCredentials = cred
        }

        subscribeToData()

        viewModel.viewModelScope.launch {
            viewModel.sharedPrefs = applicationContext.getSharedPreferences(null, Context.MODE_PRIVATE)
            viewModel.initialize()
            setUpSwitch()
            setUpSignOutButton()
        }
    }

    private fun setUpSignOutButton() {
        signOutButton.setOnClickListener {
            viewModel.signOut()
        }
    }

    private fun setUpSwitch() {
        // Set change listener after displaying current value
        val notificationsEnabled = viewModel.getPushNotificationSwitchState()
        pushNotificationSwitch.isChecked = notificationsEnabled

        pushNotificationSwitch.setOnCheckedChangeListener { _, isChecked ->
            viewModel.setEndpointState(isChecked)
        }
    }

    private fun subscribeToData() {
        viewModel.viewState.subscribe(this, ::handleViewState)
    }

    private fun handleViewState(viewState: ViewState<Any>) {
        when (viewState) {
            is Loading -> handleLoading()
            is Success -> navigateToActivity()
            is Error -> handleError(viewState.error.localizedMessage)
        }
    }

    private fun handleLoading() {
        Toast.makeText(this, "Loading", Toast.LENGTH_SHORT).show()
    }

    private fun handleError(error: String?) {
        Toast.makeText(this, error, Toast.LENGTH_LONG).show()
    }

    private fun navigateToActivity() {
        Toast.makeText(this, "Redirecting...", Toast.LENGTH_LONG).show()

        if (!viewModel.signedIn) {
            val intent = Intent(this, SignInActivity()::class.java)
            startActivity(intent)
            finish()
        } else {
            navigateBackToChannelSession()
        }
    }

    private fun navigateBackToChannelSession() {
        finish()
    }
}
