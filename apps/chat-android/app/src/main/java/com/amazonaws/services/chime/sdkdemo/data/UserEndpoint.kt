package com.amazonaws.services.chime.sdkdemo.data

data class UserEndpoint(
    val endpointId: String,
    val appInstanceUserArn: String,
    val name: String?,
    val allowMessages: String
)
