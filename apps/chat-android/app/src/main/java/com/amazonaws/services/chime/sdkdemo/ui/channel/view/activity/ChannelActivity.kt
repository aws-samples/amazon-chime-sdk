package com.amazonaws.services.chime.sdkdemo.ui.channel.view.activity

import android.content.Intent
import android.os.Bundle
import android.view.*
import android.widget.AdapterView
import android.widget.HeaderViewListAdapter
import android.widget.Toast
import androidx.activity.viewModels
import androidx.databinding.DataBindingUtil
import androidx.lifecycle.viewModelScope
import com.amazonaws.services.chime.sdkdemo.R
import com.amazonaws.services.chime.sdkdemo.common.CHANNEL_ARN
import com.amazonaws.services.chime.sdkdemo.common.extensions.getViewModelFactory
import com.amazonaws.services.chime.sdkdemo.common.extensions.subscribe
import com.amazonaws.services.chime.sdkdemo.common.extensions.visible
import com.amazonaws.services.chime.sdkdemo.data.Channel
import com.amazonaws.services.chime.sdkdemo.data.onSuccess
import com.amazonaws.services.chime.sdkdemo.databinding.ActivityChannelsBinding
import com.amazonaws.services.chime.sdkdemo.ui.base.*
import com.amazonaws.services.chime.sdkdemo.ui.channel.presentation.ChannelViewModel
import com.amazonaws.services.chime.sdkdemo.ui.channel.view.adapter.ChannelAdapter
import com.amazonaws.services.chime.sdkdemo.ui.messaging.view.activity.MessagingActivity
import kotlinx.android.synthetic.main.activity_channels.*
import kotlinx.android.synthetic.main.activity_messaging.*
import kotlinx.coroutines.launch
import java.util.logging.Logger

class ChannelActivity : BaseActivity() {
    private val viewModel: ChannelViewModel by viewModels { getViewModelFactory() }
    private lateinit var viewDataBinding: ActivityChannelsBinding
    private lateinit var channelListAdapter: ChannelAdapter
    private val log = Logger.getLogger("ChannelActivity")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestWindowFeature(Window.FEATURE_ACTION_BAR)
        viewDataBinding = DataBindingUtil.setContentView(this, R.layout.activity_channels)
        viewDataBinding.viewModel = viewModel

        setUpListAdapter()
        subscribeToData()
        setSupportActionBar(toolbar2)

        log.info("Inside ChannelActivity")
        viewModel.loadChannels()

        viewModel.viewModelScope.launch {
            viewModel.userRepository.getCurrentUser()
                .onSuccess {
                    viewDataBinding.channelLoginAs.text = "Logged in as ${it.chimeDisplayName}"
                }
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
                log.info("Selected app instance settings in menu")
                val intent = Intent(this, AppInstanceSettingsActivity()::class.java)
                startActivity(intent)
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    private fun subscribeToData() {
        viewModel.viewState.subscribe(this, ::handleViewState)

        viewModel.items.observe(this, {
            it?.let {
                channelListAdapter.submitList(it as MutableList<Channel>)
            }
        })
    }

    private fun setUpListAdapter() {
        val channelAdapter = ChannelAdapter { channel -> adapterOnClick(channel) }
        channelListAdapter = channelAdapter
        viewDataBinding.channelList.adapter = channelAdapter
    }

    /* Creates toast when RecyclerView item is clicked and redirects to MessagingActivity. */
    private fun adapterOnClick(channel: Channel) {
        Toast.makeText(this, "Redirecting to messages for ${channel.name}", Toast.LENGTH_LONG).show()

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