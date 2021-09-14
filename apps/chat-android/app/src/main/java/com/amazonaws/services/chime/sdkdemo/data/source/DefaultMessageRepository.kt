/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

package com.amazonaws.services.chime.sdkdemo.data.source

import com.amazonaws.services.chime.sdk.messaging.session.ChimeUserCredentials
import com.amazonaws.services.chime.sdkdemo.data.Result
import com.amazonaws.services.chime.sdkdemo.data.source.service.AmazonChimeSDKService
import com.amazonaws.services.chimesdkmessaging.model.ListChannelMembershipsForAppInstanceUserResult

class DefaultMessageRepository(
    private val amazonChimeSDKService: AmazonChimeSDKService
) : MessageRepository {
    override fun initialize(credentials: ChimeUserCredentials) = amazonChimeSDKService.initialize(credentials)

    override suspend fun getMessagingEndpoint(): Result<String> = amazonChimeSDKService.getMessagingEndpoint()

    override suspend fun sendMessage(content: String, channel: String, chimeBearer: String) = amazonChimeSDKService.sendMessage(content, channel, chimeBearer)

    override suspend fun listChannels(appInstanceUserArn: String): Result<ListChannelMembershipsForAppInstanceUserResult> = amazonChimeSDKService.listChannels(appInstanceUserArn)
}
