/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

package com.amazonaws.services.chime.sdkdemo.data.source

import com.amazonaws.auth.AWSCredentials
import com.amazonaws.services.chime.sdkdemo.data.Result
import com.amazonaws.services.chime.sdkdemo.data.User
import com.amazonaws.services.chime.sdkdemo.data.source.service.AuthService

class DefaultUserRepository(
    private val authService: AuthService
) : UserRepository {
    override suspend fun signIn(userName: String, password: String): Result<Any> = authService.signIn(userName, password)

    override suspend fun signOut() = authService.signOut()

    override suspend fun getCurrentUser(): Result<User> = authService.getCurrentUser()

    override suspend fun getAWSCredentials(): Result<AWSCredentials> = authService.getAWSCredentials()

    override suspend fun exchangeTokenForAwsCredential(accessToken: String): String? = authService.exchangeTokenForAwsCredential(accessToken)
}
