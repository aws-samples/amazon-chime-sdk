/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

package com.amazonaws.services.chime.sdkdemo.ui.messaging.view.activity

import android.os.Bundle
import android.view.inputmethod.EditorInfo
import androidx.activity.viewModels
import androidx.databinding.DataBindingUtil
import androidx.lifecycle.Observer
import com.amazonaws.services.chime.sdk.messaging.session.ChimeUserCredentials
import com.amazonaws.services.chime.sdkdemo.R
import com.amazonaws.services.chime.sdkdemo.common.ANONYMOUS_USER_CREDENTIALS_ID
import com.amazonaws.services.chime.sdkdemo.common.ANONYMOUS_USER_ID
import com.amazonaws.services.chime.sdkdemo.common.extensions.getViewModelFactory
import com.amazonaws.services.chime.sdkdemo.common.extensions.subscribe
import com.amazonaws.services.chime.sdkdemo.common.extensions.visible
import com.amazonaws.services.chime.sdkdemo.data.User
import com.amazonaws.services.chime.sdkdemo.databinding.ActivityMessagingBinding
import com.amazonaws.services.chime.sdkdemo.ui.base.BaseActivity
import com.amazonaws.services.chime.sdkdemo.ui.base.Error
import com.amazonaws.services.chime.sdkdemo.ui.base.Loading
import com.amazonaws.services.chime.sdkdemo.ui.base.Success
import com.amazonaws.services.chime.sdkdemo.ui.base.ViewState
import com.amazonaws.services.chime.sdkdemo.ui.messaging.presentation.MessagingViewModel
import com.amazonaws.services.chime.sdkdemo.ui.messaging.view.adapter.MessageAdapter
import kotlinx.android.synthetic.main.activity_messaging.buttonSubmitMessage
import kotlinx.android.synthetic.main.activity_messaging.chatView
import kotlinx.android.synthetic.main.activity_messaging.editMessage
import kotlinx.android.synthetic.main.activity_messaging.loginAs
import kotlinx.android.synthetic.main.activity_messaging.messageList
import kotlinx.android.synthetic.main.activity_messaging.messagingContainer
import kotlinx.android.synthetic.main.activity_messaging.progressBar

class MessagingActivity : BaseActivity() {
    private val viewModel: MessagingViewModel by viewModels { getViewModelFactory() }

    private lateinit var viewDataBinding: ActivityMessagingBinding
    private lateinit var messageListAdapter: MessageAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        viewDataBinding = DataBindingUtil.setContentView(this, R.layout.activity_messaging)
        viewDataBinding.viewModel = viewModel

        setUpListAdapter()
        setUpButton()
        subscribeToData()

        val user: User? = intent.extras?.get(ANONYMOUS_USER_ID) as User?
        val cred: ChimeUserCredentials? = intent.extras?.get(ANONYMOUS_USER_CREDENTIALS_ID) as ChimeUserCredentials?

        if (user != null && cred != null) {
            viewModel.currentUser = user
            viewModel.currentUserCredentials = cred
            loginAs.text = getString(R.string.login_as) + user.chimeDisplayName
        }

        if (savedInstanceState == null) {
            viewModel.startMessagingSession()
        }
    }

    private fun subscribeToData() {
        viewModel.viewState.subscribe(this, ::handleViewState)
        viewModel.items.observe(this, Observer {
            messageListAdapter.submitList(it)
            if (it.isNotEmpty()) messageList.smoothScrollToPosition(it.size - 1)
        })
    }

    private fun handleViewState(viewSate: ViewState<Any>) {
        when (viewSate) {
            is Loading -> showLoading(progressBar)
            is Success -> showChatView()
            is Error -> handleError(viewSate.error.localizedMessage)
        }
    }

    private fun showChatView() {
        hideLoading(progressBar)
        chatView.visible()
    }

    private fun handleError(error: String?) {
        hideLoading(progressBar)
        showError(error, messagingContainer)
    }

    private fun setUpListAdapter() {
        messageListAdapter = MessageAdapter()
        viewDataBinding.messageList.adapter = messageListAdapter
    }

    private fun setUpButton() {
        // Enter key sends message
        editMessage.setOnEditorActionListener { _, actionId, _ ->
            return@setOnEditorActionListener when (actionId) {
                EditorInfo.IME_ACTION_SEND -> {
                    viewModel.sendMessage()
                    editMessage.text.clear()
                    true
                }
                else -> false
            }
        }
        buttonSubmitMessage.setOnClickListener {
            viewModel.sendMessage()
            editMessage.text.clear()
        }
    }
}
