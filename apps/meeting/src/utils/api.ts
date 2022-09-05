// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import routes from '../constants/routes';
import { GET_API, POST_API } from '../service/api';
import { IStudentParams, ITeacherParams } from './interfaces';
import ConfigKeys from '../../secrets.json'

export const BASE_URL = routes.BASE_URL;
export const SL_BASE_URL = ConfigKeys.base_api_gateway_url;

export type MeetingFeatures = {
  Audio: {[key: string]: string};
}

export type CreateMeetingResponse = {
  MeetingFeatures: MeetingFeatures;
  MediaRegion: string;
}

export type JoinMeetingInfo = {
  Meeting: CreateMeetingResponse;
  Attendee: string;
}

export interface MeetingResponse {
  JoinInfo: JoinMeetingInfo;
}

interface GetAttendeeResponse {
  name: string;
}

export interface ISLMeet {
  id: string;
  title: string;
  slug: string;
  teacherId: string;
  adminId: string;
  durationInSeconds: number;
}

export interface ISLParticipant {
  id: string;
  meetId: string;
  userType: string;
  userId: string;
  token: string;
}

interface ISLMeetingResponse {
  slMeet: ISLMeet;
  participant: ISLParticipant;
  JoinInfo: JoinMeetingInfo;
}

export async function fetchMeeting(
  meetingId: string,
  name: string,
  region: string,
  echoReductionCapability = false
): Promise<MeetingResponse> {
  const params = {
    title: encodeURIComponent(meetingId),
    name: encodeURIComponent(name),
    region: encodeURIComponent(region),
    ns_es: String(echoReductionCapability),
  };

  const res = await POST_API(`${BASE_URL}join?${new URLSearchParams(params)}`).then(res => res.data).catch((error) => {
    throw new Error(`Server error: ${JSON.stringify(error)}`);
  });

  return res;
}

export async function getAttendee(
  meetingId: string,
  chimeAttendeeId: string
): Promise<GetAttendeeResponse> {
  const params = {
    title: encodeURIComponent(meetingId),
    attendee: encodeURIComponent(chimeAttendeeId),
  };

  const res = await GET_API(`${BASE_URL}attendee?${new URLSearchParams(params)}`).then(res => res.data).catch((error) => {
    throw new Error('Invalid server response' + JSON.stringify(error));
  });

  return {
    name: res.AttendeeInfo.Name,
  };
}

export async function endMeeting(meetingId: string): Promise<void> {
  const params = {
    title: encodeURIComponent(meetingId),
  };

  return await POST_API(`${BASE_URL}end?${new URLSearchParams(params)}`).then().catch((error) => {
    throw new Error('Server error ending meeting' + JSON.stringify(error));
  });
}

export const createGetAttendeeCallback = (meetingId: string) =>
  (chimeAttendeeId: string): Promise<GetAttendeeResponse> =>
    getAttendee(meetingId, chimeAttendeeId);


// CUSTOM SL API's
export const joinAsTeacher = async (meetSlug: string, params: ITeacherParams): Promise<ISLMeetingResponse> => {
  
  const res: ISLMeetingResponse = await POST_API(`${SL_BASE_URL}/slMeet/${meetSlug}/joinAsTeacher`, params, {data: JSON.stringify(params)}).then(res => res.data).catch((error => {
    throw new Error(`Server error: ${error}`);
  }))

  return res;
}

export const joinAsStudent = async (meetSlug: string, params: IStudentParams): Promise<ISLMeetingResponse> => {
  
  const res: ISLMeetingResponse = await POST_API(`${SL_BASE_URL}/slMeet/${meetSlug}/joinAsStudent`, params, {data: JSON.stringify(params)}).then(res => res.data).catch((error => {
    throw new Error(`Server error: ${error}`);
  }))

  return res;
}