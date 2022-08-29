import { USER_TYPES } from "../enums";

export interface IMeetingObject {
    meetingId: string;
    userName: string;
    userType: USER_TYPES;
}

export interface ILocalInfo {
    id: string;
    attendeeName: string;
    region: string;
    isEchoReductionEnabled: boolean;
}