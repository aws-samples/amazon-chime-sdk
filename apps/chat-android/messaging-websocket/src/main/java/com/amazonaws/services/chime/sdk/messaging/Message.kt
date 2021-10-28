/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.chime.sdk.messaging

data class Message(
    val Headers: Map<String, String>,
    val Payload: String
)
