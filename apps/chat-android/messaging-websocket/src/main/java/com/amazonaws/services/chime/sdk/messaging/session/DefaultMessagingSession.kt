/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */

package com.amazonaws.services.chime.sdk.messaging.session

import com.amazonaws.services.chime.sdk.messaging.Message
import com.amazonaws.services.chime.sdk.messaging.internal.DefaultWebSocketAdapter
import com.amazonaws.services.chime.sdk.messaging.internal.WebSocketAdapter
import com.amazonaws.services.chime.sdk.messaging.internal.WebSocketAdapterObserver
import com.amazonaws.services.chime.sdk.messaging.utils.DefaultSigV4
import com.amazonaws.services.chime.sdk.messaging.utils.ObserverUtils
import com.amazonaws.services.chime.sdk.messaging.utils.SigV4
import com.amazonaws.services.chime.sdk.messaging.utils.logger.Logger
import com.google.gson.FieldNamingPolicy
import com.google.gson.GsonBuilder
import org.json.JSONObject

class DefaultMessagingSession(
    private val configuration: MessagingSessionConfiguration,
    private val logger: Logger,
    private val webSocketAdapter: WebSocketAdapter? = DefaultWebSocketAdapter(logger),
    private val sigV4: SigV4? = DefaultSigV4(logger, configuration.credentials, configuration.region)
) : MessagingSession {
    private val observers = mutableSetOf<MessagingSessionObserver>()
    private var isFirstMessageReceived: Boolean = false
    val gson = GsonBuilder().setFieldNamingStrategy(FieldNamingPolicy.UPPER_CAMEL_CASE).create()

    private val TAG = "DefaultMessageSession"

    override fun start() {
        val signedUrl = prepareWebSocketUrl()
        logger.info(TAG, "Opening connection to $signedUrl")

        webSocketAdapter?.create(signedUrl, object : WebSocketAdapterObserver {
            override fun onConnect() {
                ObserverUtils.notifyObserverOnMainThread(observers) {
                    it.onMessagingSessionConnecting(false)
                }
                isFirstMessageReceived = false
            }

            override fun onMessage(message: String) {
                handleMessage(message)
            }

            override fun onClose(status: MessagingSessionStatus) {
                ObserverUtils.notifyObserverOnMainThread(observers) {
                    it.onMessagingSessionStopped(status)
                }
            }
        })
    }

    private fun prepareWebSocketUrl(): String {
        val queryParams = mutableMapOf(
            "userArn" to listOf(configuration.userArn),
            "sessionId" to listOf(configuration.messagingSessionId)
        )
        return sigV4?.signURL(
            "GET",
            "wss",
            "chime",
            configuration.endpointUrl,
            "/connect",
            "",
            queryParams
        ) ?: ""
    }

    private fun handleMessage(data: String) {
        try {
            val message = gson.fromJson<Message>(data, Message::class.java)
            if (!isFirstMessageReceived) {
                // Since backend does authorization after the websocket open we cannot rely on open event for onStarted
                // as the socket will close if authorization fail after it open. So we trigger onStarted on first message event
                // instead
                ObserverUtils.notifyObserverOnMainThread(observers) {
                    it.onMessagingSessionStarted()
                }
                isFirstMessageReceived = true
            }

            ObserverUtils.notifyObserverOnMainThread(observers) {
                it.onMessagingSessionReceivedMessage(message)
            }
        } catch (error: Exception) {
            logger.error(TAG, "Failed to parse messages $data: ${error.localizedMessage}")
        }
    }

    override fun stop() {
        logger.info(TAG, "Stop connection.")
        webSocketAdapter?.close()
    }

    override fun addMessagingSessionObserver(observer: MessagingSessionObserver) {
        observers.add(observer)
    }

    override fun removeMessagingSessionObserver(observer: MessagingSessionObserver) {
        observers.remove(observer)
    }
}
