/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.chime.sdkdemo.data

import java.io.Serializable

data class User(
    val chimeDisplayName: String,
    val chimeUserId: String,
    val chimeAppInstanceUserArn: String
) : Serializable
