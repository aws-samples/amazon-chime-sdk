/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

package com.amazonaws.services.chime.sdk.messaging.internal

import com.amazonaws.services.chime.sdk.messaging.session.MessagingSessionStatus
import com.amazonaws.services.chime.sdk.messaging.utils.logger.Logger
import java.util.concurrent.TimeUnit
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener

class DefaultWebSocketAdapter(
    private val logger: Logger
) : WebSocketAdapter {
        private val client: OkHttpClient =
        OkHttpClient.Builder()
            .pingInterval(60, TimeUnit.SECONDS)
            .build()
    private var session: WebSocket? = null

    private val TAG = "DefaultWebSocketAdapter"

    override fun create(url: String, observer: WebSocketAdapterObserver) {
        GlobalScope.launch {
            val request = Request.Builder().url(url).build()
            client.newWebSocket(request, object : WebSocketListener() {
                override fun onOpen(webSocket: WebSocket, response: Response) {
                    session = webSocket
                    logger.info(TAG, "onOpen response: $response")
                    observer.onConnect()
                }

                override fun onMessage(webSocket: WebSocket, text: String) {
                    observer.onMessage(text)
                }

                override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                    observer.onClose(MessagingSessionStatus(code, reason))
                }

                override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                    logger.error(TAG, "Connection failed: $response")
                    observer.onClose(MessagingSessionStatus(response?.code, response?.message))
                }

                override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
                    observer.onClose(MessagingSessionStatus(code, reason))
                }
            })
        }
    }

    override fun close() {
        GlobalScope.launch {
            session?.close(1000, null)
            session = null
        }
    }
}
