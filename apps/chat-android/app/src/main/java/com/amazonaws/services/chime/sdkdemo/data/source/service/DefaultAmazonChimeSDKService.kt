/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.chime.sdkdemo.data.source.service

import com.amazonaws.auth.BasicSessionCredentials
import com.amazonaws.regions.Region
import com.amazonaws.services.chime.sdk.messaging.session.ChimeUserCredentials
import com.amazonaws.services.chime.sdk.messaging.utils.logger.ConsoleLogger
import com.amazonaws.services.chime.sdkdemo.common.APP_INSTANCE_USER_ENDPOINT_TYPE
import com.amazonaws.services.chime.sdkdemo.common.MESSAGING_SERVICE_REGION
import com.amazonaws.services.chime.sdkdemo.common.PINPOINT_APPLICATION_ARN
import com.amazonaws.services.chime.sdkdemo.common.coroutine.CoroutineContextProvider
import com.amazonaws.services.chime.sdkdemo.data.Failure
import com.amazonaws.services.chime.sdkdemo.data.Result
import com.amazonaws.services.chime.sdkdemo.data.Success
import com.amazonaws.services.chimesdkidentity.AmazonChimeSDKIdentityClient
import com.amazonaws.services.chimesdkidentity.model.AllowMessages
import com.amazonaws.services.chimesdkidentity.model.DeregisterAppInstanceUserEndpointRequest
import com.amazonaws.services.chimesdkidentity.model.DescribeAppInstanceUserEndpointRequest
import com.amazonaws.services.chimesdkidentity.model.DescribeAppInstanceUserEndpointResult
import com.amazonaws.services.chimesdkidentity.model.EndpointAttributes
import com.amazonaws.services.chimesdkidentity.model.ListAppInstanceUserEndpointsRequest
import com.amazonaws.services.chimesdkidentity.model.ListAppInstanceUserEndpointsResult
import com.amazonaws.services.chimesdkidentity.model.RegisterAppInstanceUserEndpointRequest
import com.amazonaws.services.chimesdkidentity.model.RegisterAppInstanceUserEndpointResult
import com.amazonaws.services.chimesdkidentity.model.UpdateAppInstanceUserEndpointRequest
import com.amazonaws.services.chimesdkidentity.model.UpdateAppInstanceUserEndpointResult
import com.amazonaws.services.chimesdkmessaging.AmazonChimeSDKMessagingClient
import com.amazonaws.services.chimesdkmessaging.model.ChannelMembershipPreferences
import com.amazonaws.services.chimesdkmessaging.model.ChannelMessagePersistenceType
import com.amazonaws.services.chimesdkmessaging.model.ChannelMessageType
import com.amazonaws.services.chimesdkmessaging.model.DescribeChannelRequest
import com.amazonaws.services.chimesdkmessaging.model.DescribeChannelResult
import com.amazonaws.services.chimesdkmessaging.model.GetChannelMembershipPreferencesRequest
import com.amazonaws.services.chimesdkmessaging.model.GetChannelMembershipPreferencesResult
import com.amazonaws.services.chimesdkmessaging.model.GetMessagingSessionEndpointRequest
import com.amazonaws.services.chimesdkmessaging.model.ListChannelMembershipsForAppInstanceUserRequest
import com.amazonaws.services.chimesdkmessaging.model.ListChannelMembershipsForAppInstanceUserResult
import com.amazonaws.services.chimesdkmessaging.model.ListChannelMessagesRequest
import com.amazonaws.services.chimesdkmessaging.model.ListChannelMessagesResult
import com.amazonaws.services.chimesdkmessaging.model.MessageAttributeValue
import com.amazonaws.services.chimesdkmessaging.model.PushNotificationConfiguration
import com.amazonaws.services.chimesdkmessaging.model.PutChannelMembershipPreferencesRequest
import com.amazonaws.services.chimesdkmessaging.model.PutChannelMembershipPreferencesResult
import com.amazonaws.services.chimesdkmessaging.model.SendChannelMessageRequest
import java.util.UUID
import kotlinx.coroutines.withContext

class DefaultAmazonChimeSDKService : AmazonChimeSDKService {
    private val contextProvider = CoroutineContextProvider()
    private lateinit var amazonChimeSDKMessagingClient: AmazonChimeSDKMessagingClient
    private lateinit var amazonChimeSDKIdentityClient: AmazonChimeSDKIdentityClient
    private val logger = ConsoleLogger()
    private val TAG = "DefaultAmazonChimeSDKService"

    override fun initialize(credentials: ChimeUserCredentials) {
        amazonChimeSDKMessagingClient = AmazonChimeSDKMessagingClient(
            BasicSessionCredentials(
                credentials.accessKeyId,
                credentials.secretAccessKey,
                credentials.sessionToken
            )
        ).apply {
            setRegion(Region.getRegion(MESSAGING_SERVICE_REGION))
        }

        amazonChimeSDKIdentityClient = AmazonChimeSDKIdentityClient(
            BasicSessionCredentials(
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

    override suspend fun sendMessage(
        content: String,
        channel: String,
        chimeBearer: String,
        messageAttributes: Map<String, MessageAttributeValue>,
        pushConfig: PushNotificationConfiguration
    ) {
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
                logger.error(TAG, "failed to list channel memberships for the appInstanceUser $chimeBearer ${error.localizedMessage}")
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
                logger.error(TAG, "failed to describe channel: ${error.localizedMessage}")
                Failure(error)
            }
        }
    }

    override suspend fun putChannelMembershipPreferences(channelArn: String, chimeBearer: String, preferences: ChannelMembershipPreferences):
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
                logger.error(TAG, "failed to get channel membership preferences: ${error.localizedMessage}")
                Failure(error)
            }
        }
    }

    override suspend fun registerAppInstanceUserEndpoint(
        deviceToken: String,
        appInstanceUserArn: String
    ): Result<RegisterAppInstanceUserEndpointResult> {
        return withContext<Result<RegisterAppInstanceUserEndpointResult>>(contextProvider.io) {
            try {
                val request = RegisterAppInstanceUserEndpointRequest()
                    .withClientRequestToken(UUID.randomUUID().toString())
                    .withAppInstanceUserArn(appInstanceUserArn)
                    .withType(APP_INSTANCE_USER_ENDPOINT_TYPE)
                    .withResourceArn(PINPOINT_APPLICATION_ARN)
                    .withEndpointAttributes(
                        EndpointAttributes()
                            .withDeviceToken(deviceToken)
                    )
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

    override suspend fun describeAppInstanceUserEndpoint(
        endpointId: String,
        appInstanceUserArn: String
    ): Result<DescribeAppInstanceUserEndpointResult> {
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

    override suspend fun updateAppInstanceUserEndpoint(
        name: String?,
        allowMessage: AllowMessages,
        endpointId: String,
        appInstanceUserArn: String
    ):
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
