/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

package com.amazonaws.services.chime.sdkdemo.data.source.service

import com.amazonaws.auth.BasicSessionCredentials
import com.amazonaws.regions.Region
import com.amazonaws.services.chime.sdk.messaging.session.ChimeUserCredentials
import com.amazonaws.services.chime.sdk.messaging.utils.logger.ConsoleLogger
import com.amazonaws.services.chime.sdkdemo.common.MESSAGING_SERVICE_REGION
import com.amazonaws.services.chime.sdkdemo.common.coroutine.CoroutineContextProvider
import com.amazonaws.services.chime.sdkdemo.data.Failure
import com.amazonaws.services.chime.sdkdemo.data.Result
import com.amazonaws.services.chime.sdkdemo.data.Success
import com.amazonaws.services.chimesdkmessaging.AmazonChimeSDKMessagingClient
import com.amazonaws.services.chimesdkmessaging.model.ChannelMessagePersistenceType
import com.amazonaws.services.chimesdkmessaging.model.ChannelMessageType
import com.amazonaws.services.chimesdkmessaging.model.GetMessagingSessionEndpointRequest
import com.amazonaws.services.chimesdkmessaging.model.ListChannelMembershipsForAppInstanceUserRequest
import com.amazonaws.services.chimesdkmessaging.model.ListChannelMembershipsForAppInstanceUserResult
import com.amazonaws.services.chimesdkmessaging.model.SendChannelMessageRequest
import java.util.UUID
import kotlinx.coroutines.withContext

class DefaultAmazonChimeSDKService : AmazonChimeSDKService {
    private val contextProvider = CoroutineContextProvider()
    private lateinit var amazonChimeSDKMessagingClient: AmazonChimeSDKMessagingClient
    private val logger = ConsoleLogger()
    private val TAG = "DefaultAmazonChimeSDKService"

    override fun initialize(credentials: ChimeUserCredentials) {
        amazonChimeSDKMessagingClient = AmazonChimeSDKMessagingClient(BasicSessionCredentials(
            credentials.accessKeyId,
            credentials.secretAccessKey,
            credentials.sessionToken
        )
        ).apply {
            setRegion(Region.getRegion(MESSAGING_SERVICE_REGION))
        }
    }

    override suspend fun getMessagingEndpoint(): Result<String> {
        return withContext<Result<String>>(contextProvider.io) {
            try {
                val response =
                    amazonChimeSDKMessagingClient.getMessagingSessionEndpoint(GetMessagingSessionEndpointRequest())
                Success(response.endpoint.url)
            } catch (error: Exception) {
                logger.error(TAG, "failed to get messaging endpoint: ${error.localizedMessage}")
                Failure(error)
            }
        }
    }

    override suspend fun sendMessage(content: String, channel: String, chimeBearer: String) {
        withContext(contextProvider.io) {
            try {
                val request = SendChannelMessageRequest()
                    .withChannelArn(channel)
                    .withContent(content)
                    .withPersistence(ChannelMessagePersistenceType.PERSISTENT)
                    .withType(ChannelMessageType.STANDARD)
                    .withChimeBearer(chimeBearer)
                    .withClientRequestToken(UUID.randomUUID().toString())
                amazonChimeSDKMessagingClient.sendChannelMessage(request)
            } catch (error: Exception) {
                logger.error(TAG, "failed to send message: ${error.localizedMessage}")
            }
        }
    }

    override suspend fun listChannels(appInstanceUserArn: String): Result<ListChannelMembershipsForAppInstanceUserResult> {
        return withContext<Result<ListChannelMembershipsForAppInstanceUserResult>>(contextProvider.io) {
            try {
                val request = ListChannelMembershipsForAppInstanceUserRequest()
                    .withAppInstanceUserArn(appInstanceUserArn)
                    .withChimeBearer(appInstanceUserArn)
                    .withMaxResults(10)
                val response = amazonChimeSDKMessagingClient.listChannelMembershipsForAppInstanceUser(request)
                Success(response)
            } catch (error: Exception) {
                logger.error(TAG, "failed to list channelsfor the appInstanceUser: ${error.localizedMessage}")
                Failure(error)
            }
        }
    }
}
