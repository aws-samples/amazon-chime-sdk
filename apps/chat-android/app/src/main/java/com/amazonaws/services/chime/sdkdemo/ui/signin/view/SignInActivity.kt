/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

package com.amazonaws.services.chime.sdkdemo.ui.signin.view

import android.content.Intent
import android.os.Bundle
import androidx.activity.viewModels
import androidx.databinding.DataBindingUtil
import com.amazonaws.services.chime.sdkdemo.R
import com.amazonaws.services.chime.sdkdemo.common.ANONYMOUS_USER_CREDENTIALS_ID
import com.amazonaws.services.chime.sdkdemo.common.ANONYMOUS_USER_ID
import com.amazonaws.services.chime.sdkdemo.common.SESSION_ID
import com.amazonaws.services.chime.sdkdemo.common.extensions.getViewModelFactory
import com.amazonaws.services.chime.sdkdemo.common.extensions.subscribe
import com.amazonaws.services.chime.sdkdemo.databinding.ActivitySigninBinding
import com.amazonaws.services.chime.sdkdemo.ui.base.BaseActivity
import com.amazonaws.services.chime.sdkdemo.ui.base.Error
import com.amazonaws.services.chime.sdkdemo.ui.base.Loading
import com.amazonaws.services.chime.sdkdemo.ui.base.Success
import com.amazonaws.services.chime.sdkdemo.ui.base.ViewState
import com.amazonaws.services.chime.sdkdemo.ui.messaging.view.activity.MessagingActivity
import com.amazonaws.services.chime.sdkdemo.ui.signin.presentation.SignInViewModel
import kotlinx.android.synthetic.main.activity_signin.editSessionId
import kotlinx.android.synthetic.main.activity_signin.progressAuthentication
import kotlinx.android.synthetic.main.activity_signin.signInContainer

class SignInActivity : BaseActivity() {
    private val viewModel: SignInViewModel by viewModels { getViewModelFactory() }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val binding: ActivitySigninBinding =
            DataBindingUtil.setContentView(this, R.layout.activity_signin)

        binding.viewModel = viewModel
        subscribeToData()
    }

    private fun subscribeToData() {
        viewModel.viewState.subscribe(this, ::handleViewState)
    }

    private fun handleViewState(viewSate: ViewState<Any>) {
        when (viewSate) {
            is Loading -> showLoading(progressAuthentication)
            is Success -> navigateToMessageSession()
            is Error -> handleError(viewSate.error.localizedMessage)
        }
    }

    private fun navigateToMessageSession() {
        hideLoading(progressAuthentication)
        startActivity(
            Intent(applicationContext, MessagingActivity::class.java).apply {
                putExtra(SESSION_ID, editSessionId.text.toString().trim())
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
