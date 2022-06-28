import { ReactNode, useEffect, useRef, useState } from 'react';
import { RemoteVideo, useRemoteVideoTileState, useRosterState } from 'amazon-chime-sdk-component-library-react';
import { useTranslation } from 'react-i18next';

import './RemoteAttendeeVideo.css';
import VideoPlaceholder from './VideoPlaceholder';
import { PhoneAttendeePrefix } from '../constants';

export default function RemoteAttendeeVideo({
  localExternalUserId,
  remoteAttendeeName,
}: {
  localExternalUserId: string;
  remoteAttendeeName: string;
}) {
  const { roster } = useRosterState();
  const { tiles, attendeeIdToTileId } = useRemoteVideoTileState();
  const [remoteTileId, setRemoteTileId] = useState<number>();
  const { t } = useTranslation();

  const remoteAttendees = Object.values(roster).filter(
    (attendee) => !attendee.externalUserId?.includes(localExternalUserId)
  );
  const phoneAttendees = remoteAttendees.filter((attendee) => {
    return attendee.externalUserId?.startsWith(PhoneAttendeePrefix);
  });
  const remoteAttendeesWithVideoOn = remoteAttendees.filter(
    (attendee) => attendee.chimeAttendeeId in attendeeIdToTileId
  );

  useEffect(() => {
    if (tiles && tiles.length) {
      setRemoteTileId(tiles[0]);
    } else {
      setRemoteTileId(undefined);
    }
  }, [tiles]);

  const previousLengthRef = useRef<number>(0);
  const [hasLeft, setHasLeft] = useState<boolean>(false);
  useEffect(() => {
    if (remoteAttendees.length === 0 && previousLengthRef.current > 0) {
      setHasLeft(true);
    }
    previousLengthRef.current = remoteAttendees.length;
  }, [remoteAttendees.length]);

  let node: ReactNode;
  if (remoteAttendees.length === 0) {
    if (hasLeft) {
      node = (
        <VideoPlaceholder
          title={`${t('RemoteAttendeeVideo.left', {
            name: remoteAttendeeName,
          })}`}
          icons={[]}
        />
      );
    } else {
      node = null;
    }
  } else if (remoteAttendees.length === 1) {
    if (remoteAttendeesWithVideoOn.length && remoteTileId) {
      node = <RemoteVideo tileId={remoteTileId} />;
    } else if (phoneAttendees.length) {
      node = <VideoPlaceholder title={`${remoteAttendeeName} ${t('RemoteAttendeeVideo.phone')}`} icons={['Phone']} />;
    } else {
      node = <VideoPlaceholder title={remoteAttendeeName} />;
    }
  } else {
    // The patient can join a meeting by phone and browser simulatenously.
    if (remoteAttendeesWithVideoOn.length && remoteTileId) {
      node = <RemoteVideo tileId={remoteTileId} />;
    } else if (phoneAttendees.length) {
      node = (
        <VideoPlaceholder title={`${remoteAttendeeName} ${t('RemoteAttendeeVideo.phoneAndWeb')}`} icons={['Phone']} />
      );
    } else {
      node = <VideoPlaceholder title={remoteAttendeeName} />;
    }
  }

  return <div className="RemoteAttendeeVideo">{node}</div>;
}
