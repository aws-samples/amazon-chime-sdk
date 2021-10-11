/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.chime.sdkdemo.ui.base

import android.content.Context
import android.view.MotionEvent
import android.view.View
import android.view.inputmethod.InputMethodManager
import android.widget.ProgressBar
import androidx.appcompat.app.AppCompatActivity
import com.amazonaws.services.chime.sdkdemo.common.EMPTY_STRING
import com.amazonaws.services.chime.sdkdemo.common.extensions.gone
import com.amazonaws.services.chime.sdkdemo.common.extensions.snackbar
import com.amazonaws.services.chime.sdkdemo.common.extensions.visible

abstract class BaseActivity : AppCompatActivity() {

    fun showError(errorMessage: String?, rootView: View) = snackbar(errorMessage ?: EMPTY_STRING, rootView)

    fun showLoading(progressBar: ProgressBar) = progressBar.visible()

    fun hideLoading(progressBar: ProgressBar) = progressBar.gone()

    override fun dispatchTouchEvent(ev: MotionEvent?): Boolean {
        if (currentFocus != null) {
            val imm =
                getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
            imm.hideSoftInputFromWindow(currentFocus!!.windowToken, 0)
        }
        return super.dispatchTouchEvent(ev)
    }
}
