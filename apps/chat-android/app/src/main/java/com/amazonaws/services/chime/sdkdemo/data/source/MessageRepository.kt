/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

package com.amazonaws.services.chime.sdkdemo.data.source

import com.amazonaws.services.chime.sdk.messaging.session.ChimeUserCredentials
import com.amazonaws.services.chime.sdkdemo.data.Result
import com.amazonaws.services.chimesdkmessaging.model.ListChannelMembershipsForAppInstanceUserResult

interface MessageRepository {
    fun initialize(credentials: ChimeUserCredentials)

    suspend fun getMessagingEndpoint(): Result<String>

    suspend fun sendMessage(content: String, channel: String, chimeBearer: String)

    suspend fun listChannels(appInstanceUserArn: String): Result<ListChannelMembershipsForAppInstanceUserResult>
}
