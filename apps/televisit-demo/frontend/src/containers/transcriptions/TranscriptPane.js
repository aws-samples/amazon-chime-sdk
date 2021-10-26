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
  'TEST_TREATMENT_PROCEDURE',
];

export default function TranscriptPane({
  transcriptChunks,
  resultChunks,
  partialTranscript,
  inProgress,
  enableEditing,
}) {
  const currentTheme = useTheme();

  const onTranscriptChange = (i, value) => {
    setTranscripts((t) => {
      if (t[i].text === value) {
        return t;
      }
      const newChunk = {
        ...t[i],
        text: value,
      };

      return [...t.slice(0, i), newChunk, ...t.slice(i + 1)];
    });
  };

  const onSpeakerChange = (i, value) => {
    setTranscripts((t) => {
      if (t[i].speaker === value) return t;

      const newChunk = {
        ...t[i],
        speaker: value,
      };

      return [...t.slice(0, i), newChunk, ...t.slice(i + 1)];
    });
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        height: '80%',
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
  );
}
