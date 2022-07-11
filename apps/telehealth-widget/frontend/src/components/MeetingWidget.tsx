import { useEffect, useState } from 'react';
import { MeetingSessionConfiguration } from 'amazon-chime-sdk-js';
import {
  ControlBar,
  LeaveMeeting,
  ControlBarButton,
  VideoInputControl,
  AudioInputControl,
  LocalVideo,
  useMeetingManager,
  useMeetingStatus,
  MeetingStatus,
  useLocalVideo,
} from 'amazon-chime-sdk-component-library-react';
import { useTranslation } from 'react-i18next';

import './MeetingWidget.css';
import useMountedRef from '../hooks/useMountedRef';
import VideoPlaceholder from './VideoPlaceholder';
import RemoteAttendeeVideo from './RemoteAttendeeVideo';
import Spinner from './Spinner';

interface Props {
  attendee: any;
  meeting: any;
  onCleanUp: () => void;
  remoteAttendeeName: string;
}

export default function MeetingWidget({ meeting, attendee, onCleanUp, remoteAttendeeName }: Props) {
  const [showJoin, setShowJoin] = useState(true);
  const meetingManager = useMeetingManager();
  const meetingStatus = useMeetingStatus();
  const { isVideoEnabled } = useLocalVideo();
  const mountedRef = useMountedRef();
  const { t } = useTranslation();

  useEffect(() => {
    if (!mountedRef.current) {
      return;
    }
    async function startMeeting() {
      const configuration = new MeetingSessionConfiguration(meeting, attendee);
      await meetingManager.join(configuration);
      await meetingManager.start();
    }
    startMeeting();
    return () => {
      meetingManager?.leave();
      onCleanUp();
    };
  }, [meeting, attendee, meetingManager, mountedRef, onCleanUp]);

  useEffect(() => {
    if (meetingStatus === MeetingStatus.Succeeded) {
      setShowJoin(true);
    } else {
      setShowJoin(false);
    }
  }, [meetingStatus]);

  const onClickLeave = async () => {
    await meetingManager.leave();
    setShowJoin(false);
    onCleanUp();
  };

  return (
    <div className="MeetingWidget">
      {!showJoin ? (
        <Spinner />
      ) : (
        <>
          <div className="MeetingWidget__videos">
            <RemoteAttendeeVideo
              localExternalUserId={attendee.ExternalUserId}
              remoteAttendeeName={remoteAttendeeName}
            />
            <div className="MeetingWidget__localVideoContainer">
              {isVideoEnabled ? <LocalVideo /> : <VideoPlaceholder title={t('MeetingWidget.me')} />}
            </div>
          </div>
          <div className="MeetingWidget__controlBar">
            <ControlBar
              className="MeetingWidget__controlBarMenu"
              layout="undocked-horizontal"
              showLabels
              responsive={false}
            >
              <AudioInputControl muteLabel={t('MeetingWidget.mute')} unmuteLabel={t('MeetingWidget.unmute')} />
              <VideoInputControl label={t('MeetingWidget.video')} />
              <ControlBarButton icon={<LeaveMeeting />} onClick={onClickLeave} label={t('MeetingWidget.leave')} />
            </ControlBar>
          </div>
        </>
      )}
    </div>
  );
}
