/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

package com.amazonaws.services.chime.sdkdemo.data.source.service

import com.amazonaws.auth.AWSCredentials
import com.amazonaws.services.chime.sdk.messaging.utils.logger.ConsoleLogger
import com.amazonaws.services.chime.sdkdemo.common.API_GATEWAY_INVOKE_URL
import com.amazonaws.services.chime.sdkdemo.common.APP_INSTANCE_ARN
import com.amazonaws.services.chime.sdkdemo.common.coroutine.CoroutineContextProvider
import com.amazonaws.services.chime.sdkdemo.data.Failure
import com.amazonaws.services.chime.sdkdemo.data.Result
import com.amazonaws.services.chime.sdkdemo.data.Success
import com.amazonaws.services.chime.sdkdemo.data.User
import com.amplifyframework.auth.AuthException
import com.amplifyframework.auth.AuthSession
import com.amplifyframework.auth.cognito.AWSCognitoAuthSession
import com.amplifyframework.auth.result.AuthSignInResult
import com.amplifyframework.core.Amplify
import com.amplifyframework.core.Consumer
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class DefaultAuthService : AuthService {
    private val contextProvider = CoroutineContextProvider()
    private val ioDispatcher: CoroutineDispatcher = Dispatchers.IO
    private val logger = ConsoleLogger()
    private val TAG = "DefaultAuthService"

    override suspend fun signIn(userName: String, password: String): Result<Any> {
        val result = CompletableDeferred<Result<Any>>()
        val onSuccess = Consumer<AuthSignInResult> {
            if (!it.isSignInComplete) {
                result.complete(Failure(AuthException(it.toString(), it.nextStep.toString())))
            } else {
                result.complete(Success(it))
            }
        }
        val onError = Consumer<AuthException> {
            result.complete(Failure(it))
        }

        withContext(contextProvider.io) {
            Amplify.Auth.signIn(
                userName,
                password,
                onSuccess,
                onError
            )
        }

        return result.await()
    }

    override suspend fun signOut() {
        Amplify.Auth.signOut(
            { Unit },
            { Unit }
        )
    }

    override suspend fun getCurrentUser(): Result<User> {
        val result = CompletableDeferred<Result<User>>()
        val onSuccess = Consumer<AuthSession> {
            it as AWSCognitoAuthSession

            if (it.identityId.value != null) {
                val userArn = "$APP_INSTANCE_ARN/user/${it.identityId.value}"
                result.complete(
                    Success(
                        User(Amplify.Auth.currentUser.username, it.identityId.value!!, userArn)
                    )
                )
            } else {
                result.complete(
                    Failure(
                        it.identityId.error ?: Exception("Failed to get User: No identityId")
                    )
                )
            }
        }
        val onError = Consumer<AuthException> {
            result.complete(Failure(it))
        }

        withContext(contextProvider.io) {
            Amplify.Auth.fetchAuthSession(onSuccess, onError)
        }

        return result.await()
    }

    override suspend fun getAWSCredentials(): Result<AWSCredentials> {
        val result = CompletableDeferred<Result<AWSCredentials>>()
        val onSuccess = Consumer<AuthSession> {
            it as AWSCognitoAuthSession

            if (it.awsCredentials.value != null) {
                result.complete(Success(it.awsCredentials.value!!))
            } else {
                result.complete(
                    Failure(
                        it.awsCredentials.error ?: Exception("Failed to fetch credential: Unknown")
                    )
                )
            }
        }
        val onError = Consumer<AuthException> {
            result.complete(Failure(it))
        }

        withContext(contextProvider.io) {
            Amplify.Auth.fetchAuthSession(onSuccess, onError)
        }

        return result.await()
    }

    /**
     * The Credential Exchange Service is a small AWS Lambda function running behind Amazon API Gateway that enables
     * exchanging your application's or identity provider's (IDP) token for AWS credentials, or for you to implement
     * custom authentication.
     * https://github.com/aws-samples/amazon-chime-sdk/tree/main/apps/chat#credential-exchange-service
     * By default the AWS Lambda function returns anonymous access regardless of the token provided
     */
    override suspend fun exchangeTokenForAwsCredential(accessToken: String): String? {
        return withContext(ioDispatcher) {
            val url = URL("${API_GATEWAY_INVOKE_URL}creds")
            try {
                val response = StringBuffer()
                with(url.openConnection() as HttpURLConnection) {
                    requestMethod = "POST"
                    doInput = true
                    doOutput = true
                    setRequestProperty("Authorization", "Bearer $accessToken")

                    BufferedReader(InputStreamReader(inputStream)).use {
                        var inputLine = it.readLine()
                        while (inputLine != null) {
                            response.append(inputLine)
                            inputLine = it.readLine()
                        }
                        it.close()
                    }

                    if (responseCode == 200) {
                        response.toString()
                    } else {
                        logger.info(TAG, "Unable to exchange token. Response code: $responseCode")
                        null
                    }
                }
            } catch (exception: Exception) {
                logger.error(TAG, "There was an exception while exchanging token: $exception")
                null
            }
        }
    }
}
