/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.chime.sdkdemo.data.source.service

import com.amazonaws.services.chime.sdk.messaging.session.ChimeUserCredentials
import com.amazonaws.services.chime.sdkdemo.data.Result
import com.amazonaws.services.chimesdkmessaging.model.ListChannelMembershipsForAppInstanceUserResult

interface AmazonChimeSDKService {
    fun initialize(credentials: ChimeUserCredentials)

    suspend fun getMessagingEndpoint(): Result<String>

    suspend fun sendMessage(content: String, channel: String, chimeBearer: String)

    suspend fun listChannels(appInstanceUserArn: String): Result<ListChannelMembershipsForAppInstanceUserResult>
}
