/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

package com.amazonaws.services.chime.sdk.messaging.utils

import com.amazonaws.services.chime.sdk.messaging.session.ChimeUserCredentials
import com.amazonaws.services.chime.sdk.messaging.utils.logger.Logger
import java.lang.StringBuilder
import java.net.URLEncoder
import java.security.MessageDigest
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

class DefaultSigV4(
    private val logger: Logger,
    private val credentials: ChimeUserCredentials,
    private val region: String
) : SigV4 {
    private val TAG = "DefaultSigV4"

    override fun signURL(
        method: String,
        scheme: String,
        serviceName: String,
        hostname: String,
        path: String,
        payload: String,
        queryParams: Map<String, List<String>>?
    ): String {
        val now = getDateTimeString()
        val today = getDateString(now)

        val algorithm = "AWS4-HMAC-SHA256"
        val signedHeaders = "host"
        val canonicalHeaders = "host:${hostname.toLowerCase(Locale.getDefault())}\n"
        val credentialScope = "$today/$region/$serviceName/aws4_request"

        var params = mutableMapOf<String, MutableList<String>>().apply {
            set("X-Amz-Algorithm", mutableListOf(algorithm))
            set(
                "X-Amz-Credential", mutableListOf(
                    encodeURIComponent("${credentials.accessKeyId}/$credentialScope")
                )
            )
            set("X-Amz-Date", mutableListOf(now))
            set("X-Amz-Expires", mutableListOf("10"))
            set("X-Amz-SignedHeaders", mutableListOf("host"))
            credentials.sessionToken?.let {
                set("X-Amz-Security-Token", mutableListOf(encodeURIComponent(it)))
            }
        }

        if (queryParams != null) {
            for ((key, values) in queryParams) {
                val encodedKey = encodeURIComponent(key)
                values.sorted()
                values.forEach {
                    if (!params.containsKey(encodedKey)) {
                        params[encodedKey] = mutableListOf()
                    }
                    params[encodedKey]?.add(encodeURIComponent(it))
                }
            }
        }

        val canonicalQueryStringBuilder = StringBuilder()
        // Query string has to be sorted by parameters
        params = params.toSortedMap()
        params.forEach { (key, values) ->
            values.forEach { value ->
                if (canonicalQueryStringBuilder.isNotEmpty()) {
                    canonicalQueryStringBuilder.append("&")
                }
                canonicalQueryStringBuilder.append(key)
                canonicalQueryStringBuilder.append("=")
                canonicalQueryStringBuilder.append(value)
            }
        }
        val canonicalQueryString = canonicalQueryStringBuilder.toString()

        val canonicalRequest =
            method +
                    "\n" +
                    path +
                    "\n" +
                    canonicalQueryString +
                    "\n" +
                    canonicalHeaders +
                    "\n" +
                    signedHeaders +
                    "\n" +
                    hex(sha256(payload))

        val hashedCanonicalRequest = hex(sha256(canonicalRequest))

        val stringToSign =
            "AWS4-HMAC-SHA256\n" +
                    now +
                    "\n" +
                    today +
                    "/" +
                    region +
                    "/" +
                    serviceName +
                    "/aws4_request\n" +
                    hashedCanonicalRequest

        val signingKey = getSignatureKey(credentials.secretAccessKey, today, region, serviceName)

        val signature = hex(hmac(stringToSign, signingKey))

        val finalParams = "$canonicalQueryString&X-Amz-Signature=$signature"

        return "$scheme://$hostname$path?$finalParams"
    }

    private fun getDateTimeString(): String {
        val format = SimpleDateFormat("yyyyMMdd'T'HHmmss'Z'", Locale.getDefault())
        format.timeZone = TimeZone.getTimeZone("UTC")
        return format.format(Date())
    }

    private fun getDateString(dateTimeString: String): String {
        return dateTimeString.substring(0, dateTimeString.indexOf('T'))
    }

    private fun encodeURIComponent(uriComponent: String): String {
        return URLEncoder.encode(uriComponent, "utf-8")
    }

    private fun sha256(string: String): ByteArray {
        return MessageDigest
            .getInstance("SHA-256")
            .digest(string.toByteArray())
    }

    private fun hmac(data: String, key: ByteArray): ByteArray {
        val algorithm = "HmacSHA256"
        val mac = Mac.getInstance(algorithm)
        mac.init(SecretKeySpec(key, algorithm))
        return mac.doFinal(data.toByteArray())
    }

    private fun hex(bytes: ByteArray): String {
        return bytes.fold("", { str, it -> str + "%02x".format(it) })
    }

    private fun getSignatureKey(key: String, date: String, regionName: String, serviceName: String): ByteArray {
        val kSecret = "AWS4$key".toByteArray()
        val kDate = hmac(date, kSecret)
        val kRegion = hmac(regionName, kDate)
        val kService = hmac(serviceName, kRegion)
        val kSigning = hmac("aws4_request", kService)
        return kSigning
    }
}
