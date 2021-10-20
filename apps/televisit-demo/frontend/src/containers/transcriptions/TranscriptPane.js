<<<<<<< HEAD
import React, { useRef, useEffect } from "react";
import TranscriptLine from "./TranscriptLine";
import InProgressTranscriptLine from "./InProgressTranscriptLine";

import cs from "clsx";
import s from "./TranscriptPane.module.css";

import { useTheme } from "styled-components";

const CATEGORIES = [
  "PROTECTED_HEALTH_INFORMATION",
  "MEDICAL_CONDITION",
  "ANATOMY",
  "MEDICATION",
  "TEST_TREATMENT_PROCEDURE",
];

export default function TranscriptPane({
=======
import React, { useRef, useEffect } from 'react';
import TranscriptLine from './TranscriptLine';
import InProgressTranscriptLine from './InProgressTranscriptLine';

import cs from 'clsx';
import s from './TranscriptPane.module.css';

import { useTheme } from 'styled-components';

const CATEGORIES = [
  'PROTECTED_HEALTH_INFORMATION',
  'MEDICAL_CONDITION',
  'ANATOMY',
  'MEDICATION',
  'TEST_TREATMENT_PROCEDURE'
];

export default function TranscriptPane ({
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  transcriptChunks,
  resultChunks,
  partialTranscript,
  inProgress,
<<<<<<< HEAD
  enableEditing,
=======
  enableEditing
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
}) {
  const currentTheme = useTheme();

  const onTranscriptChange = (i, value) => {
    setTranscripts((t) => {
      if (t[i].text === value) {
        return t;
      }
      const newChunk = {
        ...t[i],
<<<<<<< HEAD
        text: value,
=======
        text: value
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
      };

      return [...t.slice(0, i), newChunk, ...t.slice(i + 1)];
    });
  };

  const onSpeakerChange = (i, value) => {
    setTranscripts((t) => {
      if (t[i].speaker === value) return t;

      const newChunk = {
        ...t[i],
<<<<<<< HEAD
        speaker: value,
=======
        speaker: value
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
      };

      return [...t.slice(0, i), newChunk, ...t.slice(i + 1)];
    });
  };

  return (
<<<<<<< HEAD
    <div
      style={{
        backgroundColor: "white",
        height: "80%",
        borderRight: `solid 1px ${currentTheme.colors.greys.grey30}`,
      }}
    >
      <InProgressTranscriptLine
        key={transcriptChunks ? transcriptChunks.length : 0}
        text={partialTranscript}
      />

      {(transcriptChunks || []).map((x, i) => (
        <TranscriptLine
          key={i}
          chunk={x}
          results={resultChunks[i] ?? []}
          enabledCategories={CATEGORIES}
          enableEditing={enableEditing}
          handleTranscriptChange={(value) => onTranscriptChange(i, value)}
          onSpeakerChange={(value) => onSpeakerChange(i, value)}
        />
      ))}
    </div>
=======
      <div
        style={{
          backgroundColor: 'white',
          height: '80%',
          borderRight: `solid 1px ${currentTheme.colors.greys.grey30}`
        }}
      >
        <InProgressTranscriptLine key={transcriptChunks ? transcriptChunks.length : 0} text={partialTranscript} />

        {(transcriptChunks || []).map((x, i) => (
          <TranscriptLine
            key={i}
            chunk={x}
            results={resultChunks[i] ?? []}
            enabledCategories={CATEGORIES}
            enableEditing={enableEditing}
            handleTranscriptChange={(value) => onTranscriptChange(i, value)}
            onSpeakerChange={(value) => onSpeakerChange(i, value)}
          />
        ))}
      </div>
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  );
}
