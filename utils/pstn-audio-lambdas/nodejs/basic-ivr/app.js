const bridgeNumber = process.env.BRIDGE_NUMBER; // The number to bridge your call to
const mainMenu = process.env.MAIN_MENU; // Your main menu message, which is heard by the customer after the welcome message
const welcomeMessage = process.env.WELCOME_MESSAGE; // The message which is heard by the customer once they connect to the call
const address = process.env.ADDRESS; // Your address
const hoursOfOperation = process.env.HOURS_OF_OPERATION; // Your hours of operation
const wavBucket = process.env.WAV_BUCKET; //S3 Bucket with Ringback WAV file
const toneKey = process.env.TONE_KEY; // Ringback WAV file key

exports.lambdaHandler = async (event, context, callback) => {
  console.log('Lambda is invoked with calldetails:' + JSON.stringify(event));
  let actions;

  const pauseAction = {
    Type: 'Pause',
    Parameters: {
      DurationInMilliseconds: '1000',
    },
  };

  const hangupAction = {
    Type: 'Hangup',
    Parameters: {
      SipResponseCode: '0',
      CallId: '',
    },
  };

  const speakAction = {
    Type: 'Speak',
    Parameters: {
      Text: '',
      CallId: event.CallDetails.Participants[0].CallId,
      Engine: 'neural',
      LanguageCode: 'en-US',
      TextType: 'text',
      VoiceId: 'Joanna',
    },
  };

  const callAndBridgeAction = {
    Type: 'CallAndBridge',
    Parameters: {
      CallTimeoutSeconds: 30,
      CallerIdNumber: event.CallDetails.Participants[0].From,
      Endpoints: [
        {
          BridgeEndpointType: 'PSTN',
          Uri: bridgeNumber,
        },
      ],
    },
  };

  const speakAndGetDigitsAction = {
    Type: 'SpeakAndGetDigits',
    Parameters: {
      CallId: event.CallDetails.Participants[0].CallId,
      InputDigitsRegex: '^[012]$',
      SpeechParameters: {
        Text: mainMenu,
        Engine: 'neural',
        LanguageCode: 'en-US',
        TextType: 'text',
        VoiceId: 'Joanna',
      },
      FailureSpeechParameters: {
        Text: 'We are unable to process your response, please try again.',
        Engine: 'neural',
        LanguageCode: 'en-US',
        TextType: 'text',
        VoiceId: 'Joanna',
      },
      MinNumberOfDigits: 1,
      MaxNumberOfDigits: 1,
      TerminatorDigits: ['#'],
      InBetweenDigitsDurationInMilliseconds: 5000,
      Repeat: 3,
      RepeatDurationInMilliseconds: 10000,
    },
  };

  switch (event.InvocationEventType) {
    case 'NEW_INBOUND_CALL':
      console.log('NEW_INBOUND_CALL');
      actions = await newCall(event);
      break;

    case 'ACTION_FAILED':
      console.log('ACTION_FAILED');
      actions = [hangupAction];
      break;
    case 'ACTION_SUCCESSFUL':
      console.log('ACTION_SUCCESSFUL');
      actions = await actionSuccessful(event);
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
  }

  async function newCall(event) {
    speakAction.Parameters.Text = welcomeMessage;
    return [pauseAction, speakAction, speakAndGetDigitsAction];
  }

  async function actionSuccessful(event) {
    console.log('ACTION_SUCCESSFUL');

    switch (event.ActionData.Type) {
      case 'SpeakAndGetDigits':
        const pressedDigit = event.ActionData.ReceivedDigits;
        if (pressedDigit === '1') {
          speakAction.Parameters.Text = address;
          return [speakAction, pauseAction, speakAndGetDigitsAction];
        }
        if (pressedDigit === '2') {
          speakAction.Parameters.Text = hoursOfOperation;
          return [speakAction, pauseAction, speakAndGetDigitsAction];
        }
        if (pressedDigit === '0') {
          if (wavBucket && toneKey) {
            callAndBridgeAction.Parameters.RingbackTone = {
              Type: 'S3',
              BucketName: wavBucket,
              Key: toneKey,
            };
          }
          return [callAndBridgeAction];
        }
        break;
      case 'Speak':
        return [];

      case 'CallAndBridge':
        console.log('Bridge Successful');
        return [];

      default:
        return [speakAndGetDigitsAction];
    }
  }

  const response = {
    SchemaVersion: '1.0',
    Actions: actions,
  };

  console.log('Sending response:' + JSON.stringify(response));

  callback(null, response);
};
