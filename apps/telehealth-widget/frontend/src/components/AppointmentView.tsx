import { useCallback, useEffect, useRef, useState } from 'react';
import { Message, MessagingSessionObserver } from 'amazon-chime-sdk-js';
import {
  ChannelMessagePersistenceType,
  ChannelMessageType,
  SendChannelMessageCommand,
} from '@aws-sdk/client-chime-sdk-messaging';
import { InvokeCommand, InvocationType, LogType } from '@aws-sdk/client-lambda';
import { PopOver, PopOverHeader, PopOverItem } from 'amazon-chime-sdk-component-library-react';
import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';

import './AppointmentView.css';
import { useAwsClient } from '../providers/AwsClientProvider';
import { useAuth } from '../providers/AuthProvider';
import { useMessaging } from '../providers/MessagingProvider';
import { useRoute } from '../providers/RouteProvider';
import useInterval from '../hooks/useInterval';
import { MessageMetadata, Channel } from '../types';
import { DeleteAppointmentFunctionEvent } from '../types/lambda';
import { AccountType, Presence, ReservedMessageContent, MeetingInviteStatus } from '../constants';
import Chat from './Chat';
import MeetingDoctorView from './MeetingDoctorView';
import MeetingPatientView from './MeetingPatientView';
import Config from '../utils/Config';

dayjs.extend(calendar);
dayjs.extend(localizedFormat);
const PRESENCE_CHECK_THRESHOLD = 10000; // 10 seconds.
const REMOTE_ATTENDEE_PRESENCE_CHECK_INTERVAL = 5000; // 5 seconds.
const PING_INTERVAL = 3000; // 3 seconds.

