import React, {
  ChangeEvent,
  useState
} from 'react';

import {MeetingSessionConfiguration} from 'amazon-chime-sdk-js';

import {
  useMeetingManager,
  MeetingManagerJoinOptions,
  useMeetingEvent
} from 'amazon-chime-sdk-component-library-react';
import { fetchMeeting } from './utils/api';

const MeetingEventReceiver = () => {
  const meetingEvent = useMeetingEvent();
  console.log('Received a meeting event', meetingEvent);
  return null;
};

export default function SendingAudioFailedReproMeetingScreen() {
  const [meetingName, setMeetingName] = useState('');
  const [attendeeName, setAttendeeName] = useState('');
  const meetingManager = useMeetingManager();

  const joinMeeting = async () => {
    // Fetch the meeting and attendee data from your server application
    const { JoinInfo } = await fetchMeeting(meetingName, attendeeName);
    const meetingSessionConfiguration = new MeetingSessionConfiguration(JoinInfo?.Meeting, JoinInfo?.Attendee);
    const options: MeetingManagerJoinOptions = {
      skipDeviceSelection: false
    };
    await meetingManager.join(meetingSessionConfiguration, options);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });
    await meetingManager.startAudioInputDevice(stream);
    await meetingManager.start();
  };

  const leaveMeeting = async () => {
    await meetingManager.leave();
  }

  const handleMeetingNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMeetingName(e.target.value);
  }

  const handleAttendeeNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAttendeeName(e.target.value);
  }

  return (
    <div className="IntuitDemoAppMeetingScreen">
      <div>
        Meeting name:
        <input type='text' value={meetingName} onChange={handleMeetingNameChange}></input>
      </div>
      <div>
        Attendee name:
        <input type='text' value={attendeeName} onChange={handleAttendeeNameChange}></input>
      </div>
      <button onClick={joinMeeting}>Join</button>
      <button onClick={leaveMeeting}>leave</button>
      <MeetingEventReceiver />
    </div>
  );
}