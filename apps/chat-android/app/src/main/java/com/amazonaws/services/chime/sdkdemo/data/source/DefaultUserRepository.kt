/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.chime.sdkdemo.data.source

import com.amazonaws.auth.AWSCredentials
import com.amazonaws.services.chime.sdk.messaging.session.ChimeUserCredentials
import com.amazonaws.services.chime.sdkdemo.data.Failure
import com.amazonaws.services.chime.sdkdemo.data.Result
import com.amazonaws.services.chime.sdkdemo.data.Success
import com.amazonaws.services.chime.sdkdemo.data.User
import com.amazonaws.services.chime.sdkdemo.data.UserEndpoint
import com.amazonaws.services.chime.sdkdemo.data.onSuccess
import com.amazonaws.services.chime.sdkdemo.data.source.service.AmazonChimeSDKService
import com.amazonaws.services.chime.sdkdemo.data.source.service.AuthService
import com.amazonaws.services.chimesdkidentity.model.AllowMessages
import com.google.android.gms.tasks.OnCompleteListener
import com.google.firebase.ktx.Firebase
import com.google.firebase.messaging.ktx.messaging
import kotlinx.coroutines.CompletableDeferred

class DefaultUserRepository(
    private val authService: AuthService,
    private val chimeSDKService: AmazonChimeSDKService
) : UserRepository {
    override fun initialize(credentials: ChimeUserCredentials) = chimeSDKService.initialize(credentials)

    override suspend fun signIn(userName: String, password: String): Result<Any> = authService.signIn(userName, password)

    override suspend fun signOut() = authService.signOut()

    override suspend fun getCurrentUser(): Result<User> = authService.getCurrentUser()

    override suspend fun getAWSCredentials(): Result<AWSCredentials> = authService.getAWSCredentials()

    override suspend fun exchangeTokenForAwsCredential(accessToken: String): String? =
        authService.exchangeTokenForAwsCredential(accessToken)

    override suspend fun registerAppInstanceUserEndpoint(deviceToken: String, appInstanceUserArn: String) =
        chimeSDKService.registerAppInstanceUserEndpoint(deviceToken, appInstanceUserArn)

    override suspend fun listAppInstanceUserEndpoints(appInstanceUserArn: String) =
        chimeSDKService.listAppInstanceUserEndpoints(appInstanceUserArn)

    override suspend fun describeAppInstanceUserEndpoint(endpointId: String, appInstanceUserArn: String) =
        chimeSDKService.describeAppInstanceUserEndpoint(endpointId, appInstanceUserArn)

    override suspend fun updateAppInstanceUserEndpoint(
        name: String?,
        allowMessage: AllowMessages,
        endpointId: String,
        appInstanceUserArn: String
    ) = chimeSDKService.updateAppInstanceUserEndpoint(name, allowMessage, endpointId, appInstanceUserArn)

    override suspend fun deregisterAppInstanceUserEndpoint(endpointId: String, appInstanceUserArn: String) =
        chimeSDKService.deregisterAppInstanceUserEndpoint(endpointId, appInstanceUserArn)

    override suspend fun getCurrentUserEndpoint(): Result<UserEndpoint> {
        val result = CompletableDeferred<Result<UserEndpoint>>()
        var token = ""
        Firebase.messaging.token.addOnCompleteListener(OnCompleteListener { task ->
            if (!task.isSuccessful) {
                return@OnCompleteListener
            }
            token = task.result.toString()
        })

        getCurrentUser().onSuccess { user ->
            listAppInstanceUserEndpoints(user.chimeAppInstanceUserArn)
                .onSuccess { listAppInstanceUserEndpointsResult ->
                    for (endpoint in listAppInstanceUserEndpointsResult.appInstanceUserEndpoints) {
                        describeAppInstanceUserEndpoint(endpoint.endpointId, endpoint.appInstanceUserArn)
                            .onSuccess {
                                if (it.appInstanceUserEndpoint.endpointAttributes.deviceToken == token) {
                                    val ep = it.appInstanceUserEndpoint
                                    result.complete(Success(UserEndpoint(ep.endpointId, ep.appInstanceUserArn, ep.name, ep.allowMessages)))
                                }
                            }
                    }
                }
        }
        result.complete(Failure(RuntimeException("Failed to fetch current endpoint")))

        return result.await()
    }
}
