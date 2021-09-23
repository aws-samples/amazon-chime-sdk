/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.chime.sdk.messaging.session

import kotlin.random.Random
import kotlin.random.nextUInt

data class MessagingSessionConfiguration(
    val userArn: String,
    val endpointUrl: String,
    val region: String,
    val credentials: ChimeUserCredentials,
    val messagingSessionId: String = Random.nextUInt().toString()
)
