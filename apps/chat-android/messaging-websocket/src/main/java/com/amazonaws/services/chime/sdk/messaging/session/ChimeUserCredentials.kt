/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

package com.amazonaws.services.chime.sdk.messaging.session

import java.io.Serializable

data class ChimeUserCredentials(
    val accessKeyId: String,
    val secretAccessKey: String,
    val sessionToken: String? = null
) : Serializable
