// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
=======
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
import {
  PrimaryButton,
  Flex,
  Label,
  useMeetingManager,
  Modal,
  ModalBody,
<<<<<<< HEAD
  ModalHeader,
} from "amazon-chime-sdk-component-library-react";

import routes from "../constants/routes";
import Card from "../components/Card";
import { useAppState } from "../providers/AppStateProvider";
=======
  ModalHeader
} from 'amazon-chime-sdk-component-library-react';

import routes from '../constants/routes';
import Card from '../components/Card';
import { useAppState } from '../providers/AppStateProvider';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

const MeetingJoinDetails = () => {
  const meetingManager = useMeetingManager();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
<<<<<<< HEAD
  const [error, setError] = useState("");
=======
  const [error, setError] = useState('');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  const { meetingId, localUserName } = useAppState();

  const handleJoinMeeting = async () => {
    setIsLoading(true);

    try {
      await meetingManager.start();
      setIsLoading(false);
      history.push(`${routes.MEETING}/${meetingId}`);
    } catch (error) {
      setIsLoading(false);
      setError("start meeting manager error");
    }
  };

  return (
    <>
      <Flex container alignItems="center" flexDirection="column">
        <PrimaryButton
<<<<<<< HEAD
          label={isLoading ? "Loading..." : "Join meeting"}
          onClick={handleJoinMeeting}
        />
        <Label style={{ margin: ".75rem 0 0 0" }}>
=======
          label={isLoading ? 'Loading...' : 'Join meeting'}
          onClick={handleJoinMeeting}
        />
        <Label style={{ margin: '.75rem 0 0 0' }}>
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
          Joining meeting <b>{meetingId}</b> as <b>{localUserName}</b>
        </Label>
      </Flex>
      {error && (
<<<<<<< HEAD
        <Modal size="md" onClose={(): void => setError("")}>
=======
        <Modal size="md" onClose={(): void => setError('')}>
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
          <ModalHeader title={`Meeting ID: ${meetingId}`} />
          <ModalBody>
            <Card
              title="Unable to join meeting"
              description="There was an issue in joining this meeting. Check your connectivity and try again."
              smallText={error}
            />
          </ModalBody>
        </Modal>
      )}
    </>
  );
};

export default MeetingJoinDetails;
