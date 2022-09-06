// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import routes from '../constants/routes';
import { DELETE_API, GET_API, POST_API } from '../service/api';
import { IJoinParams, IStudentParams, ITeacherParams } from './interfaces';
import ConfigKeys from '../../config.json'

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
  startedAt?: string;
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
  meetSlug: string,
  participantToken: string,
  chimeAttendeeId: string,
): Promise<GetAttendeeResponse> {
  const params = {
    token: encodeURIComponent(participantToken),
    attendeeId: encodeURIComponent(chimeAttendeeId),
  };

  const res = await GET_API(`${SL_BASE_URL}/slMeet/${meetSlug}/getChimeAttendee?${new URLSearchParams(params)}`).then(res => res.data).catch((error) => {
    throw new Error('Invalid server response' + JSON.stringify(error));
  });

  return {
    name: res.AttendeeInfo.Name,
  };
}

export async function endMeeting(meetSlug: string, participantToken: string): Promise<void> {
  const params = {
    token: encodeURIComponent(participantToken),
  };

  return await DELETE_API(`${SL_BASE_URL}/slMeet/${meetSlug}/endMeet?${new URLSearchParams(params)}`).then().catch((error) => {
    throw new Error('Server error ending meeting' + JSON.stringify(error));
  });
}

export const createGetAttendeeCallback = (meetSlug: string, participantToken: string) =>
  (chimeAttendeeId: string): Promise<GetAttendeeResponse> =>
    getAttendee(meetSlug, participantToken, chimeAttendeeId);


// CUSTOM SL API's
export const joinAsTeacher = async (meetSlug: string, params: ITeacherParams): Promise<ISLMeetingResponse> => {
  
  const res: ISLMeetingResponse = await POST_API(`${SL_BASE_URL}/slMeet/${meetSlug}/joinAsTeacher`, params, {data: JSON.stringify(params)}).then(res => res.data).catch((error => {
    throw new Error(`Server error in joinAsTeacher: ${error}`);
  }))

  return res;
}

export const joinAsStudent = async (meetSlug: string, params: IStudentParams): Promise<ISLMeetingResponse> => {
  
  const res: ISLMeetingResponse = await POST_API(`${SL_BASE_URL}/slMeet/${meetSlug}/joinAsStudent`, params, {data: JSON.stringify(params)}).then(res => res.data).catch((error => {
    throw new Error(`Server error in joinAsStudent: ${error}`);
  }))

  return res;
}

export const joinViaToken = async (meetSlug: string, params: IJoinParams): Promise<ISLMeetingResponse> => {
  
  const res: ISLMeetingResponse = await POST_API(`${SL_BASE_URL}/slMeet/${meetSlug}/join`, params, {data: JSON.stringify(params)}).then(res => res.data).catch((error => {
    throw new Error(`Server error in joinViaToken: ${error}`);
  }))

  return res;
}

export const listParticipants = async (meetSlug: string, participantToken: string): Promise<any> => {
  const params = {
    token: encodeURIComponent(participantToken),
  };
  const res: any = await GET_API(`${SL_BASE_URL}/slMeet/${meetSlug}/listParticipants?${new URLSearchParams(params)}`).then(res => res.data).catch(error => {
    throw new Error(`Server error in listParticipants: ${error}`);
  });
  
  return res;
}

export const markMeetStarted = async (meetSlug: string, participantToken: string): Promise<any> =>{
  const params = {
    token: encodeURIComponent(participantToken),
  };
  const res: any = await POST_API(`${SL_BASE_URL}/slMeet/${meetSlug}/markMeetStarted?${new URLSearchParams(params)}`).then(res => res.data).catch(error => {
    throw new Error(`Server error in listParticipants: ${error}`);
  });

  return res;
}