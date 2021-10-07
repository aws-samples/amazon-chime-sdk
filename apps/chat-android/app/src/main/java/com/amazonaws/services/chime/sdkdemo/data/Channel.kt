package com.amazonaws.services.chime.sdkdemo.data

data class Channel(
    val channelArn: String,
    val name: String,
    val privacy: String,
    val mode: String
)
