/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

package com.amazonaws.services.chime.sdkdemo.common.extensions

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.annotation.LayoutRes
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.LiveData
import androidx.lifecycle.Observer
import com.amazonaws.services.chime.sdkdemo.AmazonChimeSDKMessagingDemoApp
import com.amazonaws.services.chime.sdkdemo.ViewModelFactory
import com.google.android.material.snackbar.Snackbar

inline fun <T> LiveData<T>.subscribe(owner: LifecycleOwner, crossinline onDataReceived: (T) -> Unit) =
    observe(owner, Observer { onDataReceived(it) })

fun snackbar(message: String, rootView: View) = Snackbar.make(rootView, message, Snackbar.LENGTH_SHORT).show()

fun ViewGroup.inflate(@LayoutRes layoutRes: Int, attachToRoot: Boolean = false): View {
    return LayoutInflater.from(context).inflate(layoutRes, this, attachToRoot)
}

fun View.visible() {
    visibility = View.VISIBLE
}

fun View.gone() {
    visibility = View.GONE
}

fun AppCompatActivity.getViewModelFactory(args: Bundle? = null): ViewModelFactory {
    val userRepository = (applicationContext as AmazonChimeSDKMessagingDemoApp).userRepository
    val messageRepository = (applicationContext as AmazonChimeSDKMessagingDemoApp).messageRepository
    return ViewModelFactory(userRepository, messageRepository, this, args)
}
