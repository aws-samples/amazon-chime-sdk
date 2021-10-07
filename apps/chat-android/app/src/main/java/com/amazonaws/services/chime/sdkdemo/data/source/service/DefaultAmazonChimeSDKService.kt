/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.chime.sdkdemo.data.source.service

import com.amazonaws.auth.BasicSessionCredentials
import com.amazonaws.regions.Region
import com.amazonaws.services.chime.sdk.messaging.session.ChimeUserCredentials
import com.amazonaws.services.chime.sdk.messaging.utils.logger.ConsoleLogger
import com.amazonaws.services.chime.sdkdemo.common.MESSAGING_SERVICE_REGION
import com.amazonaws.services.chime.sdkdemo.common.PINPOINT_APPLICATION_ARN
import com.amazonaws.services.chime.sdkdemo.common.coroutine.CoroutineContextProvider
import com.amazonaws.services.chime.sdkdemo.data.Failure
import com.amazonaws.services.chime.sdkdemo.data.Result
import com.amazonaws.services.chime.sdkdemo.data.Success
import com.amazonaws.services.chimesdkidentity.AmazonChimeSDKIdentityClient
import com.amazonaws.services.chimesdkidentity.model.*
import com.amazonaws.services.chimesdkmessaging.AmazonChimeSDKMessagingClient
import com.amazonaws.services.chimesdkmessaging.model.*
import java.util.UUID
import kotlinx.coroutines.withContext

