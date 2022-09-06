// CustomVideoTileGrid. This component is basically a wrapper which renders either 
// CustomTeacherVideoTileGrid or CustomStudentVideoTileGrid depending upon the joineeType

import React from "react";
import { useAppState } from "../../../providers/AppStateProvider";
import { Layout } from "../../../types";
import { USER_TYPES } from "../../../utils/enums";
import DashboardScreen from "./DashboardScreen";
import CustomStudentVideoTileGrid from "./tileGrids/CustomStudentVideoTileGrid";
import CustomTeacherVideoTileGrid from "./tileGrids/CustomTeacherVideoTileGrid";

const CustomVideoTileGrid: React.FC<any> = ({ children }) => {
  const { joineeType, layout } = useAppState();
  const tileGridToRender =
    joineeType !== USER_TYPES.STUDENT ? (
      <CustomTeacherVideoTileGrid
        noRemoteVideoView={<DashboardScreen />}
        layout={layout === Layout.Gallery ? "standard" : "featured"}
        className="videos"
      >
        {children}
      </CustomTeacherVideoTileGrid>
    ) : (
      <CustomStudentVideoTileGrid
        noRemoteVideoView={<DashboardScreen />}
        layout={layout === Layout.Gallery ? "standard" : "featured"}
        className="videos"
      >
        {children}
      </CustomStudentVideoTileGrid>
    );

  return <>{tileGridToRender}</>;
};

export default CustomVideoTileGrid;
