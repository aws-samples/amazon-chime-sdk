package com.amazonaws.services.chime.sdkdemo

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.os.Build
import androidx.core.app.NotificationCompat
import com.amazonaws.services.chime.sdkdemo.common.CHANNEL_ARN
import com.amazonaws.services.chime.sdkdemo.common.DEVICE_TOKEN_KEY
import com.amazonaws.services.chime.sdkdemo.common.USERNAME_KEY
import com.amazonaws.services.chime.sdkdemo.data.onFailure
import com.amazonaws.services.chime.sdkdemo.data.onSuccess
import com.amazonaws.services.chime.sdkdemo.ui.messaging.view.activity.MessagingActivity
import com.amazonaws.services.chime.sdkdemo.ui.signin.view.SignInActivity
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import java.util.logging.Logger
import kotlin.random.Random
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONObject

class DefaultFirebaseMessagingService() : FirebaseMessagingService() {

    private val chimeSDKService = ServiceLocator.provideChimeService()
    private val userRepository = ServiceLocator.provideUserRepository()
    private val log = Logger.getLogger("DefaultFirebaseMessagingService")

    /**
     * Called when message is received.
     *
     * @param remoteMessage Object representing the message received from Firebase Cloud Messaging.
     */
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        // [START_EXCLUDE]
        // There are two types of messages data messages and notification messages. Data messages are handled
        // here in onMessageReceived whether the app is in the foreground or background. Data messages are the type
        // traditionally used with GCM. Notification messages are only received here in onMessageReceived when the app
        // is in the foreground. When the app is in the background an automatically generated notification is displayed.
        // When the user taps on the notification they are returned to the app. Messages containing both notification
        // and data payloads are treated as notification messages. The Firebase console always sends notification
        // messages. For more see: https://firebase.google.com/docs/cloud-messaging/concept-options
        // [END_EXCLUDE]

        log.info("Received notification ${remoteMessage.data}")

        remoteMessage.data.let {
            val title = it["pinpoint.notification.title"]
            val body = it["pinpoint.notification.body"]
            val pinpointData = it["pinpoint.jsonBody"]
            val jsonObject = JSONObject(pinpointData)
            val messageId = jsonObject.getString("chime.message_id")
            val channelArn = jsonObject.getString("chime.channel_arn")

            if (title != null && body != null) {
                sendNotification(title, body, messageId, channelArn)
            }
        }
    }

    /**
     * Called if the FCM registration token is updated. This may occur if the security of
     * the previous token had been compromised. Note that this is called when the
     * FCM registration token is initially generated so this is where you would retrieve the token.
     */
    override fun onNewToken(token: String) {
        log.info("Refreshed token: $token")
        val sharedPrefs = applicationContext.getSharedPreferences(null, Context.MODE_PRIVATE)
        with(sharedPrefs.edit()) {
            putString(DEVICE_TOKEN_KEY, token)
            apply()
        }

        // Register with new token
        CoroutineScope(Dispatchers.IO).launch {
            userRepository.getCurrentUser()
                .onSuccess {
                    chimeSDKService.registerAppInstanceUserEndpoint(
                        token,
                        it.chimeAppInstanceUserArn
                    )
                        .onSuccess {
                            log.info("Device registered with Chime Identity SDK")
                        }
                        .onFailure {
                            log.info("Device failed to register with Chime Identity SDK with exception")
                        }
                }
        }
    }

    /**
     * Create and show a simple notification containing the received FCM message.
     *
     * @param messageBody FCM message body received.
     */
    private fun sendNotification(
        title: String,
        messageBody: String,
        messageId: String,
        channelArn: String
    ) {
        var intent = Intent(this, SignInActivity::class.java)
        intent.putExtra(CHANNEL_ARN, channelArn)

        val sharedPrefs = applicationContext.getSharedPreferences(null, Context.MODE_PRIVATE)
        val currentUsername = sharedPrefs.getString(USERNAME_KEY, "")
        // If User is logged in then redirect to MessagingActivity
        if (!currentUsername.isNullOrBlank()) {
            intent = Intent(this, MessagingActivity::class.java)
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            intent.putExtra(CHANNEL_ARN, channelArn)
        }

        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_ONE_SHOT
        )

        val channelId = "default"
        val defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
        val notificationBuilder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle(title)
            .setContentText(messageBody)
            .setAutoCancel(true)
            .setSound(defaultSoundUri)
            .setContentIntent(pendingIntent)

        val notificationManager =
            getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Since android Oreo notification channel is needed.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "DefaultNotificationChannel",
                NotificationManager.IMPORTANCE_DEFAULT
            )
            notificationManager.createNotificationChannel(channel)
        }

        val notificationId = Random.nextInt()
        notificationManager.notify(
            notificationId,
            notificationBuilder.build()
        )
    }
}
