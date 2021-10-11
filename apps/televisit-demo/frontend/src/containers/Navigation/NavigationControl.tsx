// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useEffect } from 'react';

import MeetingRoster from '../MeetingRoster';
import MeetingChat from '../MeetingChat';
import TranscriptAnalysisPane from '../transcriptions/TranscriptAnalysisPane';
import Navigation from '.';
import { useNavigation } from '../../providers/NavigationProvider';
import {
  useChatMessagingState,
} from '../../providers/ChatMessagesProvider';

import {
  useAudioVideo,
} from 'amazon-chime-sdk-component-library-react';
import { 
  Transcript,
  TranscriptEvent,
  TranscriptResult,
  Attendee,
  TranscriptItemType
} from 'amazon-chime-sdk-js';

const MeetingTranscript = ({transcriptEvent}:any) => {
  const { messages } = useChatMessagingState();
  const initialTranscripts:any[] = [];
  for (let i=0; i<messages.length;i++){
    if (messages[i].Sender.Name!='ModeratorBot') {
      initialTranscripts.unshift({
        startTimeMs: Date.parse( messages[i].CreatedTimestamp ),
        text: messages[i].Content,
        speaker: '(Chat) '+messages[i].Sender.Name
      });
    }
  }
  // initialTranscripts.sort((a:any, b:any) => b.startTimeMs - a.startTimeMs);

  const [partialTranscript, setPartialTranscript] = useState(' ');
  const [transcripts, setTranscripts] = useState(initialTranscripts);

  const addTranscriptChunk = (result: TranscriptResult) => {
    // create lines from chunk based on when new speaker starts talking
    const lines:any[] = [];

    let startTimeMs: number = null;
    let content = '';
    let attendee: Attendee = null;
    for (const item of result.alternatives[0].items) {
      if (!startTimeMs) {
        content = item.content;
        attendee = item.attendee;
        startTimeMs = item.startTimeMs;
      } else {
        if (item.attendee.attendeeId != attendee.attendeeId) {
          lines.unshift({
            startTimeMs: startTimeMs,
            text: content,
            speaker: attendee.externalUserId
          });
	      content = item.content;
          attendee = item.attendee;
          startTimeMs = item.startTimeMs;
        } else {
          if (item.type === TranscriptItemType.PUNCTUATION){
            content = content + item.content;
          } else{
            content = content + ' ' + item.content;
          }
        }
      }
    }

    lines.unshift({
      startTimeMs: startTimeMs,
      text: content,
      speaker: attendee.externalUserId
    });

    if (result.isPartial) {
      setPartialTranscript(lines.map((line) => `${line.speaker ? `${line.speaker} ` : ''}${line.text}`).join(' '));
    } else {
      setPartialTranscript(null);
      setTranscripts((t:any) => [...lines, ...t]);
    }
  }

  useEffect(()=>{
    if (transcriptEvent && transcriptEvent instanceof Transcript) {
      for (const result of transcriptEvent.results) {
        addTranscriptChunk(result);
      }
    }
  }, [transcriptEvent]);

  return (
    <TranscriptAnalysisPane
      transcriptChunks={transcripts}
      partialTranscript={partialTranscript}
      inProgress={false}
      enableEditing={false}
    />
  )
};


const NavigationControl = () => {
  const { showNavbar, showRoster, showChat, showTranscript } = useNavigation();

  const [meetingtranscriptevent, setMeetingtranscriptevent] = useState<TranscriptEvent | undefined>();
  const audioVideo = useAudioVideo();
  useEffect(() => {
    if (audioVideo) {
      audioVideo.transcriptionController?.subscribeToTranscriptEvent((transcriptEvent:TranscriptEvent) => {
        setMeetingtranscriptevent(transcriptEvent);
      });
    }
  }, [audioVideo])

  return (
    <>
      {showNavbar ? <Navigation /> : null}
      {showChat ? <MeetingChat /> : null}
      {showRoster ? <MeetingRoster /> : null}
      {showTranscript ? <MeetingTranscript transcriptEvent={meetingtranscriptevent}/> : null}
    </>
  );
};

export default NavigationControl;
