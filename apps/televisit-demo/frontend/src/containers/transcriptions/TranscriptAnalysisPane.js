import React, { useRef, useEffect, useState } from 'react';
import TranscriptPane from './TranscriptPane';
import AnalysisPane from './AnalysisPane';
import useComprehension from './useComprehension';
import generateSOAPSummary from './soapSummary';
import SOAPReviewPane from './SOAPReviewPane';

import { Heading, Grid, Cell } from 'amazon-chime-sdk-component-library-react';
import { useTheme } from 'styled-components';

export default function TranscriptAnalysisPane({
  transcriptChunks,
  partialTranscript,
  inProgress,
  enableEditing,
}) {
  const currentTheme = useTheme();
  const [comprehendResults, setComprehendResults] = useComprehension(
    transcriptChunks || []
  );
  const [comprehendCustomEntities, setComprehendCustomEntities] = useState([]);
  const [soapSummary, setSOAPSummary] = useState(() =>
    generateSOAPSummary([].concat(...comprehendResults))
  );

  useEffect(() => {
    setSOAPSummary(
      generateSOAPSummary(
        [].concat(...[...comprehendResults, ...comprehendCustomEntities])
      )
    );
  }, [comprehendResults, comprehendCustomEntities]);

  function updateSOAPSummary(e) {
    setSOAPSummary(e.target.value);
  }

  const onComprehendResultDelete = (r) => {
    r.isCustomEntity
      ? setComprehendCustomEntities((prevEntities) =>
          prevEntities.map((prevEntity) => {
            const index = prevEntity.findIndex((entity) => entity.id === r.id);

            if (index === -1) return prevEntity;

            return [
              ...prevEntity.slice(0, index),
              ...prevEntity.slice(index + 1),
            ];
          })
        )
      : setComprehendResults((prevResults) =>
          prevResults.map((prevResult) => {
            const index = prevResult.findIndex((result) => result.id === r.id);

            if (index === -1) return prevResult;

            return [
              ...prevResult.slice(0, index),
              ...prevResult.slice(index + 1),
            ];
          })
        );
  };

  const onComprehendResultAddition = (val, category) => {
    setComprehendCustomEntities((prevEntities) => {
      const newCustomEntity = {
        id: uuidv4(),
        Category: category,
        Text: val,
        Traits: [],
        Attributes: [],
        Type: '',
        isCustomEntity: true,
      };
      return [[newCustomEntity], ...prevEntities];
    });
  };

  const onSelectedConceptChange = (id, selectedConceptCode) => {
    setComprehendResults((prevResults) =>
      prevResults.map((prevResult) => {
        const index = prevResult.findIndex((result) => result.id === id);

        if (index === -1) return prevResult;

        const newEntity = {
          ...prevResult[index],
          selectedConceptCode,
        };
        return [
          ...prevResult.slice(0, index),
          newEntity,
          ...prevResult.slice(index + 1),
        ];
      })
    );
  };

  return (
    <Grid
      gridTemplateRows="1fr 1fr 1fr"
      gridTemplateColumns="1fr 1fr"
      gridGap="5px"
      style={{ width: '40vw', height: '100vh' }}
      gridTemplateAreas='"analysis analysis" "soap transcription" "soap transcription"'
    >
      <Cell
        gridArea="analysis"
        style={{ overflowX: 'auto', overflowY: 'auto' }}
      >
        <Heading
          level={6}
          style={{
            backgroundColor: currentTheme.colors.greys.grey80,
            height: '2rem',
            textAlign: 'center',
            fontWeight: 'bold',
            color: 'white',
          }}
          className="app-heading"
        >
          Named Entities Analysis
        </Heading>
        <AnalysisPane
          resultChunks={[...comprehendCustomEntities, ...comprehendResults]}
          onResultDelete={onComprehendResultDelete}
          onResultAdd={onComprehendResultAddition}
          onSelectedConceptChange={onSelectedConceptChange}
        />
      </Cell>
      <Cell
        gridArea="transcription"
        style={{ overflowX: 'auto', overflowY: 'auto' }}
      >
        <Heading
          level={6}
          style={{
            backgroundColor: currentTheme.colors.greys.grey80,
            height: '2rem',
            textAlign: 'center',
            fontWeight: 'bold',
            color: 'white',
          }}
          className="app-heading"
        >
          Live Transcription
        </Heading>
        <TranscriptPane
          transcriptChunks={transcriptChunks}
          resultChunks={comprehendResults}
          partialTranscript={partialTranscript}
          inProgress={inProgress}
          enableEditing={enableEditing}
        />
      </Cell>
      <Cell gridArea="soap" style={{ overflowX: 'auto', overflowY: 'auto' }}>
        <Heading
          level={6}
          style={{
            backgroundColor: currentTheme.colors.greys.grey80,
            height: '2rem',
            textAlign: 'center',
            fontWeight: 'bold',
            color: 'white',
          }}
          className="app-heading"
        >
          SOAP Notes
        </Heading>
        <SOAPReviewPane
          onInputChange={updateSOAPSummary}
          inputText={soapSummary}
        />
      </Cell>
    </Grid>
  );
}
