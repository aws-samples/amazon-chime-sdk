exports.lambdaHandler = async (event, context, callback) => {
  console.log('Lambda is invoked with calldetails:' + JSON.stringify(event));
  let actions;

  switch (event.InvocationEventType) {
    // Invocation Event Types: https://docs.aws.amazon.com/chime/latest/dg/pstn-invocations.html
    case 'NEW_INBOUND_CALL':
      console.log('NEW_INBOUND_CALL');
      break;

    case 'HANGUP':
      console.log('HANGUP');
      const hangupId = event.CallDetails.Participants.filter(
        ({ Status }) => Status === 'Connected',
      )?.[0]?.CallId;
      if (hangupId) {
        hangupAction.Parameters.CallId = hangupId;
        actions = [hangupAction];
      }
      break;

    case 'ACTION_SUCCESSFUL':
      // Full list of ActionData.Types: https://docs.aws.amazon.com/chime/latest/dg/use-cases.html
      console.log('ACTION_SUCCESSFUL');
      switch (event.ActionData.Type) {
        case 'PlayAudioAndGetDigits':
          console.log('PlayAudioAndGetDigits Success');
          break;

        case 'ReceiveDigits':
          console.log('ReceiveDigits Success');
          break;

        case 'CallAndBridge':
          console.log('CallAndBridge Success');
          break;

        case 'PlayAudio':
          console.log('PlayAudio Success');
          break;

        case 'JoinChimeMeeting':
          console.log('JoinChimeMeeting Success');
          break;

        case 'ModifyChimeMeetingAttendees':
          console.log('ModifyChimeMeetingAttendees Success');
          break;

        case 'RecordMeeting':
          console.log('RecordMeeting Success');
          break;
      }
      break;

    case 'CALL_ANSWERED':
      console.log('CALL_ANSWERED');
      break;

    case 'ACTION_FAILED':
      console.log('ACTION_FAILED');
      switch (event.ActionData.Type) {
        case 'PlayAudioAndGetDigits':
          console.log('PlayAudioAndGetDigits Failure');
          break;

        case 'CallAndBridge':
          console.log('CallAndBridge Failure');
          break;

        case 'PlayAudio':
          console.log('PlayAudio Failure');
          break;

        case 'ModifyChimeMeetingAttendees':
          console.log('ModifyChimeMeetingAttendees Failure');
          break;

        case 'RecordMeeting':
          console.log('RecordMeeting Failure');
          break;
      }

      break;

    case 'ACTION_INTERRUPTED':
      console.log('ACTION_INTERRUPTED');
      break;

    case 'DIGITS_RECEIVED':
      console.log('DIGITS_RECEIVED');
      break;

    case 'RINGING':
      console.log('RINGING');
      break;

    case 'CALL_UPDATE_REQUESTED':
      console.log('CALL_UPDATE_REQUESTED');
      break;

    default:
      console.log('ACTION_FAILED');
  }

  const response = {
    SchemaVersion: '1.0',
    Actions: actions,
  };

  console.log('Sending response:' + JSON.stringify(response));

  return response;
};

const hangupAction = {
  // https://docs.aws.amazon.com/chime/latest/dg/hangup.html
  Type: 'Hangup',
  Parameters: {
    CallId: '', //optional
    // ParticipantTag: '', // optional - Allowed values – LEG-A or LEG-B
    SipResponseCode: '0', //optional - Allowed values – 480–Unavailable; 486–Busy; 0–Normal Termination
  },
};

const playAudioAction = {
  // https://docs.aws.amazon.com/chime/latest/dg/play-audio.html
  Type: 'PlayAudio',
  Parameters: {
    CallId: '', // optional if ParticipantTag present
    // ParticipantTag: '', //optional if CallId present - Allowed values – LEG-A or LEG-B. -  Ignored if CallId specified
    // PlaybackTerminators: [], //optional - Allowed values – An array of the following values; “0”, ”1”, ”2”, ”3”, ”4”, ”5”, ”6”, ”7”, ”8”, ”9”, ”#”, ”*”
    // Repeat: '', //optional - Allowed values – An integer greater than zero
    AudioSource: {
      Type: 'S3', //required - Allowed values – S3
      BucketName: '', //required - Allowed values – A valid S3 bucket for which Amazon Chime has access to the s3:GetObject action
      Key: '', //required - Allowed values – A valid audio file
    },
  },
};

const playAudioAndGetDigitsAction = {
  // https://docs.aws.amazon.com/chime/latest/dg/play-audio-get-digits.html
  Type: 'PlayAudioAndGetDigits',
  Parameters: {
    CallId: '', // optional if ParticipantTag present
    // ParticipantTag: '', //optional if CallId present - Allowed values – LEG-A or LEG-B. -  Ignored if CallId specified
    // InputDigitsRegex: '^d{2}#$', // optional - Allowed values – A valid regular expression pattern
    AudioSource: {
      // required
      Type: 'S3', //required - Allowed values – S3
      BucketName: '', //required - Allowed values – A valid S3 bucket for which Amazon Chime has access to the s3:GetObject action
      Key: '', //required - Allowed values – A valid audio file
    },
    FailureAudioSource: {
      // required
      Type: 'S3', //required - Allowed values – S3
      BucketName: '', //required - Allowed values – A valid S3 bucket for which Amazon Chime has access to the s3:GetObject action
      Key: '', //required - Allowed values – A valid audio file
    },
    MinNumberOfDigits: 1, //optional - Allowed values – >=0
    MaxNumberOfDigits: 1, //optional - Allowed values – >=MinNumberOfDigits
    TerminatorDigits: ['#'], //optional - Allowed values - [0123456789#*]
    InBetweenDigitsDurationInMilliseconds: 5000, //optional - Allowed values – >0
    Repeat: 3, //optional - Allowed values – >0
    RepeatDurationInMilliseconds: 10000, //required - Allowed values – >0
  },
};

