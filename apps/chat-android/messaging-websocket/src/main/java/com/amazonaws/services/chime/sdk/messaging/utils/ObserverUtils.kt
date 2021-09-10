/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

package com.amazonaws.services.chime.sdk.messaging.utils

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * [ObserverUtils] are util functions that can be used with observers.
 */
class ObserverUtils {
    companion object {
        private val uiScope = CoroutineScope(Dispatchers.Main)
        /**
         * Run observer methods on main thread
         *
         * @param observers: Set<T> - Set of observers
         * @param observerFunction: (observer: T) -> Unit - function to be executed with observer
         */
        fun <T> notifyObserverOnMainThread(observers: Set<T>, observerFunction: (observer: T) -> Unit) {
            uiScope.launch {
                for (observer in observers) {
                    observerFunction(observer)
                }
            }
        }
    }
}
