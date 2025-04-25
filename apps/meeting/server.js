// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const express = require('express');
const compression = require('compression');
const { v4: uuidv4 } = require('uuid');
const morganBody = require('morgan-body');
const bodyParser = require('body-parser');

const { ChimeSDKMeetings } = require('@aws-sdk/client-chime-sdk-meetings');

const port = 8080;
const region = 'us-east-1';

const app = express();
app.use(compression());
app.use(express.json());
app.use(bodyParser.json());
morganBody(app, { maxBodyLength: Infinity });

const chimeSDKMeetings = new ChimeSDKMeetings({ region });

const meetingCache = {};
const attendeeCache = {};

app.post('/join', async (req, res) => {
  try {
    const { title, attendeeName, region = 'us-east-1', ns_es } = req.body;

    if (!meetingCache[title]) {
      const { Meeting } = await chimeSDKMeetings.createMeeting({
        ClientRequestToken: uuidv4(),
        MediaRegion: region,
        ExternalMeetingId: title.substring(0, 64),
        MeetingFeatures: ns_es === 'true' ? { Audio: { EchoReduction: 'AVAILABLE' } } : undefined,
      });

      meetingCache[title] = Meeting;
      attendeeCache[title] = {};
    }

    const { Attendee } = await chimeSDKMeetings.createAttendee({
      MeetingId: meetingCache[title].MeetingId,
      ExternalUserId: uuidv4(),
    });

    attendeeCache[title][Attendee.AttendeeId] = { ...Attendee, Name: attendeeName };

    const joinInfo = {
      JoinInfo: {
        Title: title,
        Meeting: meetingCache[title],
        Attendee: attendeeCache[title][Attendee.AttendeeId],
      },
    };

    res.status(201).json(joinInfo);
  } catch (err) {
    console.error(`Error creating/joining meeting: ${err}`);
    res.status(403).json({ error: err.message });
  }
});

app.get('/attendee', (req, res) => {
  try {
    const { title, attendeeId } = req.query;
    const attendee = attendeeCache[title][attendeeId];
    res.status(200).json(attendee);
  } catch (err) {
    console.error(`Error getting attendee information: ${err}`);
    res.status(403).json({ error: err.message });
  }
});

app.post('/end', async (req, res) => {
  try {
    const { title } = req.body;

    await chimeSDKMeetings.deleteMeeting({
      MeetingId: meetingCache[title].MeetingId,
    });

    res.status(200).end();
  } catch (err) {
    console.error(`Error ending meeting: ${err}`);
    res.status(403).json({ error: err.message });
  }
});

// Route to receive logs
app.post('/logs', (req, res) => {
  console.log('Received logs in the local server');
  res.end('Received logs in the local server');
});

// Handle unsupported requests
app.all('*', (req, res) => {
  res.status(400).json({ error: 'Bad Request - Unsupported Endpoint' });
});

app.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:${port}/`);
});
