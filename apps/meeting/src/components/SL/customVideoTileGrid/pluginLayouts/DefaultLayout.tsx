import {
  ContentShare,
  LocalVideo,
  RemoteVideos,
  useContentShareState,
  useLocalVideo,
  useRemoteVideoTileState,
} from "amazon-chime-sdk-component-library-react";
import { BaseProps } from "amazon-chime-sdk-component-library-react/lib/components/ui/Base";
import React from "react";
import { Layout } from "../../../../types";

const fluidStyles = `
  height: 100%;
  width: 100%;
`;

const staticStyles = `
  display: flex;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  max-height: 80vh;
  width: 70vw;
  video {
    position: static;
  }
`;

interface Props extends BaseProps {
  /** A component to render when there are no remote videos present */
  noRemoteVideoView?: React.ReactNode;
  /** The layout of the grid. */
  layout?: Layout | any;
}

const DefaultLayout: React.FC<Props> = ({
  noRemoteVideoView,
  layout = "featured",
}) => {
  const { tiles } = useRemoteVideoTileState();
  const { tileId: contentTileId } = useContentShareState();
  const { isVideoEnabled } = useLocalVideo();
  const remoteSize = tiles.length + (contentTileId ? 1 : 0);
  const gridSize =
    remoteSize > 1 && isVideoEnabled ? remoteSize + 1 : remoteSize;

  return (
    <>
      <ContentShare css="grid-area: ft;" />
      <RemoteVideos
        css={gridSize > 1 ? fluidStyles : staticStyles}
      />
      <LocalVideo
        nameplate="Me"
        css={gridSize > 1 ? fluidStyles : staticStyles}
      />
      {remoteSize === 0 && noRemoteVideoView}
    </>
  );
};

export default DefaultLayout;
