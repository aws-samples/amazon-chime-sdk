/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.chime.sdkdemo.ui.channel.view.activity

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.Menu
import android.view.MenuInflater
import android.view.MenuItem
import android.view.Window
import androidx.activity.viewModels
import androidx.databinding.DataBindingUtil
import androidx.lifecycle.observe
import androidx.lifecycle.viewModelScope
import com.amazonaws.services.chime.sdk.messaging.session.ChimeUserCredentials
import com.amazonaws.services.chime.sdkdemo.R
import com.amazonaws.services.chime.sdkdemo.common.CHANNEL_ARN
import com.amazonaws.services.chime.sdkdemo.common.USER_CREDENTIALS
import com.amazonaws.services.chime.sdkdemo.common.USER_DETAILS
import com.amazonaws.services.chime.sdkdemo.common.extensions.getViewModelFactory
import com.amazonaws.services.chime.sdkdemo.common.extensions.subscribe
import com.amazonaws.services.chime.sdkdemo.common.extensions.visible
import com.amazonaws.services.chime.sdkdemo.data.Channel
import com.amazonaws.services.chime.sdkdemo.data.User
import com.amazonaws.services.chime.sdkdemo.databinding.ActivityChannelsBinding
import com.amazonaws.services.chime.sdkdemo.ui.base.BaseActivity
import com.amazonaws.services.chime.sdkdemo.ui.base.Error
import com.amazonaws.services.chime.sdkdemo.ui.base.Loading
import com.amazonaws.services.chime.sdkdemo.ui.base.Success
import com.amazonaws.services.chime.sdkdemo.ui.base.ViewState
import com.amazonaws.services.chime.sdkdemo.ui.channel.presentation.ChannelViewModel
import com.amazonaws.services.chime.sdkdemo.ui.channel.view.adapter.ChannelAdapter
import com.amazonaws.services.chime.sdkdemo.ui.messaging.view.activity.MessagingActivity
import kotlinx.android.synthetic.main.activity_channels.channelProgressBar
import kotlinx.android.synthetic.main.activity_channels.channelView
import kotlinx.android.synthetic.main.activity_channels.channelsContainer
import kotlinx.android.synthetic.main.activity_channels.channelsToolbar
import kotlinx.coroutines.launch

class ChannelActivity : BaseActivity() {
    private val viewModel: ChannelViewModel by viewModels { getViewModelFactory() }
    private lateinit var viewDataBinding: ActivityChannelsBinding
    private lateinit var channelListAdapter: ChannelAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestWindowFeature(Window.FEATURE_ACTION_BAR)
        viewDataBinding = DataBindingUtil.setContentView(this, R.layout.activity_channels)
        viewDataBinding.viewModel = viewModel

        val user: User? = intent.extras?.get(USER_DETAILS) as User?
        val cred: ChimeUserCredentials? = intent.extras?.get(USER_CREDENTIALS) as ChimeUserCredentials?
        if (user != null && cred != null) {
            viewModel.currentUser = user
            viewModel.currentUserCredentials = cred
        }

        setUpListAdapter()
        subscribeToData()
        setSupportActionBar(channelsToolbar)

        viewModel.viewModelScope.launch {
            viewModel.sharedPrefs = applicationContext.getSharedPreferences(null, Context.MODE_PRIVATE)
            viewModel.initialize()
            viewModel.loadChannels()

            viewDataBinding.channelLoginAs.text = "Logged in as ${viewModel.currentUser.chimeDisplayName}"
        }
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        val inflater: MenuInflater = menuInflater
        inflater.inflate(R.menu.app_instance_settings, menu)
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        // Handle item selection
        return when (item.itemId) {
            R.id.app_instance_settings -> {
                startActivity(
                    Intent(applicationContext, AppInstanceSettingsActivity::class.java).apply {
                        putExtra(USER_DETAILS, viewModel.currentUser)
                        putExtra(USER_CREDENTIALS, viewModel.currentUserCredentials)
                    }
                )
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    private fun subscribeToData() {
        viewModel.viewState.subscribe(this, ::handleViewState)

        viewModel.items.observe(this) {
            it.let {
                channelListAdapter.submitList(it as MutableList<Channel>)
            }
        }
    }

    private fun setUpListAdapter() {
        val channelAdapter = ChannelAdapter { channel -> adapterOnClick(channel) }
        channelListAdapter = channelAdapter
        viewDataBinding.channelList.adapter = channelAdapter
    }

    private fun adapterOnClick(channel: Channel) {
        val intent = Intent(this, MessagingActivity()::class.java)
        intent.putExtra(CHANNEL_ARN, channel.channelArn)
        startActivity(intent)
    }

    private fun showChannelView() {
        hideLoading(channelProgressBar)
        channelView.visible()
    }

    private fun handleViewState(viewState: ViewState<Any>) {
        when (viewState) {
            is Loading -> showLoading(channelProgressBar)
            is Success -> showChannelView()
            is Error -> handleError(viewState.error.localizedMessage)
        }
    }

    private fun handleError(error: String?) {
        hideLoading(channelProgressBar)
        showError(error, channelsContainer)
    }
}
