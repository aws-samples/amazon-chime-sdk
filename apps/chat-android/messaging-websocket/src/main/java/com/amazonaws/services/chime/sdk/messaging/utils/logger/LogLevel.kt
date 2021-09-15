/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.chime.sdk.messaging.utils.logger

enum class LogLevel(val priority: Int) {
    VERBOSE(0),
    DEBUG(1),
    INFO(2),
    WARN(3),
    ERROR(4),
    OFF(5)
}
