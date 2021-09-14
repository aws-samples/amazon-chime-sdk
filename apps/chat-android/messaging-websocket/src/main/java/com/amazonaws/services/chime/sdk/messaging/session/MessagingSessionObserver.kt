/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

package com.amazonaws.services.chime.sdk.messaging.session

import com.amazonaws.services.chime.sdk.messaging.Message

interface MessagingSessionObserver {
    fun onMessagingSessionStarted()

    fun onMessagingSessionConnecting(reconnecting: Boolean)

    fun onMessagingSessionStopped(status: MessagingSessionStatus)

    fun onMessagingSessionReceivedMessage(message: Message)
}
