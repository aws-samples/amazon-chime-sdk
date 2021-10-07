/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.chime.sdkdemo.ui.messaging.view.activity

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.Menu
import android.view.MenuInflater
import android.view.MenuItem
import android.view.Window
import android.view.inputmethod.EditorInfo
import androidx.activity.viewModels
import androidx.databinding.DataBindingUtil
import androidx.lifecycle.Observer
import com.amazonaws.services.chime.sdk.messaging.session.ChimeUserCredentials
import com.amazonaws.services.chime.sdkdemo.R
import com.amazonaws.services.chime.sdkdemo.common.ANONYMOUS_USER_CREDENTIALS_ID
import com.amazonaws.services.chime.sdkdemo.common.ANONYMOUS_USER_ID
import com.amazonaws.services.chime.sdkdemo.common.APP_INSTANCE_USER_NOT_FOUND
import com.amazonaws.services.chime.sdkdemo.common.CHANNEL_ARN
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
import com.amazonaws.services.chime.sdkdemo.ui.signin.view.SignInActivity
import kotlinx.android.synthetic.main.activity_messaging.*
import java.util.logging.Logger

class MessagingActivity : BaseActivity() {
    private val viewModel: MessagingViewModel by viewModels { getViewModelFactory() }

    private lateinit var viewDataBinding: ActivityMessagingBinding
    private lateinit var messageListAdapter: MessageAdapter
    private val log = Logger.getLogger("MessagingActivity")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestWindowFeature(Window.FEATURE_ACTION_BAR)
        viewDataBinding = DataBindingUtil.setContentView(this, R.layout.activity_messaging)
        viewDataBinding.viewModel = viewModel

        setUpListAdapter()
        setUpButton()
        subscribeToData()
        setSupportActionBar(toolbar)

        val user: User? = intent.extras?.get(ANONYMOUS_USER_ID) as User?
        val cred: ChimeUserCredentials? = intent.extras?.get(ANONYMOUS_USER_CREDENTIALS_ID) as ChimeUserCredentials?
        val channelArn: String? = intent.extras?.getString(CHANNEL_ARN, "")

        viewModel.sharedPrefs = applicationContext.getSharedPreferences(null, Context.MODE_PRIVATE)

        if (user != null && cred != null) {
            viewModel.currentUser = user
            viewModel.currentUserCredentials = cred
        }

        if (savedInstanceState == null) {
            viewModel.startMessagingSession(channelArn)
        }

        viewModel.channelName.observe(this, Observer {
            newValue ->
            run {
                if (newValue != "") {
                    viewDataBinding.channelName.text = newValue
                }
            }
        })
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        val inflater: MenuInflater = menuInflater
        inflater.inflate(R.menu.channel_settings, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        // Handle item selection
        return when (item.itemId) {
            R.id.notif_settings -> {
                log.info("Selected notification settings in menu")
                val intent = Intent(this, NotificationSettingsActivity()::class.java)
                intent.putExtra(CHANNEL_ARN, viewModel.channelArn)
                startActivity(intent)
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    private fun subscribeToData() {
        viewModel.viewState.subscribe(this, ::handleViewState)
        viewModel.items.observe(this, Observer {
            messageListAdapter.submitList(it)
            if (it.isNotEmpty()) messageList.smoothScrollToPosition(it.size - 1)
        })
    }

    private fun handleViewState(viewState: ViewState<Any>) {
        when (viewState) {
            is Loading -> showLoading(progressBar)
            is Success -> showChatView()
            is Error -> handleError(viewState.error.localizedMessage)
        }
    }

    private fun showChatView() {
        hideLoading(progressBar)
        chatView.visible()
    }

    private fun handleError(error: String?) {
        hideLoading(progressBar)
        showError(error, messagingContainer)
        if (error == APP_INSTANCE_USER_NOT_FOUND) {
            val intent = Intent(this, SignInActivity()::class.java)
            startActivity(intent)
            finish()
        }
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
