export interface ChatDataMessage {
  message: string;
  senderAttendeeId: string;
  timestamp: number;
  senderName: string;
  isSelf: boolean;
}

export interface State {
  messages: ChatDataMessage[];
}

export enum DataMessagesActionType {
  ADD,
}

export interface AddAction {
  type: DataMessagesActionType.ADD;
  payload: ChatDataMessage;
}

export const initialState: State = {
  messages: [],
};

export type Action = AddAction;

export function reducer(state: State, action: Action): State {
  const { type, payload } = action;
  switch (type) {
  case DataMessagesActionType.ADD:
    return { messages: [...state.messages, payload] };
  default:
    throw new Error('Incorrect action in DataMessagesProvider reducer');
  }
}
