export interface CreateAppointmentFunctionEvent {
  doctorUsername: string;
  patientUsername: string;
  timestamp: string;
}

export interface DeleteAppointmentFunctionEvent {
  channelArn: string;
  appInstanceUserArn: string;
}

export interface CreateMeetingFunctionEvent {
  appInstanceUserId: string;
  channelArn: string;
  mediaRegion: string;
}

export interface CreateAttendeeFunctionEvent {
  appInstanceUserId: string;
  channelArn: string;
  meetingId: string;
}

export interface MakeOutboundCallFunctionEvent {
  channelArn: string;
  clientId: string;
  doctorUsername: string;
  meetingId: string;
  patientUsername: string;
}
