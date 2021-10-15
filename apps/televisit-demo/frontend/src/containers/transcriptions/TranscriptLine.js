import React, { useMemo } from 'react'
import s from './TranscriptLine.module.css'
import cs from 'clsx'

import classMap from './transcriptHighlights'
import { Editable, EditablePreview, EditableInput, Box } from '@chakra-ui/react'

// Reduces results down to a single set of non-overlapping ranges, each with a list of applicable results
function combineSegments (results) {
  const markers = []

  const addMarker = (where) => {
    if (!markers.includes(where)) markers.push(where)
  }

  results.forEach((r) => {
    addMarker(r.BeginOffset)
    addMarker(r.EndOffset);

    (r.Attributes || []).forEach((a) => {
      addMarker(a.BeginOffset)
      addMarker(a.EndOffset)
    })
  })

  markers.sort((a, b) => a - b)

  const ret = []

  for (let i = 0; i < markers.length - 1; i++) {
    const start = markers[i]
    const end = markers[i + 1]

    const matches = results.filter(
      (r) =>
        (r.BeginOffset <= start && r.EndOffset >= end) ||
        (r.Attributes || []).some((a) => a.BeginOffset <= start && a.EndOffset >= end)
    )

    if (matches.length) ret.push({ start, end, matches })
  }

  return ret
}

// Takes text and a list of segments and returns an array of { text, matches } segments,
// with applicable text and array of matching results for that segment
function applySegmentsToWords (text, segments) {
  const ranges = []

  let last = 0

  segments.forEach(({ start, end, matches }) => {
    if (start > last) {
      ranges.push({
        text: text.slice(last, start),
        matches: []
      })
    }

    ranges.push({
      text: text.slice(start, end),
      matches
    })

    last = end
  })

  if (last < text.length) {
    ranges.push({
      text: text.slice(last),
      matches: []
    })
  }

  return ranges
}

export default function TranscriptLine ({
  // The specific transcript chunk for this line
  chunk,

  // Comprehend results filtered to just this line
  results,

  // List of enabled categories to highlight
  enabledCategories,

  enableEditing,

  handleTranscriptChange,
  onSpeakerChange
}) {
  const filteredResults = useMemo(() => results.filter((r) => enabledCategories.includes(r.Category)), [
    results,
    enabledCategories
  ])
  const sortedResults = useMemo(() => filteredResults.sort((a, b) => a.BeginOffset - b.BeginOffset), [filteredResults])
  const splitSegments = useMemo(() => combineSegments(sortedResults), [sortedResults])
  const ranges = useMemo(() => applySegmentsToWords(chunk.text, splitSegments), [chunk, splitSegments])

  return (
    <React.Fragment>
      {enableEditing && (
        <Box mb={8}>
          {chunk.speaker && (
            <Editable defaultValue={chunk.speaker} onSubmit={(nextSpeaker) => onSpeakerChange(nextSpeaker.trim())}>
              <EditablePreview width='100%' />
              <EditableInput />
            </Editable>
          )}

          <Editable
            defaultValue={chunk.text}
            onSubmit={(nextTranscriptLine) => handleTranscriptChange(nextTranscriptLine.trim())}
          >
            {({ isEditing, onEdit }) => (
              <>
                <EditableInput />

                {!isEditing && (
                  <p className={s.base} onClick={onEdit}>
                    {ranges.map((r, i) => (
                      <span key={i} className={cs(r.matches.map((x) => classMap[x.Category]))}>
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
        <Box as='p' className={s.base} mb={8}>
          {chunk.speaker && <span>{chunk.speaker}: </span>}

          {ranges.map((r, i) => (
            <span key={i} className={cs(r.matches.map((x) => classMap[x.Category]))}>
              {r.text}
            </span>
          ))}
        </Box>
      )}
    </React.Fragment>
  )
}
