/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

package com.amazonaws.services.chime.sdk.messaging.internal

interface WebSocketAdapter {
    fun create(url: String, observer: WebSocketAdapterObserver)

    fun close()
}
