export enum AccountType {
  Doctor = 'DOCTOR',
  Patient = 'PATIENT',
}

export enum Presence {
  Added = 'Added',
  CheckedIn = 'CheckedIn',
}

export enum MeetingInviteStatus {
  Accepted = 'Accepted',
  Declined = 'Declined',
  Unknown = 'Unknown',
  Cancel = 'Cancel',
}

// The Chat component will translate these strings.
export enum ReservedMessageContent {
  AcceptedInvite = 'Accepted a meeting invite',
  AcceptedInviteByPhone = 'Accepted a meeting invite (phone)',
  CanceledInvite = 'Canceled a meeting invite',
  CheckedIn = 'checked in',
  DeclinedInvite = 'Declined a meeting invite',
  DeclinedInviteByPhone = 'Declined a meeting invite (phone)',
  SendingInvite = 'Sending a meeting invite',
}

export const PhoneAttendeePrefix = '(phone)';
