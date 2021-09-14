/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

package com.amazonaws.services.chime.sdk.messaging.utils

interface SigV4 {

    fun signURL(
        method: String,
        scheme: String,
        serviceName: String,
        hostname: String,
        path: String,
        payload: String,
        queryParams: Map<String, List<String>>?
    ): String
}
