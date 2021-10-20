/* eslint-disable no-console */
// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import React from "react";
=======
import React from 'react';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalButtonGroup,
  ModalButton,
<<<<<<< HEAD
} from "amazon-chime-sdk-component-library-react";

import "./ChannelModals.css";
=======
} from 'amazon-chime-sdk-component-library-react';

import './ChannelModals.css';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

export const ViewChannelDetailsModal = ({ onClose, channel, moderators }) => {
  const modNames = moderators.map((m) => (
    <div key={m.Moderator.Arn}>{m.Moderator.Name}</div>
  ));
  return (
    <Modal onClose={onClose} className="view-details">
      <ModalHeader title="Channel Details" />
      <ModalBody>
        <div className="container">
          <div className="row">
            <div className="key">Channel Name</div>
            <div className="value">{channel.Name}</div>
          </div>

          {moderators.length > 0 ? (
            <div className="row">
              <div className="key">Moderators</div>
              <div className="value">{modNames}</div>
            </div>
          ) : null}

          <div className="row">
            <div className="key">Type</div>
            <div className="value">
<<<<<<< HEAD
              {channel.Privacy === "PRIVATE" && (
=======
              {channel.Privacy === 'PRIVATE' && (
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
                <span>
                  <span className="main">Private</span>
                  <span className="detail">
                    (non-members can read and send messages)
                  </span>
                </span>
              )}
<<<<<<< HEAD
              {channel.Privacy === "PUBLIC" && (
=======
              {channel.Privacy === 'PUBLIC' && (
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
                <span>
                  <span className="main">Public</span>
                  <span className="detail">
                    (only members can read and send messages)
                  </span>
                </span>
              )}
            </div>
          </div>

          <div className="row">
            <div className="key">Mode</div>
            <div className="value">
<<<<<<< HEAD
              {channel.Mode === "RESTRICTED" && (
=======
              {channel.Mode === 'RESTRICTED' && (
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
                <span>
                  <span className="main">Restricted</span>
                  <span className="detail">
                    (administrators and moderators can add members)
                  </span>
                </span>
              )}
<<<<<<< HEAD
              {channel.Mode === "UNRESTRICTED" && (
=======
              {channel.Mode === 'UNRESTRICTED' && (
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
                <span>
                  <span className="main">Unrestricted</span>
                  <span className="detail">
                    (any member can add other members)
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalButtonGroup
        primaryButtons={[
          <ModalButton label="OK" variant="primary" closesModal />,
        ]}
      />
    </Modal>
  );
};

export default ViewChannelDetailsModal;
