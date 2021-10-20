// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import React from "react";
import { Heading, Grid, Cell } from "amazon-chime-sdk-component-library-react";
import { useTheme } from "styled-components";

function LiveTranscription(props) {
  const currentTheme = useTheme();
  const transcriptSegmentArray = Array.from(props.transcriptSegments.values());
=======
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
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  transcriptSegmentArray.sort((a, b) => b.startTimeMs - a.startTimeMs);
  return (
    <Grid
      gridTemplateRows="3rem 101%"
<<<<<<< HEAD
      style={{ width: "20vw", height: "100vh" }}
=======
      style={{ width: '20vw', height: '100vh' }}
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
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
<<<<<<< HEAD
            height: "3rem",
            marginTop: "1rem",
            textAlign: "center",
            fontWeight: "bold",
            color: "white",
=======
            height: '3rem',
            marginTop: '1rem',
            textAlign: 'center', 
            fontWeight: 'bold',
            color: 'white',
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
          }}
          className="app-heading"
        >
          Live Transcription
        </Heading>
      </Cell>
<<<<<<< HEAD
      <Cell gridArea="main" style={{ height: "calc(100vh - 3rem)" }}>
        <div
          style={{
            backgroundColor: currentTheme.colors.greys.grey10,
            height: "100%",
=======
      <Cell 
        gridArea="main" 
        style={{ height: 'calc(100vh - 3rem)' }}
      >
        <div
          style={{
            backgroundColor: currentTheme.colors.greys.grey10,
            height: '100%',
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
            borderRight: `solid 1px ${currentTheme.colors.greys.grey30}`,
          }}
        >
          <ul>
<<<<<<< HEAD
            {transcriptSegmentArray.map((segment, index) => {
              return (
                <li key={index}>
                  <div className="transcript">
                    <span className="transcript-speaker">
                      {segment.attendee.externalUserId.split("#").slice(-1)[0] +
                        ": "}
                    </span>
                    <span className="transcript-content'">
                      {segment.content}
                    </span>
                    <ul>
                      {segment.entities.map((entity, ind) => {
                        if (entity.category == "ANATOMY") {
                          return (
                            <li key={ind}>
                              <span style={{ color: "green" }}>
                                <b>{entity.text}</b> [score: {entity.score}]
                              </span>
                            </li>
                          );
                        } else if (entity.category == "MEDICAL_CONDITION") {
                          return (
                            <li key={ind}>
                              <span style={{ color: "blue" }}>
                                <b>{entity.text}</b> [score: {entity.score}]
                              </span>
                            </li>
                          );
                        } else if (entity.category == "MEDICATION") {
                          return (
                            <li key={ind}>
                              <span style={{ color: "purple" }}>
                                <b>{entity.text}</b> [score: {entity.score}]
                              </span>
                            </li>
                          );
                        } else if (
                          entity.category == "TEST_TREATMENT_PROCEDURE"
                        ) {
                          return (
                            <li key={ind}>
                              <span style={{ color: "red" }}>
                                <b>{entity.text}</b> [score: {entity.score}]
                              </span>
                            </li>
                          );
                        }
                      })}
                    </ul>
                  </div>
                </li>
              );
            })}
=======
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
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
          </ul>
        </div>
      </Cell>
    </Grid>
  );
<<<<<<< HEAD
}

export default LiveTranscription;
=======
};

export default LiveTranscription;
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