export default function AppointmentView(): JSX.Element {
  const { params, setRoute } = useRoute();
  const { appInstanceUserArn, user, accountType } = useAuth();
  const { messagingClient, lambdaClient } = useAwsClient();
  const { clientId, messagingSession } = useMessaging();
  const loadingRef = useRef<boolean>(false);
  const [checkedIn, setCheckedIn] = useState<boolean>(false);
  const channel = params.channel as Channel;
  const channelArn = channel.summary.ChannelArn!;

  // For doctor view
  const [showMeetingDoctorView, setShowMeetingDoctorView] = useState(false);

  // For patient view
  const [meetingId, setMeetingId] = useState<string>();

  // When a doctor chooses "Call," the MeetingDoctorView component repeats sending meeting invitation messages
  // until the MeetingPatientView component accepts or denies it. Use the following Set to avoid handling
  // the already-denied meeting invitation. (e.g., an old invitation can arrive late in slow internet connection.)
  const cleanedUpMeetingIdsRef = useRef<Set<string>>(new Set());

  // For remote attendee presence
  const presenceMap = useRef<{ [key: string]: number }>({});
  const [isRemoteAttendeePresent, setIsRemoteAttendeePresent] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    let observer: MessagingSessionObserver;
    if (messagingSession) {
      observer = {
        messagingSessionDidReceiveMessage: (message: Message) => {
          if (message.type === 'CREATE_CHANNEL_MESSAGE') {
            const payload = JSON.parse(message.payload);
            if (payload.ChannelArn !== channelArn) {
              return;
            }
            const senderUsername = payload.Sender.Arn.split('/user/')[1];
            if (message.headers['x-amz-chime-message-type'] === 'CONTROL') {
              let content = decodeURIComponent(payload.Content);
              if (content === 'ping') {
                presenceMap.current[senderUsername] = Date.now();
              }
              return;
            }
            try {
              const metadata = JSON.parse(payload.Metadata) as MessageMetadata;
              if (
                accountType === AccountType.Patient &&
                metadata.isMeetingInvitation &&
                senderUsername === channel.doctor.username &&
                metadata.meetingId &&
                !cleanedUpMeetingIdsRef.current.has(metadata.meetingId)
              ) {
                if (metadata.meetingInviteStatus === MeetingInviteStatus.Unknown) {
                  setMeetingId(metadata.meetingId);
                } else if (metadata.meetingInviteStatus === MeetingInviteStatus.Cancel) {
                  setMeetingId(undefined);
                }
              }
            } catch (error: any) {
              console.warn(`AppointmentView::messagingSessionDidReceiveMessage::Failed to decode the message`, error);
            }
          } else if (message.type === 'DELETE_CHANNEL') {
            const payload = JSON.parse(message.payload);
            if (payload.ChannelArn !== channelArn) {
              return;
            }
            setRoute('AppointmentList');
          }
        },
      };
      messagingSession.addObserver(observer);
    }
    return () => {
      messagingSession?.removeObserver(observer);
    };
  }, [
    setRoute,
    channelArn,
    messagingSession,
    clientId,
    accountType,
    user.username,
    channel.patient.username,
    channel.doctor.username,
  ]);

  useEffect(() => {
    (async () => {
      try {
        await messagingClient.send(
          new SendChannelMessageCommand({
            ChannelArn: channelArn,
            Content: encodeURIComponent(ReservedMessageContent.CheckedIn),
            ChimeBearer: appInstanceUserArn,
            Type: ChannelMessageType.STANDARD,
            // The messaging processor Lambda function denies this message if the presence value
            // has not changed. i.e., You will not see the same "checked in" message twice.
            Persistence: ChannelMessagePersistenceType.PERSISTENT,
            Metadata: JSON.stringify({
              presence: Presence.CheckedIn,
              clientId,
            } as MessageMetadata),
          })
        );
      } catch (error: any) {
        console.error(error);
      } finally {
        setCheckedIn(true);
      }
    })();
  }, [appInstanceUserArn, clientId, messagingClient, channelArn, setCheckedIn]);

  const setupPingForPresenceTrack = async () => {
    try {
      await messagingClient.send(
        new SendChannelMessageCommand({
          ChannelArn: channelArn,
          Content: encodeURIComponent('ping'),
          ChimeBearer: appInstanceUserArn,
          Type: ChannelMessageType.CONTROL,
          Persistence: ChannelMessagePersistenceType.NON_PERSISTENT,
        })
      );
    } catch (error: any) {
      console.error(error);
    }
  };
  useInterval(setupPingForPresenceTrack, PING_INTERVAL);

  const trackRemotePresence = () => {
    if (accountType === AccountType.Doctor) {
      if (!presenceMap.current[channel.patient.username]) {
        return;
      }
      if (Date.now() - presenceMap.current[channel.patient.username] > PRESENCE_CHECK_THRESHOLD) {
        if (isRemoteAttendeePresent) {
          setIsRemoteAttendeePresent(false);
          console.debug(
            'AppointmentView::Presence::Found that the patient as a remote attendee is not present',
            presenceMap
          );
        }
      } else {
        if (!isRemoteAttendeePresent) {
          setIsRemoteAttendeePresent(true);
          console.debug(
            'AppointmentView::Presence::Found that the patient as a remote attendee is present',
            presenceMap
          );
        }
      }
    }
    if (accountType === AccountType.Patient) {
      if (!presenceMap.current[channel.doctor.username]) {
        return;
      }
      if (Date.now() - presenceMap.current[channel.doctor.username] > PRESENCE_CHECK_THRESHOLD) {
        if (isRemoteAttendeePresent) {
          setIsRemoteAttendeePresent(false);
          console.debug(
            'AppointmentView::Presence::Found that the doctor as a remote attendee is not present now',
            presenceMap
          );
        }
      } else {
        if (!isRemoteAttendeePresent) {
          setIsRemoteAttendeePresent(true);
          console.debug(
            'AppointmentView::Presence::Found that the doctor as a remote attendee is present now',
            presenceMap
          );
        }
      }
    }
  };
  useInterval(trackRemotePresence, REMOTE_ATTENDEE_PRESENCE_CHECK_INTERVAL);

  const onClickBack = useCallback(() => {
    setRoute('AppointmentList');
  }, [setRoute]);

  const onClickDelete = useCallback(() => {
    if (loadingRef.current) {
      return;
    }
    loadingRef.current = true;
    (async () => {
      try {
        await lambdaClient.send(
          new InvokeCommand({
            FunctionName: Config.DeleteAppointmentFunctionArn,
            InvocationType: InvocationType.RequestResponse,
            LogType: LogType.None,
            Payload: new TextEncoder().encode(
              JSON.stringify({
                appInstanceUserArn,
                channelArn,
              } as DeleteAppointmentFunctionEvent)
            ),
          })
        );
      } catch (error: any) {
        console.error(error);
      } finally {
        setRoute('AppointmentList');
        loadingRef.current = false;
      }
    })();
  }, [appInstanceUserArn, channelArn, lambdaClient, setRoute]);

  const onClickCall = useCallback(() => {
    setShowMeetingDoctorView(true);
  }, []);

  const onCleanUpDoctor = useCallback(() => {
    setShowMeetingDoctorView(false);
  }, []);

  const onCleanUpPatient = useCallback(() => {
    if (meetingId) {
      cleanedUpMeetingIdsRef.current.add(meetingId);
      setMeetingId(undefined);
    }
  }, [meetingId]);

  return (
    <div
      className={classnames('AppointmentView', {
        'AppointmentView--doctor': accountType === AccountType.Doctor,
        'AppointmentView--patient': accountType === AccountType.Patient,
      })}
    >
      <div className="AppointmentView__menu">
        <button className="AppointmentView__backButton" onClick={onClickBack}>{`〈 ${t(
          'AppointmentView.back'
        )}`}</button>
        <div className="AppointmentView__popOverButtonContainer">
          <PopOver
            className="AppointmentView__popOverButton"
            a11yLabel="Menu"
            renderButton={() => (
              <>
                <span className="AppointmentView__title">
                  {accountType === AccountType.Doctor ? channel.patient.name : channel.doctor.name}
                </span>
                <span className="AppointmentView__icon">
                  <svg width="16px" height="16px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg">
                    <title>v</title>
                    <g id="v" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                      <path
                        d="M14.8779913,6.95221415 C15.2559625,6.54952791 15.8888104,6.52949244 16.2914967,6.90746365 C16.663207,7.25636016 16.7088718,7.82242971 16.4164131,8.22417648 L16.3362472,8.32096901 L10.0001925,15.0713296 L3.2348718,8.34577982 C2.84319795,7.95640848 2.84133139,7.32324626 3.23070273,6.9315724 C3.59012243,6.57002731 4.15726927,6.54062571 4.55045798,6.84449281 L4.64491015,6.92740334 L9.95,12.202 L14.8779913,6.95221415 Z"
                        id="Path"
                        fill="#000000"
                        fillRule="nonzero"
                      ></path>
                    </g>
                  </svg>
                </span>
              </>
            )}
            placement="bottom-start"
          >
            <PopOverHeader
              title={t('AppointmentView.appointment')}
              subtitle={dayjs(channel.appointmentTimestamp).calendar(null, {
                sameDay: t('AppointmentView.dayJsSameDayFormat'),
                nextDay: t('AppointmentView.dayJsNextDayFormat'),
                nextWeek: 'L LT',
                lastDay: 'L LT',
                lastWeek: 'L LT',
                sameElse: 'L LT',
              })}
            />
            {accountType === AccountType.Doctor && (
              <PopOverItem as="button" onClick={onClickDelete} children={<span>{t('AppointmentView.delete')}</span>} />
            )}
          </PopOver>
        </div>
        {accountType === AccountType.Doctor && (
          <button className="AppointmentView__callButton" onClick={onClickCall}>
            {t('AppointmentView.call')}
          </button>
        )}
      </div>
      {checkedIn && (
        <>
          <Chat channel={channel} />
          {showMeetingDoctorView && <MeetingDoctorView channel={channel} onCleanUp={onCleanUpDoctor} />}
          {meetingId && (
            // We must pass the meeting ID as a key because MeetingPatientView does not support the case when
            // only the meeting ID prop changes. Providing a unique key will mount a new copy of MeetingPatientView.
            <MeetingPatientView key={meetingId} channel={channel} meetingId={meetingId} onCleanUp={onCleanUpPatient} />
          )}
        </>
      )}
    </div>
  );
}
