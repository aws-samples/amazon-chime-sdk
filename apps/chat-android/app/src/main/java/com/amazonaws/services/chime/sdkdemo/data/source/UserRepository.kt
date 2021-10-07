/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.chime.sdkdemo.data.source

import com.amazonaws.auth.AWSCredentials
import com.amazonaws.services.chime.sdk.messaging.session.ChimeUserCredentials
import com.amazonaws.services.chime.sdkdemo.data.Result
import com.amazonaws.services.chime.sdkdemo.data.User
import com.amazonaws.services.chime.sdkdemo.data.UserEndpoint
import com.amazonaws.services.chimesdkidentity.model.*

interface UserRepository {
    fun initialize(credentials: ChimeUserCredentials)

    suspend fun signIn(userName: String, password: String): Result<Any>

    suspend fun signOut()

    suspend fun getCurrentUser(): Result<User>

    suspend fun getCurrentUserEndpoint(): Result<UserEndpoint>

    suspend fun getAWSCredentials(): Result<AWSCredentials>

    suspend fun exchangeTokenForAwsCredential(accessToken: String): String?

    suspend fun registerAppInstanceUserEndpoint(deviceToken: String, appInstanceUserArn: String): Result<RegisterAppInstanceUserEndpointResult>

    suspend fun listAppInstanceUserEndpoints(appInstanceUserArn: String): Result<ListAppInstanceUserEndpointsResult>

    suspend fun describeAppInstanceUserEndpoint(endpointId: String, appInstanceUserArn: String): Result<DescribeAppInstanceUserEndpointResult>

    suspend fun deregisterAppInstanceUserEndpoint(endpointId: String, appInstanceUserArn: String): Result<String>

    suspend fun updateAppInstanceUserEndpoint(name: String?, allowMessage: AllowMessages, endpointId: String, appInstanceUserArn: String): Result<UpdateAppInstanceUserEndpointResult>
}
