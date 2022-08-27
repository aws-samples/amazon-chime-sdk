import { USER_TYPES } from "../enums";

export interface MeetingObject {
    meetingId: string;
    userName: string;
    userType: USER_TYPES;
}