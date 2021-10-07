package com.amazonaws.services.chime.sdkdemo.ui.messaging.view.activity

import android.os.Bundle
import android.view.Window
import android.widget.RadioGroup
import android.widget.Toast
import androidx.activity.viewModels
import androidx.databinding.DataBindingUtil
import androidx.lifecycle.viewModelScope
import com.amazonaws.services.chime.sdkdemo.R
import com.amazonaws.services.chime.sdkdemo.common.CHANNEL_ARN
import com.amazonaws.services.chime.sdkdemo.common.extensions.getViewModelFactory
import com.amazonaws.services.chime.sdkdemo.common.extensions.subscribe
import com.amazonaws.services.chime.sdkdemo.databinding.ActivityNotificationSettingsBinding
import com.amazonaws.services.chime.sdkdemo.ui.base.BaseActivity
import com.amazonaws.services.chime.sdkdemo.ui.base.Error
import com.amazonaws.services.chime.sdkdemo.ui.base.Loading
import com.amazonaws.services.chime.sdkdemo.ui.base.Success
import com.amazonaws.services.chime.sdkdemo.ui.base.ViewState
import com.amazonaws.services.chime.sdkdemo.ui.messaging.presentation.NotificationSettingsViewModel
import kotlinx.android.synthetic.main.activity_notification_settings.*
import kotlinx.coroutines.launch
import java.util.logging.Logger

class NotificationSettingsActivity : BaseActivity() {
    private val viewModel: NotificationSettingsViewModel by viewModels { getViewModelFactory() }

    private lateinit var viewDataBinding: ActivityNotificationSettingsBinding
    private val log = Logger.getLogger("NotificationSettingsActivity")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestWindowFeature(Window.FEATURE_ACTION_BAR)
        viewDataBinding = DataBindingUtil.setContentView(this, R.layout.activity_notification_settings)
        viewDataBinding.viewModel = viewModel

        subscribeToData()

        viewModel.viewModelScope.launch {
            viewModel.initializeUser()
            setUpRadioButtons()
        }
    }

    private suspend fun setUpRadioButtons() {
        val channelArn = intent.extras?.getString(CHANNEL_ARN, "")
        when (viewModel.getPreferenceType(channelArn)) {
            "FULL" -> {
                fullRadioButton.isChecked = true
            }
            "MUTE" -> {
                muteRadioButton.isChecked = true
            }
            "MENTIONS" -> {
                mentionsRadioButton.isChecked = true
            }
        }

        // Set change listener after displaying current value
        notifOptions.setOnCheckedChangeListener { _, checkedId ->
            when (checkedId) {
                R.id.fullRadioButton -> {
                    Toast.makeText(this, "Push Notifications set to FULL", Toast.LENGTH_SHORT).show()
                    viewModel.setPreferences("FULL", channelArn)
                }
                R.id.muteRadioButton -> {
                    Toast.makeText(this, "Push Notifications set to MUTE", Toast.LENGTH_SHORT).show()
                    viewModel.setPreferences("MUTE", channelArn)
                }
                R.id.mentionsRadioButton -> {
                    Toast.makeText(this, "Push Notifications set to MENTIONS", Toast.LENGTH_SHORT).show()
                    viewModel.setPreferences("MENTIONS", channelArn)
                }
            }
        }
    }

    private fun subscribeToData() {
        viewModel.viewState.subscribe(this, ::handleViewState)
    }

    private fun handleViewState(viewState: ViewState<Any>) {
        when (viewState) {
            is Loading -> handleLoading()
            is Success -> navigateBackToMessageSession()
            is Error -> handleError(viewState.error.localizedMessage)
        }
    }

    private fun handleLoading() {
        Toast.makeText(this, "Loading", Toast.LENGTH_SHORT).show()
    }

    private fun handleError(error: String?) {
        Toast.makeText(this, error, Toast.LENGTH_LONG).show()
    }

    private fun navigateBackToMessageSession() {
        finish()
    }
}