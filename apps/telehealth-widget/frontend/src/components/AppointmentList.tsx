import { ReactNode, useCallback, useEffect, useState } from 'react';
import { Message, MessagingSessionObserver } from 'amazon-chime-sdk-js';
import {
  ChannelModeratedByAppInstanceUserSummary,
  ListChannelsModeratedByAppInstanceUserCommand,
} from '@aws-sdk/client-chime-sdk-messaging';
import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { useTranslation } from 'react-i18next';

import './AppointmentList.css';
import { useAuth } from '../providers/AuthProvider';
import { useAwsClient } from '../providers/AwsClientProvider';
import { useMessaging } from '../providers/MessagingProvider';
import { useRoute } from '../providers/RouteProvider';
import useMountedRef from '../hooks/useMountedRef';
import { AccountType, Presence } from '../constants';
import { Channel, ChannelMetadata } from '../types';

dayjs.extend(calendar);
dayjs.extend(localizedFormat);

const REFRESH_INTERVAL = 15000;

export default function AppointmentList(): JSX.Element {
  const { messagingClient } = useAwsClient();
  const { appInstanceUserArn, accountType } = useAuth();
  const { setRoute } = useRoute();
  const [channels, setChannels] = useState<Channel[]>();
  const { messagingSession } = useMessaging();
  const mountedRef = useMountedRef();
  const { t } = useTranslation();

  const listChannels = useCallback(async () => {
    (async () => {
      try {
        const channels: ChannelModeratedByAppInstanceUserSummary[] = [];
        let nextToken: string | undefined;
        do {
          const data = await messagingClient.send(
            new ListChannelsModeratedByAppInstanceUserCommand({
              ChimeBearer: appInstanceUserArn,
              NextToken: nextToken,
            })
          );
          channels.push(...(data.Channels || []));
          nextToken = data.NextToken;
        } while (nextToken);
        if (!mountedRef.current) {
          return;
        }

        setChannels(
          channels
            .map<Channel>((channel: ChannelModeratedByAppInstanceUserSummary) => {
              const metadata: ChannelMetadata = JSON.parse(channel.ChannelSummary?.Metadata!);
              return {
                appointmentTimestamp: new Date(metadata.appointmentTimestamp),
                doctor: metadata.doctor,
                patient: metadata.patient,
                presenceMap: metadata.presenceMap,
                summary: channel.ChannelSummary,
                sfnExecutionArn: metadata.sfnExecutionArn,
              } as Channel;
            })
            .sort(
              (channel1: Channel, channel2: Channel) =>
                channel1.appointmentTimestamp.getTime() - channel2.appointmentTimestamp.getTime()
            )
        );
      } catch (error) {
        console.error(error);
      }
    })();
  }, [appInstanceUserArn, messagingClient, mountedRef]);

  useEffect(() => {
    // When the backend creates multiple requests of UpdateChannel API simultaneously,
    // the messaging session (WebSocket) sometimes does not receive all UPDATE_CHANNEL messages.
    // Keep refreshing the list 15 seconds later from the previous listChannels() call.
    let timeoutId: ReturnType<typeof setTimeout>;
    const refreshChannels = () => {
      clearTimeout(timeoutId);
      listChannels();
      timeoutId = setTimeout(refreshChannels, REFRESH_INTERVAL);
    };

    let observer: MessagingSessionObserver;
    if (messagingSession) {
      observer = {
        messagingSessionDidReceiveMessage: (message: Message) => {
          if (
            message.type === 'CREATE_CHANNEL_MEMBERSHIP' ||
            message.type === 'DELETE_CHANNEL' ||
            message.type === 'UPDATE_CHANNEL'
          ) {
            refreshChannels();
          }
        },
      };
      messagingSession.addObserver(observer);
      refreshChannels();
    }
    return () => {
      messagingSession?.removeObserver(observer);
    };
  }, [messagingSession, listChannels]);

  const onClickCreateAppointment = () => {
    setRoute('CreateAppointment');
  };

  const onClickAppointment = (channel: Channel) => {
    setRoute('AppointmentView', {
      channel,
    });
  };

  const getPresenceLabel = (presence: Presence) => {
    return presence === Presence.CheckedIn ? ` (${t('AppointmentList.checkedIn')})` : '';
  };

  const createList = (title: string, channels?: Channel[]): ReactNode => {
    if (!channels?.length) {
      return <></>;
    }
    return (
      <>
        <div className="AppointmentList__listTitle">{title}</div>
        <ul className="AppointmentList__list">
          {channels.map((channel: Channel) => (
            <li className="AppointmentList__listItem" key={channel.summary.ChannelArn}>
              <div className="AppointmentList__nameContainer">
                <div className="AppointmentList__name">
                  {accountType === AccountType.Doctor ? channel.patient.name : channel.doctor.name}
                </div>
                <div className="AppointmentList__label">
                  {accountType === AccountType.Doctor ? t('AppointmentList.patient') : t('AppointmentList.doctor')}
                  {accountType === AccountType.Doctor
                    ? getPresenceLabel(channel.presenceMap[channel.patient.username].presence)
                    : getPresenceLabel(channel.presenceMap[channel.doctor.username].presence)}
                </div>
              </div>
              <div className="AppointmentList__dateTime">
                <div className="AppointmentList__date">
                  <span className="AppointmentList__icon">{'📅'}</span>
                  <span>
                    {dayjs(channel.appointmentTimestamp).calendar(null, {
                      sameDay: t('AppointmentList.dayJsSameDayFormat'),
                      nextDay: t('AppointmentList.dayJsNextDayFormat'),
                      nextWeek: 'L',
                      lastDay: 'L',
                      lastWeek: 'L',
                      sameElse: 'L',
                    })}
                  </span>
                </div>
                <div className="AppointmentList__time">
                  <span className="AppointmentList__icon">{'🕑'}</span>
                  <span>{dayjs(channel.appointmentTimestamp).format('LT')}</span>
                </div>
              </div>
              <div className="AppointmentList__buttonContainer">
                <button
                  className="AppointmentList__button"
                  onClick={() => {
                    onClickAppointment(channel);
                  }}
                >
                  {t('AppointmentList.checkIn')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </>
    );
  };

  const currentChannels = channels?.filter((channel: Channel) => !dayjs(channel.appointmentTimestamp).isAfter(dayjs()));
  const upcomingChannels = channels?.filter((channel: Channel) => dayjs(channel.appointmentTimestamp).isAfter(dayjs()));

  return (
    <div className="AppointmentList">
      <div className="AppointmentList__listContainer">
        {currentChannels?.length === 0 && upcomingChannels?.length === 0 && (
          <div className="AppointmentList__noAppointment">
            {accountType === AccountType.Doctor
              ? 'No appointments are available.'
              : 'No appointments are available. Ask your doctor to make an appointment.'}
          </div>
        )}
        {createList(t('AppointmentList.currentAppointments'), currentChannels)}
        {createList(t('AppointmentList.upcomingAppointments'), upcomingChannels)}
      </div>
      {accountType === AccountType.Doctor && (
        <div className="AppointmentList__createAppointmentContainer">
          <button className="AppointmentList__createAppointmentButton" onClick={onClickCreateAppointment}>
            {t('AppointmentList.createAppointment')}
          </button>
        </div>
      )}
    </div>
  );
}
