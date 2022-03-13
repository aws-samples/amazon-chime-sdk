/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.chime.sdkdemo.data.source.service

import com.amazonaws.services.chime.sdk.messaging.session.ChimeUserCredentials
import com.amazonaws.services.chime.sdkdemo.data.Result
import com.amazonaws.services.chimesdkidentity.model.AllowMessages
import com.amazonaws.services.chimesdkidentity.model.DescribeAppInstanceUserEndpointResult
import com.amazonaws.services.chimesdkidentity.model.ListAppInstanceUserEndpointsResult
import com.amazonaws.services.chimesdkidentity.model.RegisterAppInstanceUserEndpointResult
import com.amazonaws.services.chimesdkidentity.model.UpdateAppInstanceUserEndpointResult
import com.amazonaws.services.chimesdkmessaging.model.ChannelMembershipPreferences
import com.amazonaws.services.chimesdkmessaging.model.DescribeChannelResult
import com.amazonaws.services.chimesdkmessaging.model.GetChannelMembershipPreferencesResult
import com.amazonaws.services.chimesdkmessaging.model.ListChannelMembershipsForAppInstanceUserResult
import com.amazonaws.services.chimesdkmessaging.model.ListChannelMessagesResult
import com.amazonaws.services.chimesdkmessaging.model.MessageAttributeValue
import com.amazonaws.services.chimesdkmessaging.model.PushNotificationConfiguration
import com.amazonaws.services.chimesdkmessaging.model.PutChannelMembershipPreferencesResult

interface AmazonChimeSDKService {
    fun initialize(credentials: ChimeUserCredentials)

    suspend fun getMessagingEndpoint(): Result<String>

    suspend fun sendMessage(
        content: String,
        channel: String,
        chimeBearer: String,
        messageAttributes: Map<String, MessageAttributeValue>,
        pushConfig: PushNotificationConfiguration
    )

    suspend fun listChannelMembershipsForAppInstanceUser(chimeBearer: String): Result<ListChannelMembershipsForAppInstanceUserResult>

    suspend fun listChannelMessages(channelArn: String, chimeBearer: String): Result<ListChannelMessagesResult>

    suspend fun describeChannel(channelArn: String, chimeBearer: String): Result<DescribeChannelResult>

    suspend fun putChannelMembershipPreferences(
        channelArn: String,
        chimeBearer: String,
        preferences: ChannelMembershipPreferences
    ): Result<PutChannelMembershipPreferencesResult>

    suspend fun getChannelMembershipPreferences(channelArn: String, chimeBearer: String): Result<GetChannelMembershipPreferencesResult>

    suspend fun registerAppInstanceUserEndpoint(
        deviceToken: String,
        appInstanceUserArn: String
    ): Result<RegisterAppInstanceUserEndpointResult>

    suspend fun listAppInstanceUserEndpoints(appInstanceUserArn: String): Result<ListAppInstanceUserEndpointsResult>

    suspend fun describeAppInstanceUserEndpoint(
        endpointId: String,
        appInstanceUserArn: String
    ): Result<DescribeAppInstanceUserEndpointResult>

    suspend fun updateAppInstanceUserEndpoint(
        name: String?,
        allowMessage: AllowMessages,
        endpointId: String,
        appInstanceUserArn: String
    ): Result<UpdateAppInstanceUserEndpointResult>

    suspend fun deregisterAppInstanceUserEndpoint(endpointId: String, appInstanceUserArn: String): Result<String>
}