const callAndBridgeAction = {
  // https://docs.aws.amazon.com/chime/latest/dg/call-and-bridge.html
  Type: 'CallAndBridge',
  Parameters: {
    // CallTimeoutSeconds: 30, //optional - Allowed values – Integer 0 < x <= 120
    CallerIdNumber: '', //required - Allowed values – A valid phone number in the E.164 format - number must be in Amazon Chime Phone Inventory or the FROM number from LEG-A
    // RingbackTone: {
    //optional
    // Type: 'S3', //required - Allowed values – S3
    // BucketName: '', //required - Allowed values – A valid S3 bucket for which Amazon Chime has access to the s3:GetObject action
    // Key: '', //required - Allowed values – A valid audio file
    // },
    Endpoints: [
      //required
      {
        Uri: '', //required - Allowed values – A valid phone number in the E.164 format
        BridgeEndpointType: 'PSTN', //required - Allowed values - 'PSTN'
      },
    ],
    // CustomSipHeaders: {
    //optional - See https://docs.aws.amazon.com/chime/latest/dg/sip-headers.html for more information
    // },
  },
};

const joinChimeMeetingAction = {
  // https://docs.aws.amazon.com/chime/latest/dg/join-chime-meeting.html
  Type: 'JoinChimeMeeting',
  Parameters: {
    JoinToken: '', //required - Allowed values – Valid join token
    CallId: '', //optional if ParticipantTag present
    // ParticipantTag: '', //optional if CallId present - Allowed values – LEG-A or LEG-B. -  Ignored if CallId specified
    MeetingId: '', //optional - see docs for more details
  },
};

const modifyChimeMeetingAttendees = {
  // https://docs.aws.amazon.com/chime/latest/dg/mute-unmute.html
  Type: 'ModifyChimeMeetingAttendees',
  Parameters: {
    Operation: '', //required - Allowed values - Mute, Unmute
    MeetingId: '', //required - Allowed values – A valid meeting ID.
    CallId: '', //optional if ParticipantTag present
    // ParticipantTag: '', //optional if CallId present - Allowed values – LEG-A or LEG-B. -  Ignored if CallId specified
    AttendeeList: [], //required - Allowed values – A list of valid attendee IDs
  },
};

const pauseAction = {
  // https://docs.aws.amazon.com/chime/latest/dg/pause.html
  Type: 'Pause',
  Parameters: {
    CallId: '', //optional if ParticipantTag present
    // ParticipantTag: '', //optional if CallId present - Allowed values – LEG-A or LEG-B. -  Ignored if CallId specified
    DurationInMilliseconds: '3000', //required - Allowed values – An integer >0
  },
};

const receiveDigitsActions = {
  // https://docs.aws.amazon.com/chime/latest/dg/listen-to-digits.html
  Type: 'ReceiveDigits',
  Parameters: {
    CallId: '', //optional if ParticipantTag present
    // ParticipantTag: '', //optional if CallId present - Allowed values – LEG-A or LEG-B. -  Ignored if CallId specified
    InputDigitsRegex: '^d{2}#$', //required - Allowed values – A valid regular expression pattern
    InBetweenDigitsDurationInMilliseconds: 1000, //required - Allowed values – Duration in milliseconds
    FlushDigitsDurationInMilliseconds: 10000, //required - Allowed values – >InBetweenDigitsDurationInMilliseconds
  },
};

const recordAudioAction = {
  // https://docs.aws.amazon.com/chime/latest/dg/record-audio.html
  Type: 'RecordAudio',
  Parameters: {
    CallId: '', //optional if ParticipantTag present
    // ParticipantTag: '', //optional if CallId present - Allowed values – LEG-A or LEG-B. -  Ignored if CallId specified
    DurationInSeconds: '10', //optional - Allowed values – >0
    // SilenceDurationInSeconds: 3, //optional - Allowed values – [1;1000]
    // SilenceThreshold: 100, //optional - Allowed values – [1;1000]
    RecordingTerminators: ['#'], //required - Allowed values – An array of single digits and symbols from [0123456789#*]
    RecordingDestination: {
      Type: 'S3', //required - Allowed values – S3
      BucketName: '', //required - Allowed values – A valid S3 bucket for which Amazon Chime has access to the s3:GetObject action
      // Prefix: '', //optional - Allowed values – A valid prefix name
    },
  },
};

const startCallRecordingAction = {
  // https://docs.aws.amazon.com/chime/latest/dg/start-call-recording.html
  Type: 'StartCallRecording',
  Parameters: {
    Track: 'BOTH', //required - Allowed values - BOTH, INCOMING, OUTGOING
    Destination: {
      Type: 'S3', //required - Allowed values – S3
      Location: '', //required - Allowed values - A valid Amazon S3 bucket and an optional Amazon S3 key prefix
    },
  },
};

const stopCallRecordingAction = {
  // https://docs.aws.amazon.com/chime/latest/dg/stop-call-recording.html
  Type: 'StopCallRecording',
  Parameters: {
    CallId: '', //required - Allowed values – A valid call ID
  },
};

const pauseCallRecordingAction = {
  // https://docs.aws.amazon.com/chime/latest/dg/pause-call-recording.html
  Type: 'PauseCallRecording',
  Parameters: {
    CallId: '', //required - Allowed values – A valid call ID
  },
};

const resumeCallRecordingAction = {
  // https://docs.aws.amazon.com/chime/latest/dg/resume-call-recording.html
  Type: 'ResumeCallRecording',
  Parameters: {
    CallId: '', //required - Allowed values – A valid call ID
  },
};
