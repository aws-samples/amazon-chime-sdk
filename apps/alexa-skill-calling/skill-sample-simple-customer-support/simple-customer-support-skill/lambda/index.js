// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
const Alexa = require('ask-sdk-core');
const axios = require('axios');
const { v4: uuid } = require('uuid');
const config = require('./config.js');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest');
  },
  handle(handlerInput) {
    const speakOutput =
      'Welcome to demo customer support. You can say call customer support to reach our customer support team. How can I help you?';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const CallSupportIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'CallSupportIntent'
    );
  },
  async handle(handlerInput) {
    const apiAccessToken = handlerInput.requestEnvelope.context.System.apiAccessToken;
    const endpointId = handlerInput.requestEnvelope.context.System.device.deviceId;

    let speakOutput;
    try {
      await startCommunicationSession(
        apiAccessToken,
        endpointId,
        config.skillConfig.sourcePhoneNumber,
        config.skillConfig.destinationPhoneNumber
      );
      speakOutput = '';
    } catch (error) {
      speakOutput = 'Sorry, I am having problem right now.';
    }

    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};

async function startCommunicationSession(
  apiAccessToken,
  endpointId,
  sourcePhoneNumber,
  destinationPhoneNumber
) {
  const request = {
    participants: [
      {
        id: {
          type: 'PHONE_NUMBER',
          value: `${sourcePhoneNumber}`,
        },
        endpointId: `${endpointId}`,
        isOriginator: true,
      },
      {
        id: {
          type: 'PHONE_NUMBER',
          value: `${destinationPhoneNumber}`,
        },
        communicationProviderId: 'amzn1.alexa.csp.id.82bb98bc-384a-11ed-a261-0242ac120002',
      },
    ],
    clientContext: {
      clientSessionId: uuid(),
    },
  };

  try {
    const response = await axios.post(
      'https://api.amazonalexa.com/v1/communications/session',
      JSON.stringify(request),
      {
        headers: {
          Authorization: `Bearer ${apiAccessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(`Successfully started a call. ResponseCode: ${response.status}, ResponseData: ${JSON.stringify(response.data)}`);
  } catch (error) {
    console.error(`Failed to start a call. ResponseCode: ${error.response.status}, ResponseData: ${JSON.stringify(error.response.data)}`);
    throw error;
  }
}

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent'
    );
  },
  handle(handlerInput) {
    const speakOutput = 'You can say hello to me! How can I help?';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent' ||
        Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent')
    );
  },
  handle(handlerInput) {
    const speakOutput = 'Goodbye!';

    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet
 * */
const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent'
    );
  },
  handle(handlerInput) {
    const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs
 * */
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return (Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest');
  },
  handle(handlerInput) {
    console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
    // Any cleanup logic goes here.
    return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
  },
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents
 * by defining them above, then also adding them to the request handler chain below
 * */
const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return (Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest');
  },
  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    const speakOutput = `You just triggered ${intentName}`;

    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    );
  },
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below
 * */
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
    console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom
 * */
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    CallSupportIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler
  )
  .addErrorHandlers(ErrorHandler)
  .withCustomUserAgent('sample/my-customer-support/v1.0')
  .lambda();
