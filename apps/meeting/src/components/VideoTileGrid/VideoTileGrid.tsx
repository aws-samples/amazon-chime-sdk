// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  useFeaturedTileState,
  useRemoteVideoTileState,
  useContentShareState,
  useLocalVideo,
  VideoGrid,
  ContentShare,
  FeaturedRemoteVideos,
  RemoteVideos,
  LocalVideo,
} from 'amazon-chime-sdk-component-library-react';
import { BaseProps } from 'amazon-chime-sdk-component-library-react/lib/components/ui/Base';
import React from 'react';
import { FeaturedArea, ContentShareGrid } from './Styled';
import { Layout } from 'amazon-chime-sdk-component-library-react/lib/components/ui/VideoGrid';

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

interface Props extends BaseProps {
  /** A component to render when there are no remote videos present */
  noRemoteVideoView?: React.ReactNode;
  /** The layout of the grid. */
  layout?: Layout;
}

export const VideoTileGrid: React.FC<React.PropsWithChildren<Props>> = ({
  noRemoteVideoView,
  layout = 'featured',
  ...rest
}) => {
  const { tileId: featureTileId } = useFeaturedTileState();
  const { tiles: remoteVideoTiles } = useRemoteVideoTileState();
  const { tiles: contentShareTiles } = useContentShareState();
  const { isVideoEnabled } = useLocalVideo();

  const hasContentShare = contentShareTiles.length > 0;
  const remoteSize = remoteVideoTiles.length + contentShareTiles.length;
  const gridSize = remoteSize > 1 && isVideoEnabled ? remoteSize + 1 : remoteSize;

  const featured = (layout === 'featured' && !!featureTileId) || hasContentShare;

  return (
    <VideoGrid {...rest} size={gridSize} layout={featured ? 'featured' : null}>
      {contentShareTiles.length === 1 ? (
        <ContentShare css="grid-area: ft;" tileId={contentShareTiles[0]} />
      ) : contentShareTiles.length > 1 ? (
        // For multiple content shares, create a grid container in featured area
        <FeaturedArea>
          <ContentShareGrid>
            {contentShareTiles.map((tileId) => (
              <ContentShare key={tileId} tileId={tileId} />
            ))}
          </ContentShareGrid>
        </FeaturedArea>
      ) : null}
      {layout === 'featured' ? <FeaturedRemoteVideos /> : <RemoteVideos />}
      <LocalVideo nameplate="Me" css={gridSize > 1 ? fluidStyles : staticStyles} />
      {remoteSize === 0 && noRemoteVideoView}
    </VideoGrid>
  );
};

export default VideoTileGrid;
