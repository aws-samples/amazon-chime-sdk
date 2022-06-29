# How the demo works?

The solution uses [Amazon Chime SDK messaging](https://aws.amazon.com/blogs/business-productivity/integrate-your-identity-provider-with-amazon-chime-sdk-messaging/) to send messages for user status tracking and shares any metadata such as meeting information amongst users. The solution establishes a [MessagingSession](https://github.com/aws/amazon-chime-sdk-js#messaging-session) using Amazon Chime SDK for JavaScript to listen to the [messages](https://docs.aws.amazon.com/chime-sdk/latest/dg/using-the-messaging-sdk.html#msg-types) the Amazon Chime SDK messaging sends.

Note that you can integrate your identity provider with Amazon Chime SDK messaging instead of using Amazon Cognito. You have to update the demo authentication components accordingly to use your identity provider. Please check [Integrate your Identity Provider with Amazon Chime SDK Messaging](https://aws.amazon.com/blogs/business-productivity/integrate-your-identity-provider-with-amazon-chime-sdk-messaging/) blog post for more information.


## Sign in/Sign up

The solution uses [Amazon Cognito](https://aws.amazon.com/cognito/) for authentication. When a user signs up, the solution creates an [Amazon Chime SDK Messaging](https://docs.aws.amazon.com/chime-sdk/latest/dg/using-the-messaging-sdk.html) `AppInstanceUser`. The solution sets up two Cognito groups in the Amazon Cognito user pool: a doctor group and a patient group. Based on the "Account Type", we assign the user to one of these groups. The authentication is built using the [Amplify UI library components](https://docs.amplify.aws/lib/auth/getting-started/q/platform/js/).


## Appointment

The doctor creates an appointment with a specific patient. The patient cannot create an appointment. The solution creates an Amazon Chime SDK messaging channel and adds two users as channel moderators. When a doctor creates an appointment, the appointment creation AWS Lambda function starts the [AWS step function](https://aws.amazon.com/step-functions/getting-started/) execution. The AWS step function waits for the appointment time and then it sends an SMS to the doctor and the patient in the appointment. The solution uses [Amazon Pinpoint](https://aws.amazon.com/pinpoint/) to send an SMS notification. We save the appointment date/time and doctor/patient information in the channel metadata.


## Check in

The solution lists Amazon Chime SDK messaging channels moderated by the user. The solution sends messages to the other user using the [AWS SDK v3 sendChannelMessageCommand](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-chime-sdk-messaging/classes/sendchannelmessagecommand.html) to track the presence and update the user status as "Checked In" or "Added". The solution listens to these messages using the MessagingSession and accordingly updates the UI with the user status and enable/disable audio-video calling feature.


## SMS notification

If a doctor or a patient is not present (in "Added" status) at the appointment time, they receive a text message alerting to check-in into their appointment. The appointment creation AWS Lambda function starts the [AWS step function](https://aws.amazon.com/step-functions/getting-started/) execution. The AWS step function waits for the appointment time, and then it sends an SMS to the doctor and the patient in the appointment. The solution uses [Amazon Pinpoint](https://aws.amazon.com/pinpoint/) to send an SMS notification. We save the appointment date/time and doctor/patient information in the channel metadata.

## Chat

Upon check-in into the appointment, the doctor and patient see a chat widget where they can chat. The solution sets up separate messaging channels for each doctor-patient appointment. In this chat widget, the doctor can see an option to place a video and a PSTN outbound call invite to the patient.

## Video calling

The solution uses [Amazon Chime SDK React Component Library](https://aws.github.io/amazon-chime-sdk-component-library-react/?path=/story/introduction--page), [Amazon Chime SDK for JavaScript](https://github.com/aws/amazon-chime-sdk-js) for audio-video WebRTC-based calling. The solution calls lambda functions which call `CreateMeeting`, `CreateAttendee` Amazon Chime SDK APIs to receive the meeting and attendee information and then sets up the `MeetingProvider` to join a meeting. The doctor side sends a meeting invite over the messaging channel and awaits the response to join a meeting. If the patient accepts the meeting invite, the solution creates the attendee for the same meeting, and then both doctor and the patient join the same meeting in a separate meeting widget.

## PSTN outbound calling

The solution uses [Amazon Chime SDK PSTN audio service](https://docs.aws.amazon.com/chime-sdk/latest/dg/build-lambdas-for-sip-sdk.html) for PSTN outbound calling. The solution triggers a lambda function which creates a [SIP media application](https://docs.aws.amazon.com/chime/latest/APIReference/API_CreateSipMediaApplication.html) (SMA). This lambda function internally sets a `handle-telephony-events` (SMA handler) lambda function  to handle the patient dial pad, call answering, or hangup events.
