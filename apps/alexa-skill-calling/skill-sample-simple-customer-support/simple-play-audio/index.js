// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

exports.handler = async (event, context, callback) => {
  return {
    SchemaVersion: '1.0',
    Actions: await getActions(event),
  };
};

const getActions = async (event) => {
  const participantACallId = getParticipantACallId(event);
  switch (event.InvocationEventType) {
    case 'NEW_INBOUND_CALL':
      return [createSpeakAction(participantACallId)];
    case 'ACTION_SUCCESSFUL':
      const actionData = event.ActionData;
      if (actionData.Type === 'Speak') {
        return [createHangupAction()];
      }
      return [];
    default:
      return [];
  }
};

const createSpeakAction = (callerId) => {
  return {
    Type: 'Speak',
    Parameters: {
      CallId: callerId,
      Engine: 'neural',
      Text: 'Thank you for calling demo customer support. Our customer representative is currently not available. Please call us back during our regular business hours. Goodbye.',
    },
  };
};

const createHangupAction = () => ({
  Type: 'Hangup',
  Parameters: {
    SipResponseCode: '480',
  },
});

const getParticipantACallId = (event) => {
  const participantA = event.CallDetails.Participants.find(
    (participant) => participant.ParticipantTag === 'LEG-A'
  );
  return participantA.CallId;
};
