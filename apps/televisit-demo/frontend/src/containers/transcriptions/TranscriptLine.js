<<<<<<< HEAD
import React, { useMemo } from "react";
import s from "./TranscriptLine.module.css";
import cs from "clsx";

import classMap from "./transcriptHighlights";
import {
  Editable,
  EditablePreview,
  EditableInput,
  Box,
} from "@chakra-ui/react";

// Reduces results down to a single set of non-overlapping ranges, each with a list of applicable results
function combineSegments(results) {
=======
import React, { useMemo } from 'react';
import s from './TranscriptLine.module.css';
import cs from 'clsx';

import classMap from './transcriptHighlights';
import { Editable, EditablePreview, EditableInput, Box } from '@chakra-ui/react';

// Reduces results down to a single set of non-overlapping ranges, each with a list of applicable results
function combineSegments (results) {
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  const markers = [];

  const addMarker = (where) => {
    if (!markers.includes(where)) markers.push(where);
  };

  results.forEach((r) => {
    addMarker(r.BeginOffset);
    addMarker(r.EndOffset);

    (r.Attributes || []).forEach((a) => {
      addMarker(a.BeginOffset);
      addMarker(a.EndOffset);
    });
  });

  markers.sort((a, b) => a - b);

  const ret = [];

  for (let i = 0; i < markers.length - 1; i++) {
    const start = markers[i];
    const end = markers[i + 1];

    const matches = results.filter(
      (r) =>
        (r.BeginOffset <= start && r.EndOffset >= end) ||
<<<<<<< HEAD
        (r.Attributes || []).some(
          (a) => a.BeginOffset <= start && a.EndOffset >= end
        )
=======
        (r.Attributes || []).some((a) => a.BeginOffset <= start && a.EndOffset >= end)
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    );

    if (matches.length) ret.push({ start, end, matches });
  }

  return ret;
}

// Takes text and a list of segments and returns an array of { text, matches } segments,
// with applicable text and array of matching results for that segment
<<<<<<< HEAD
function applySegmentsToWords(text, segments) {
=======
function applySegmentsToWords (text, segments) {
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  const ranges = [];

  let last = 0;

  segments.forEach(({ start, end, matches }) => {
    if (start > last) {
      ranges.push({
        text: text.slice(last, start),
<<<<<<< HEAD
        matches: [],
=======
        matches: []
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
      });
    }

    ranges.push({
      text: text.slice(start, end),
<<<<<<< HEAD
      matches,
=======
      matches
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    });

    last = end;
  });

  if (last < text.length) {
    ranges.push({
      text: text.slice(last),
<<<<<<< HEAD
      matches: [],
=======
      matches: []
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    });
  }

  return ranges;
}

<<<<<<< HEAD
export default function TranscriptLine({
=======
export default function TranscriptLine ({
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  // The specific transcript chunk for this line
  chunk,

  // Comprehend results filtered to just this line
  results,

  // List of enabled categories to highlight
  enabledCategories,

  enableEditing,

  handleTranscriptChange,
<<<<<<< HEAD
  onSpeakerChange,
}) {
  const filteredResults = useMemo(
    () => results.filter((r) => enabledCategories.includes(r.Category)),
    [results, enabledCategories]
  );
  const sortedResults = useMemo(
    () => filteredResults.sort((a, b) => a.BeginOffset - b.BeginOffset),
    [filteredResults]
  );
  const splitSegments = useMemo(
    () => combineSegments(sortedResults),
    [sortedResults]
  );
  const ranges = useMemo(
    () => applySegmentsToWords(chunk.text, splitSegments),
    [chunk, splitSegments]
  );
=======
  onSpeakerChange
}) {
  const filteredResults = useMemo(() => results.filter((r) => enabledCategories.includes(r.Category)), [
    results,
    enabledCategories
  ]);
  const sortedResults = useMemo(() => filteredResults.sort((a, b) => a.BeginOffset - b.BeginOffset), [filteredResults]);
  const splitSegments = useMemo(() => combineSegments(sortedResults), [sortedResults]);
  const ranges = useMemo(() => applySegmentsToWords(chunk.text, splitSegments), [chunk, splitSegments]);
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

  return (
    <React.Fragment>
      {enableEditing && (
        <Box mb={8}>
          {chunk.speaker && (
<<<<<<< HEAD
            <Editable
              defaultValue={chunk.speaker}
              onSubmit={(nextSpeaker) => onSpeakerChange(nextSpeaker.trim())}
            >
              <EditablePreview width="100%" />
=======
            <Editable defaultValue={chunk.speaker} onSubmit={(nextSpeaker) => onSpeakerChange(nextSpeaker.trim())}>
              <EditablePreview width='100%' />
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
              <EditableInput />
            </Editable>
          )}

          <Editable
            defaultValue={chunk.text}
<<<<<<< HEAD
            onSubmit={(nextTranscriptLine) =>
              handleTranscriptChange(nextTranscriptLine.trim())
            }
=======
            onSubmit={(nextTranscriptLine) => handleTranscriptChange(nextTranscriptLine.trim())}
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
          >
            {({ isEditing, onEdit }) => (
              <>
                <EditableInput />

                {!isEditing && (
                  <p className={s.base} onClick={onEdit}>
                    {ranges.map((r, i) => (
<<<<<<< HEAD
                      <span
                        key={i}
                        className={cs(
                          r.matches.map((x) => classMap[x.Category])
                        )}
                      >
=======
                      <span key={i} className={cs(r.matches.map((x) => classMap[x.Category]))}>
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
                        {r.text}
                      </span>
                    ))}
                  </p>
                )}
              </>
            )}
          </Editable>
        </Box>
      )}

      {!enableEditing && (
<<<<<<< HEAD
        <Box as="p" className={s.base} mb={8}>
          {chunk.speaker && <span>{chunk.speaker}: </span>}

          {ranges.map((r, i) => (
            <span
              key={i}
              className={cs(r.matches.map((x) => classMap[x.Category]))}
            >
=======
        <Box as='p' className={s.base} mb={8}>
          {chunk.speaker && <span>{chunk.speaker}: </span>}

          {ranges.map((r, i) => (
            <span key={i} className={cs(r.matches.map((x) => classMap[x.Category]))}>
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
              {r.text}
            </span>
          ))}
        </Box>
      )}
    </React.Fragment>
  );
}
