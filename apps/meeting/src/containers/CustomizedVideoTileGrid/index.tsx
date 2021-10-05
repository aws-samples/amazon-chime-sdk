// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import {
  ContentShare,
  FeaturedRemoteVideos,
  LocalVideo,
  RemoteVideos,
  useContentShareState,
  useFeaturedTileState,
  useLocalVideo,
  useRemoteVideoTileState,
  VideoGrid
} from 'amazon-chime-sdk-component-library-react';
import { BaseProps } from 'amazon-chime-sdk-component-library-react/lib/components/ui/Base';
import React from 'react';

const fluidStyles = `
  height: 100%;
  width: 100%;
`;

const staticStyles = `
  display: flex;
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  width: 20vw;
  max-height: 30vh;
  height: auto;

  video {
    position: static;
  }
`;

export declare type Layout = 'gallery' | 'featured';

interface Props extends BaseProps {
  /** A component to render when there are no remote videos present */
  noRemoteVideoView?: React.ReactNode;
  /** The layout of the grid. */
  layout?: Layout;
}

export const CustomizedVideoTileGrid: React.FC<Props> = ({
  layout = 'gallery',
  ...rest
}) => {
  const { tiles } = useRemoteVideoTileState();
  const { isVideoEnabled } = useLocalVideo();
  const { tileId: featureTileId } = useFeaturedTileState();
  const { tileId: contentTileId } = useContentShareState();

  let gridSize: number;
  let videoGridLayout: 'standard' | 'featured' | null;
  let localVideoStyle: string;

  if (layout === 'gallery') {
    gridSize = (isVideoEnabled ? tiles.length + 1 : tiles.length);
    videoGridLayout = 'standard';
    localVideoStyle = fluidStyles;
  } else {
    const remoteSize = tiles.length + (contentTileId ? 1 : 0);
    const featured = (layout === 'featured' && !!featureTileId) || !!contentTileId;
    gridSize = remoteSize > 1 && isVideoEnabled
      ? remoteSize + 1
      : remoteSize;
    videoGridLayout = featured ? 'featured' : null;
    localVideoStyle = gridSize > 1 ? fluidStyles : staticStyles;
  };

  return (
    <VideoGrid {...rest} size={gridSize} layout={videoGridLayout}>
      {layout === "featured" && <ContentShare css="grid-area: ft;" />}
      {layout === "featured" ? <FeaturedRemoteVideos /> : <RemoteVideos />}
      <LocalVideo
        nameplate="Me"
        css={localVideoStyle}
      />
    </VideoGrid>
  );
};

export default CustomizedVideoTileGrid;
