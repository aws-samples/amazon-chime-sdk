// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import routes from '../constants/routes';

export const BASE_URL = routes.HOME;

export type MeetingFeatures = {
  Audio: { [key: string]: string };
};

export type CreateMeetingResponse = {
  MeetingFeatures: MeetingFeatures;
  MediaRegion: string;
};

export type JoinMeetingInfo = {
  Meeting: CreateMeetingResponse;
  Attendee: string;
};

interface MeetingResponse {
  JoinInfo: JoinMeetingInfo;
}

interface GetAttendeeResponse {
  name: string;
}

export async function createMeetingAndAttendee(
  title: string,
  attendeeName: string,
  region: string,
  echoReductionCapability = false
): Promise<MeetingResponse> {
  const body = {
    title: encodeURIComponent(title),
    attendeeName: encodeURIComponent(attendeeName),
    region: encodeURIComponent(region),
    ns_es: String(echoReductionCapability),
  };

  const res = await fetch(BASE_URL + 'join', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (data.error) {
    throw new Error(`Server error: ${data.error}`);
  }

  return data;
}

export async function getAttendee(title: string, attendeeId: string): Promise<GetAttendeeResponse> {
  const params = {
    title: encodeURIComponent(title),
    attendeeId: encodeURIComponent(attendeeId),
  };

  const res = await fetch(BASE_URL + 'attendee?' + new URLSearchParams(params), {
    method: 'GET',
  });

  if (!res.ok) {
    throw new Error('Invalid server response');
  }

  const data = await res.json();

  return {
    name: data.Name,
  };
}

export async function endMeeting(title: string): Promise<void> {
  const body = {
    title: encodeURIComponent(title),
  };

  const res = await fetch(BASE_URL + 'end', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error('Server error ending meeting');
  }
}

export const createGetAttendeeCallback = (meetingId: string) => (
  chimeAttendeeId: string
): Promise<GetAttendeeResponse> => getAttendee(meetingId, chimeAttendeeId);
