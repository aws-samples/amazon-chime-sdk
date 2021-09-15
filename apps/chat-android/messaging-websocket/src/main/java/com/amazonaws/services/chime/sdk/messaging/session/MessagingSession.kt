/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.chime.sdk.messaging.session

interface MessagingSession {
    fun start()

    fun stop()

    fun addMessagingSessionObserver(observer: MessagingSessionObserver)

    fun removeMessagingSessionObserver(observer: MessagingSessionObserver)
}
