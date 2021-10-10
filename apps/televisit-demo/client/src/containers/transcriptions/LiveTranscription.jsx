// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {
  Heading,
  Grid,
  Cell,
} from 'amazon-chime-sdk-component-library-react';
import { useTheme } from 'styled-components';

function LiveTranscription(props){
  const currentTheme = useTheme();
  const transcriptSegmentArray = Array.from( props.transcriptSegments.values() );
  transcriptSegmentArray.sort((a, b) => b.startTimeMs - a.startTimeMs);
  return (
    <Grid
      gridTemplateRows="3rem 101%"
      style={{ width: '20vw', height: '100vh' }}
      gridTemplateAreas='
        "heading"
        "main"      
      '
    >
      <Cell gridArea="heading">
        <Heading
          level={6}
          style={{
            backgroundColor: currentTheme.colors.greys.grey60,
            height: '3rem',
            marginTop: '1rem',
            textAlign: 'center', 
            fontWeight: 'bold',
            color: 'white',
          }}
          className="app-heading"
        >
          Live Transcription
        </Heading>
      </Cell>
      <Cell 
        gridArea="main" 
        style={{ height: 'calc(100vh - 3rem)' }}
      >
        <div
          style={{
            backgroundColor: currentTheme.colors.greys.grey10,
            height: '100%',
            borderRight: `solid 1px ${currentTheme.colors.greys.grey30}`,
          }}
        >
          <ul>
            {
              transcriptSegmentArray.map((segment, index) => {
                return (
                  <li key={index}>
                    <div className="transcript">
                      <span className="transcript-speaker">{segment.attendee.externalUserId.split('#').slice(-1)[0] + ': '}</span>
                      <span className="transcript-content'">{segment.content}</span>
                      <ul> 
                        {
                          segment.entities.map((entity, ind) => {
                            if (entity.category=='ANATOMY') {
                              return (
                                <li key={ind}>
                                  <span style={{ color:'green' }}><b>{entity.text}</b> [score: {entity.score}]</span>
                                </li>
                              );
                            } else if (entity.category=='MEDICAL_CONDITION') {
                              return (
                                <li key={ind}>
                                  <span style={{ color:'blue' }}><b>{entity.text}</b> [score: {entity.score}]</span>
                                </li>
                              );
                            } else if (entity.category=='MEDICATION') {
                              return (
                                <li key={ind}>
                                  <span style={{ color:'purple' }}><b>{entity.text}</b> [score: {entity.score}]</span>
                                </li>
                              );
                            } else if (entity.category=='TEST_TREATMENT_PROCEDURE') {
                              return (
                                <li key={ind}>
                                  <span style={{ color:'red' }}><b>{entity.text}</b> [score: {entity.score}]</span>
                                </li>
                              );
                            }
                          })
                        }
                      </ul>
                    </div>
                  </li>
                )
              })
            }
          </ul>
        </div>
      </Cell>
    </Grid>
  );
};

export default LiveTranscription;