/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

package com.amazonaws.services.chime.sdkdemo.data

data class ChannelMessage(
    val messageId: String,
    val senderName: String,
    val isLocal: Boolean,
    val displayTime: String,
    val content: String
)
