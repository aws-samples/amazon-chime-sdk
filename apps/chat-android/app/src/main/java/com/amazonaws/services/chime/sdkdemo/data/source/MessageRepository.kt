/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.chime.sdkdemo.data.source

import com.amazonaws.services.chime.sdk.messaging.session.ChimeUserCredentials
import com.amazonaws.services.chime.sdkdemo.data.Result
import com.amazonaws.services.chimesdkmessaging.model.*

interface MessageRepository {
    fun initialize(credentials: ChimeUserCredentials)

    suspend fun getMessagingEndpoint(): Result<String>

    suspend fun sendMessage(content: String, channelArn: String, chimeBearer: String, messageAttributes: Map<String, MessageAttributeValue>, pushConfig: PushNotificationConfiguration)

    suspend fun listChannelMembershipsForAppInstanceUser(chimeBearer: String): Result<ListChannelMembershipsForAppInstanceUserResult>

    suspend fun listChannels(appInstanceArn: String, chimeBearer: String): Result<ListChannelsResult>

    suspend fun listChannelMessages(channelArn: String, chimeBearer: String): Result<ListChannelMessagesResult>

    suspend fun describeChannel(channelArn: String, chimeBearer: String): Result<DescribeChannelResult>

    suspend fun putChannelMembershipPreferences(channelArn: String, chimeBearer: String, preferences: ChannelMembershipPreferences): Result<PutChannelMembershipPreferencesResult>

    suspend fun getChannelMembershipPreferences(channelArn: String, chimeBearer: String): Result<GetChannelMembershipPreferencesResult>
}
