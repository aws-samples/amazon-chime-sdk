import { useCallback, useState } from 'react';
import { MeetingProvider } from 'amazon-chime-sdk-component-library-react';
import {
  ChannelMessagePersistenceType,
  ChannelMessageType,
  SendChannelMessageCommand,
} from '@aws-sdk/client-chime-sdk-messaging';
import { useTranslation, Trans } from 'react-i18next';
import Window from './Window';

import './MeetingPatientView.css';
import { useAwsClient } from '../providers/AwsClientProvider';
import { useMessaging } from '../providers/MessagingProvider';
import { useAuth } from '../providers/AuthProvider';
import useMeetingFunctions from '../hooks/useMeetingFunctions';
import { ReservedMessageContent, MeetingInviteStatus } from '../constants';
import { Channel, MeetingAPIResponse, MessageMetadata } from '../types';
import MeetingWidget from './MeetingWidget';

interface Props {
  channel: Channel;
  meetingId: string;
  onCleanUp: () => void;
}

export default function MeetingPatientView({ channel, meetingId, onCleanUp }: Props) {
  const { messagingClient } = useAwsClient();
  const { appInstanceUserArn } = useAuth();
  const { clientId } = useMessaging();
  const { createAttendee } = useMeetingFunctions();
  const [joinInfo, setJoinInfo] = useState<MeetingAPIResponse>();
  const [showStartingMeeting, setShowStartingMeeting] = useState(false);
  const { t } = useTranslation();

  const onClickAccept = useCallback(async () => {
    setShowStartingMeeting(true);
    try {
      await messagingClient.send(
        new SendChannelMessageCommand({
          ChannelArn: channel.summary.ChannelArn,
          Content: encodeURIComponent(ReservedMessageContent.AcceptedInvite),
          ChimeBearer: appInstanceUserArn,
          Type: ChannelMessageType.STANDARD,
          Persistence: ChannelMessagePersistenceType.NON_PERSISTENT,
          Metadata: JSON.stringify({
            isPresence: true,
            clientId,
            isMeetingInvitation: true,
            meetingInviteStatus: MeetingInviteStatus.Accepted,
            meetingId,
          } as MessageMetadata),
        })
      );
      const response = await createAttendee(channel, meetingId!);
      setJoinInfo(response);
      setShowStartingMeeting(false);
    } catch (error: any) {
      console.error(error);
    }
  }, [appInstanceUserArn, channel, clientId, createAttendee, meetingId, messagingClient]);

  const onClickDecline = useCallback(() => {
    try {
      // No "await" needed to unmount right after denying an invite
      messagingClient.send(
        new SendChannelMessageCommand({
          ChannelArn: channel.summary.ChannelArn,
          Content: encodeURIComponent(ReservedMessageContent.DeclinedInvite),
          ChimeBearer: appInstanceUserArn,
          Type: ChannelMessageType.STANDARD,
          Persistence: ChannelMessagePersistenceType.NON_PERSISTENT,
          Metadata: JSON.stringify({
            isPresence: true,
            clientId,
            isMeetingInvitation: true,
            meetingInviteStatus: MeetingInviteStatus.Declined,
            meetingId,
          } as MessageMetadata),
        })
      );
      onCleanUp();
    } catch (error: any) {
      console.error(error);
    }
  }, [appInstanceUserArn, channel.summary.ChannelArn, clientId, meetingId, messagingClient, onCleanUp]);

  return (
    <Window className="MeetingPatientView__window" isPortal title={t('MeetingPatientView.title', {
      name: channel.doctor.name,
    })}>
      <div className="MeetingPatientView">
        {!joinInfo && !showStartingMeeting && (
          <div className="MeetingPatientView__invitationContainer">
            <p>
              <Trans
                i18nKey={'MeetingPatientView.received'}
                values={{
                  name: channel.doctor.name,
                }}
              />
            </p>
            <button className="MeetingPatientView__acceptButton" onClick={onClickAccept}>
              {t('MeetingPatientView.accept')}
            </button>
            <button className="MeetingPatientView__declineButton" onClick={onClickDecline}>
              {t('MeetingPatientView.decline')}
            </button>
          </div>
        )}
        {showStartingMeeting && (
          <div className="MeetingPatientView__progressUpdateContainer">
            <p>
              <Trans
                i18nKey={'MeetingPatientView.starting'}
                values={{
                  name: channel.doctor.name,
                }}
              />
            </p>
          </div>
        )}
        {joinInfo && (
          <MeetingProvider>
            <MeetingWidget
              attendee={joinInfo.Attendee}
              meeting={joinInfo.Meeting}
              onCleanUp={onCleanUp}
              remoteAttendeeName={channel.doctor.name}
            />
          </MeetingProvider>
        )}
      </div>
    </Window>
  );
}
