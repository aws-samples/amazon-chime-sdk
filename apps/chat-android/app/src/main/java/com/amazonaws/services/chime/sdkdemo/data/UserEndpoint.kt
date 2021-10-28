/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.chime.sdkdemo.data

data class UserEndpoint(
    val endpointId: String,
    val appInstanceUserArn: String,
    val name: String?,
    val allowMessages: String
)
