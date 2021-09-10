/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

package com.amazonaws.services.chime.sdk.messaging.utils.logger

/**
 * [Logger] defines how to write logs for different logging level.
 */
interface Logger {

    /**
     * Emits an verbose message if the log level is equal to or lower than verbose level.
     */
    fun verbose(tag: String, msg: String)

    /**
     * Emits an debug message if the log level is equal to or lower than debug level.
     */
    fun debug(tag: String, msg: String)

    /**
     * Emits an info message if the log level is equal to or lower than info level.
     */
    fun info(tag: String, msg: String)

    /**
     * Emits a warning message if the log level is equal to or lower than warn level.
     */
    fun warn(tag: String, msg: String)

    /**
     * Emits an error message if the log level is equal to or lower than error level.
     */
    fun error(tag: String, msg: String)

    /**
     * Sets the log level.
     */
    fun setLogLevel(level: LogLevel)

    /**
     * Gets the current log level.
     */
    fun getLogLevel(): LogLevel
}
