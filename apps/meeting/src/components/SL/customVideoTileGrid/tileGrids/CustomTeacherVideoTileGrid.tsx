import {
  useContentShareState,
  useFeaturedTileState,
  useLocalVideo,
  useRemoteVideoTileState,
  VideoGrid,
} from "amazon-chime-sdk-component-library-react";
import React from "react";
import { BaseProps } from "amazon-chime-sdk-component-library-react/lib/components/ui/Base";
import { Layout } from "../../../../types";
import PluginRenderer from "../pluginLayouts";

interface Props extends BaseProps {
  /** A component to render when there are no remote videos present */
  noRemoteVideoView?: React.ReactNode;
  /** The layout of the grid. */
  layout?: Layout | any;
}

const CustomTeacherVideoTileGrid: React.FC<Props> = ({
  noRemoteVideoView,
  layout = "featured",
  ...rest
}) => {
  const { tileId: featureTileId } = useFeaturedTileState();
  const { tiles } = useRemoteVideoTileState();
  const { tileId: contentTileId } = useContentShareState();
  const { isVideoEnabled } = useLocalVideo();
  const featured =
    (layout === "featured" && !!featureTileId) || !!contentTileId;
  const remoteSize = tiles.length + (contentTileId ? 1 : 0);
  const gridSize =
    remoteSize > 1 && isVideoEnabled ? remoteSize + 1 : remoteSize;

  return (
    <VideoGrid {...rest} size={gridSize} layout={featured ? "featured" : null}>
      <PluginRenderer />
    </VideoGrid>
  );
};

export default CustomTeacherVideoTileGrid;
