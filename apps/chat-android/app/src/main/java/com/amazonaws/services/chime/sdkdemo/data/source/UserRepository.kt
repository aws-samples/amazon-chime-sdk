/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.chime.sdkdemo.data.source

import com.amazonaws.auth.AWSCredentials
import com.amazonaws.services.chime.sdkdemo.data.Result
import com.amazonaws.services.chime.sdkdemo.data.User

interface UserRepository {
    suspend fun signIn(userName: String, password: String): Result<Any>

    suspend fun signOut()

    suspend fun getCurrentUser(): Result<User>

    suspend fun getAWSCredentials(): Result<AWSCredentials>

    suspend fun exchangeTokenForAwsCredential(accessToken: String): String?
}