class DefaultAmazonChimeSDKService : AmazonChimeSDKService {
    private val contextProvider = CoroutineContextProvider()
    private lateinit var amazonChimeSDKMessagingClient: AmazonChimeSDKMessagingClient
    private lateinit var amazonChimeSDKIdentityClient: AmazonChimeSDKIdentityClient
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
            endpoint = "https://messaging-chime-gamma.us-east-1.amazonaws.com"
        }

        amazonChimeSDKIdentityClient = AmazonChimeSDKIdentityClient(BasicSessionCredentials(
            credentials.accessKeyId,
            credentials.secretAccessKey,
            credentials.sessionToken
        )
        ).apply {
            setRegion(Region.getRegion(MESSAGING_SERVICE_REGION))
            endpoint = "https://identity-chime-gamma.us-east-1.amazonaws.com"
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

    override suspend fun sendMessage(content: String, channel: String, chimeBearer: String, messageAttributes: Map<String, MessageAttributeValue>, pushConfig: PushNotificationConfiguration) {
        withContext(contextProvider.io) {
            try {
                val request = SendChannelMessageRequest()
                    .withChannelArn(channel)
                    .withContent(content)
                    .withPersistence(ChannelMessagePersistenceType.PERSISTENT)
                    .withType(ChannelMessageType.STANDARD)
                    .withChimeBearer(chimeBearer)
                    .withPushNotification(pushConfig)
                    .withMessageAttributes(messageAttributes)
                    .withClientRequestToken(UUID.randomUUID().toString())
                logger.info(TAG, "Outgoing message $request")
                amazonChimeSDKMessagingClient.sendChannelMessage(request)
            } catch (error: Exception) {
                logger.error(TAG, "failed to send message: ${error.localizedMessage}")
            }
        }
    }

    override suspend fun listChannelMembershipsForAppInstanceUser(chimeBearer: String): Result<ListChannelMembershipsForAppInstanceUserResult> {
        return withContext<Result<ListChannelMembershipsForAppInstanceUserResult>>(contextProvider.io) {
            try {
                val request = ListChannelMembershipsForAppInstanceUserRequest()
                    .withAppInstanceUserArn(chimeBearer)
                    .withChimeBearer(chimeBearer)
                    .withMaxResults(10)
                val response = amazonChimeSDKMessagingClient.listChannelMembershipsForAppInstanceUser(request)
                Success(response)
            } catch (error: Exception) {
                logger.error(TAG, "failed to list channels for the appInstanceUser $chimeBearer ${error.localizedMessage}")
                Failure(error)
            }
        }
    }

    override suspend fun listChannels(appInstanceArn: String, chimeBearer: String): Result<ListChannelsResult> {
        return withContext<Result<ListChannelsResult>>(contextProvider.io) {
            try {
                val request = ListChannelsRequest()
                    .withAppInstanceArn(appInstanceArn)
                    .withChimeBearer(chimeBearer)
                val response = amazonChimeSDKMessagingClient.listChannels(request)
                Success(response)
            } catch (error: java.lang.Exception) {
                logger.error(TAG, "failed to list channels for the appInstanceUser: ${error.localizedMessage}")
                Failure(error)
            }
        }
    }

    override suspend fun listChannelMessages(channelArn: String, chimeBearer: String): Result<ListChannelMessagesResult> {
        return withContext<Result<ListChannelMessagesResult>>(contextProvider.io) {
            try {
                val request = ListChannelMessagesRequest()
                    .withChannelArn(channelArn)
                    .withChimeBearer(chimeBearer)
                val response = amazonChimeSDKMessagingClient.listChannelMessages(request)
                Success(response)
            } catch (error: Exception) {
                logger.error(TAG, "failed to list messages for the channel: ${error.localizedMessage}")
                Failure(error)
            }
        }
    }

    override suspend fun describeChannel(channelArn: String, chimeBearer: String): Result<DescribeChannelResult> {
        return withContext<Result<DescribeChannelResult>>(contextProvider.io) {
            try {
                val request = DescribeChannelRequest()
                    .withChannelArn(channelArn)
                    .withChimeBearer(chimeBearer)
                val response = amazonChimeSDKMessagingClient.describeChannel(request)
                Success(response)
            } catch (error: Exception) {
                logger.error(TAG, "failed to list messages for the channel: ${error.localizedMessage}")
                Failure(error)
            }
        }
    }

    override suspend fun putChannelMembershipPreferences(channelArn: String, chimeBearer: String,
                                                         preferences: ChannelMembershipPreferences):
            Result<PutChannelMembershipPreferencesResult> {
        return withContext<Result<PutChannelMembershipPreferencesResult>>(contextProvider.io) {
            try {
                val request = PutChannelMembershipPreferencesRequest()
                    .withChannelArn(channelArn)
                    .withChimeBearer(chimeBearer)
                    .withMemberArn(chimeBearer)
                    .withPreferences(preferences)
                val response = amazonChimeSDKMessagingClient.putChannelMembershipPreferences(request)
                Success(response)
            } catch (error: java.lang.Exception) {
                logger.error(TAG, "failed to put channel membership preferences: ${error.localizedMessage}")
                Failure(error)
            }
        }
    }

    override suspend fun getChannelMembershipPreferences(channelArn: String, chimeBearer: String):
            Result<GetChannelMembershipPreferencesResult> {
        return withContext<Result<GetChannelMembershipPreferencesResult>>(contextProvider.io) {
            try {
                val request = GetChannelMembershipPreferencesRequest()
                    .withChannelArn(channelArn)
                    .withChimeBearer(chimeBearer)
                    .withMemberArn(chimeBearer)
                val response = amazonChimeSDKMessagingClient.getChannelMembershipPreferences(request)
                Success(response)
            } catch (error: java.lang.Exception) {
                logger.error(TAG, "failed to put channel membership preferences: ${error.localizedMessage}")
                Failure(error)
            }
        }
    }

    override suspend fun registerAppInstanceUserEndpoint(deviceToken: String, appInstanceUserArn: String): Result<RegisterAppInstanceUserEndpointResult> {
        return withContext<Result<RegisterAppInstanceUserEndpointResult>>(contextProvider.io) {
            try {
                val request = RegisterAppInstanceUserEndpointRequest()
                    .withClientRequestToken(UUID.randomUUID().toString())
                    .withAppInstanceUserArn(appInstanceUserArn)
                    .withType("GCM")
                    .withResourceArn(PINPOINT_APPLICATION_ARN)
                    .withEndpointAttributes(EndpointAttributes()
                        .withDeviceToken(deviceToken))
                val response = amazonChimeSDKIdentityClient.registerAppInstanceUserEndpoint(request)
                Success(response)
            } catch (error: Exception) {
                logger.error(TAG, "failed to register endpoint: ${error.localizedMessage}")
                Failure(error)
            }
        }
    }

    override suspend fun deregisterAppInstanceUserEndpoint(endpointId: String, appInstanceUserArn: String): Result<String> {
        return withContext(contextProvider.io) {
            try {
                val request = DeregisterAppInstanceUserEndpointRequest()
                    .withAppInstanceUserArn(appInstanceUserArn)
                    .withEndpointId(endpointId)
                amazonChimeSDKIdentityClient.deregisterAppInstanceUserEndpoint(request)
                Success("Success")
            } catch (error: Exception) {
                logger.error(TAG, "failed to deregister endpoint: ${error.localizedMessage}")
                Failure(error)
            }
        }
    }

    override suspend fun listAppInstanceUserEndpoints(appInstanceUserArn: String): Result<ListAppInstanceUserEndpointsResult> {
        return withContext<Result<ListAppInstanceUserEndpointsResult>>(contextProvider.io) {
            try {
                val request = ListAppInstanceUserEndpointsRequest()
                    .withAppInstanceUserArn(appInstanceUserArn)
                val response = amazonChimeSDKIdentityClient.listAppInstanceUserEndpoints(request)
                Success(response)
            } catch (error: Exception) {
                logger.error(TAG, "failed to list endpoints: ${error.localizedMessage}")
                Failure(error)
            }
        }
    }

    override suspend fun describeAppInstanceUserEndpoint(endpointId: String, appInstanceUserArn: String): Result<DescribeAppInstanceUserEndpointResult> {
        return withContext<Result<DescribeAppInstanceUserEndpointResult>>(contextProvider.io) {
            try {
                val request = DescribeAppInstanceUserEndpointRequest()
                    .withAppInstanceUserArn(appInstanceUserArn)
                    .withEndpointId(endpointId)
                val response = amazonChimeSDKIdentityClient.describeAppInstanceUserEndpoint(request)
                Success(response)
            } catch (error: Exception) {
                logger.error(TAG, "failed to describe endpoint: ${error.localizedMessage}")
                Failure(error)
            }
        }
    }

    override suspend fun updateAppInstanceUserEndpoint(name: String?, allowMessage: AllowMessages, endpointId: String, appInstanceUserArn: String):
            Result<UpdateAppInstanceUserEndpointResult> {
        return withContext<Result<UpdateAppInstanceUserEndpointResult>>(contextProvider.io) {
            try {
                val request = UpdateAppInstanceUserEndpointRequest()
                    .withAppInstanceUserArn(appInstanceUserArn)
                    .withEndpointId(endpointId)
                    .withAllowMessages(allowMessage)
                    .withName(name)
                val response = amazonChimeSDKIdentityClient.updateAppInstanceUserEndpoint(request)
                Success(response)
            } catch (error: Exception) {
                logger.error(TAG, "failed to update endpoint: ${error.localizedMessage}")
                Failure(error)
            }
        }
    }
}
