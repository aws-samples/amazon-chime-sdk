// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from "react";

import {
  Navbar,
  NavbarHeader,
  NavbarItem,
  Attendees,
  Document,
  Chat,
  Eye,
  Information,
  Camera,
  Pause,
} from "amazon-chime-sdk-component-library-react";
import { useNavigation } from "../../providers/NavigationProvider";
import { useAppState } from "../../providers/AppStateProvider";
import {
  StartRecordMeetingModal,
  StopRecordMeetingModal,
} from "../../components/ChannelModals/RecordMeetingModal";
import {
  startMeetingRecording,
  stopMeetingRecording,
} from "../../api/ChimeAPI";

const Navigation = () => {
  const {
    toggleRoster,
    toggleChat,
    toggleMetrics,
    toggleTranscript,
    closeNavbar,
  } = useNavigation();
  const { meetingId, theme, toggleTheme } = useAppState();
  const [isRecording, setIsRecording] = useState(false);
  const [mediaCapturePipeline, setMediaCapturePipeline] = useState("");
  const [showStartRecording, setShowStartRecording] = useState(false);
  const [showStopRecording, setShowStopRecording] = useState(false);

  const startRecording = async (e: any) => {
    e.preventDefault();
    setIsRecording(true);
    setShowStartRecording(false);
    const RecordingInfo = await startMeetingRecording(meetingId);
    if (RecordingInfo.MediaCapturePipeline) {
      setMediaCapturePipeline(
        RecordingInfo.MediaCapturePipeline.MediaPipelineId
      );
    }
  };

  const stopRecording = async (e: any) => {
    e.preventDefault();
    setIsRecording(false);
    setShowStopRecording(false);
    await stopMeetingRecording(mediaCapturePipeline);
  };

  return (
    <Navbar className="nav" flexDirection="column" container>
      <NavbarHeader title="Navigation" onClose={closeNavbar} />
      <NavbarItem
        icon={<Attendees />}
        onClick={toggleRoster}
        label="Attendees"
      />
      <NavbarItem icon={<Chat />} onClick={toggleChat} label="Chat" />
      <NavbarItem
        icon={<Eye />}
        onClick={toggleTheme}
        label={theme === "light" ? "Dark mode" : "Light mode"}
      />
      <NavbarItem
        icon={<Document />}
        onClick={toggleTranscript}
        label="Transcription"
      />
      <StartRecordMeetingModal
        isStartOpen={showStartRecording}
        onClose={() => setShowStartRecording(false)}
        startRecording={startRecording}
      />
      <StopRecordMeetingModal
        isStopOpen={showStopRecording}
        onClose={() => setShowStopRecording(false)}
        stopRecording={stopRecording}
      />
      {isRecording ? (
        <NavbarItem
          icon={<Pause />}
          onClick={() => {
            setShowStopRecording(true);
          }}
          label="Recording"
        />
      ) : (
        <NavbarItem
          icon={<Camera />}
          onClick={() => {
            setShowStartRecording(true);
          }}
          label="Recording"
        />
      )}
      <NavbarItem
        icon={<Information />}
        onClick={toggleMetrics}
        label="Meeting metrics"
      />
    </Navbar>
  );
};

export default Navigation;
