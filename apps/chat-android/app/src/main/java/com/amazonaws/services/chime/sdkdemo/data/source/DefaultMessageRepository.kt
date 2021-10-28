/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.chime.sdkdemo.data.source

import com.amazonaws.services.chime.sdk.messaging.session.ChimeUserCredentials
import com.amazonaws.services.chime.sdkdemo.data.Result
import com.amazonaws.services.chime.sdkdemo.data.source.service.AmazonChimeSDKService
import com.amazonaws.services.chimesdkmessaging.model.ChannelMembershipPreferences
import com.amazonaws.services.chimesdkmessaging.model.ListChannelMembershipsForAppInstanceUserResult
import com.amazonaws.services.chimesdkmessaging.model.MessageAttributeValue
import com.amazonaws.services.chimesdkmessaging.model.PushNotificationConfiguration

class DefaultMessageRepository(
    private val amazonChimeSDKService: AmazonChimeSDKService
) : MessageRepository {
    override fun initialize(credentials: ChimeUserCredentials) = amazonChimeSDKService.initialize(credentials)

    override suspend fun getMessagingEndpoint(): Result<String> = amazonChimeSDKService.getMessagingEndpoint()

    override suspend fun sendMessage(
        content: String,
        channelArn: String,
        chimeBearer: String,
        messageAttributes: Map<String, MessageAttributeValue>,
        pushConfig: PushNotificationConfiguration
    ) = amazonChimeSDKService.sendMessage(content, channelArn, chimeBearer, messageAttributes, pushConfig)

    override suspend fun listChannelMembershipsForAppInstanceUser(chimeBearer: String): Result<ListChannelMembershipsForAppInstanceUserResult> =
        amazonChimeSDKService.listChannelMembershipsForAppInstanceUser(chimeBearer)

    override suspend fun listChannelMessages(channelArn: String, chimeBearer: String) =
        amazonChimeSDKService.listChannelMessages(channelArn, chimeBearer)

    override suspend fun describeChannel(channelArn: String, chimeBearer: String) =
        amazonChimeSDKService.describeChannel(channelArn, chimeBearer)

    override suspend fun putChannelMembershipPreferences(
        channelArn: String,
        chimeBearer: String,
        preferences: ChannelMembershipPreferences
    ) = amazonChimeSDKService.putChannelMembershipPreferences(channelArn, chimeBearer, preferences)

    override suspend fun getChannelMembershipPreferences(channelArn: String, chimeBearer: String) =
        amazonChimeSDKService.getChannelMembershipPreferences(channelArn, chimeBearer)
}
