import { USER_TYPES } from "../enums";

export interface IMeetingObject {
  meetingId: string;
  userName: string;
  userType: USER_TYPES;
  token: string | null;
}

export interface ILocalInfo {
  id: string;
  attendeeName: string;
  region: string;
  isEchoReductionEnabled: boolean;
}

export interface ITeacherParams {
  email: string;
  password: string;
}
  
export interface IStudentParams {
  displayName: string;
  password: string;
}

export interface IJoinParams {
  userType: USER_TYPES;
  t: string;
  displayName: string;
}