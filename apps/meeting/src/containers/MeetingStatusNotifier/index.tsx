import {
  ActionType,
  MeetingStatus,
  Severity,
  useMeetingStatus,
  useNotificationDispatch,
} from 'amazon-chime-sdk-component-library-react';
import React, { useEffect, useState } from 'react';
import routes from '../../constants/routes';
import { useNavigate } from 'react-router-dom';

type DemoMeetingStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'failed';

const MeetingStatusNotifier: React.FC = () => {
  const meetingStatus = useMeetingStatus();
  const dispatch = useNotificationDispatch();
  const [status, setStatus] = useState<DemoMeetingStatus>();
  const navigate = useNavigate();

  const getMeetingStatusPayload = (message: string, severity: Severity) => {
    return {
      severity,
      message,
      autoClose: true,
      replaceAll: true,
    };
  };

  useEffect(() => {
    switch (meetingStatus) {
      case MeetingStatus.Loading:
        setStatus('connecting');
        dispatch({
          type: ActionType.ADD,
          payload: getMeetingStatusPayload('Meeting connecting...', Severity.INFO),
        });
        break;
      case MeetingStatus.Succeeded:
        setStatus('connected');
        if (status === 'reconnecting') {
          dispatch({
            type: ActionType.ADD,
            payload: getMeetingStatusPayload('Meeting reconnected', Severity.SUCCESS),
          });
        } else {
          dispatch({
            type: ActionType.ADD,
            payload: getMeetingStatusPayload('Meeting connected', Severity.SUCCESS),
          });
        }
        break;
      case MeetingStatus.Reconnecting:
        setStatus('reconnecting');
        dispatch({
          type: ActionType.ADD,
          payload: getMeetingStatusPayload('Meeting reconnecting...', Severity.WARNING),
        });
        break;
      case MeetingStatus.Failed:
        setStatus('failed');
        dispatch({
          type: ActionType.ADD,
          payload: getMeetingStatusPayload(
            'Meeting failed even after reconnection attempts, redirecting to home',
            Severity.ERROR
          ),
        });
        navigate(routes.HOME);
        break;
      case MeetingStatus.TerminalFailure:
        setStatus('failed');
        dispatch({
          type: ActionType.ADD,
          payload: getMeetingStatusPayload(
            'Meeting will not reconnect due to fatal failure, redirecting to home',
            Severity.ERROR
          ),
        });
        navigate(routes.HOME);
        break;
      default:
        break;
    }
    return () => {
      setStatus(undefined);
    };
  }, [meetingStatus]);

  useEffect(() => {
    let id: NodeJS.Timeout;
    if (status === 'reconnecting') {
      id = setInterval(() => {
        dispatch({
          type: ActionType.ADD,
          payload: getMeetingStatusPayload('Meeting reconnecting...', Severity.WARNING),
        });
      }, 10 * 1000);
    }
    return () => {
      clearInterval(id);
    };
  }, [status]);

  return null;
};

export default MeetingStatusNotifier;
