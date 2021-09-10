/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

package com.amazonaws.services.chime.sdk.messaging.internal

import com.amazonaws.services.chime.sdk.messaging.session.MessagingSessionStatus

interface WebSocketAdapterObserver {
    fun onConnect()

    fun onMessage(message: String)

    fun onClose(status: MessagingSessionStatus)
}
