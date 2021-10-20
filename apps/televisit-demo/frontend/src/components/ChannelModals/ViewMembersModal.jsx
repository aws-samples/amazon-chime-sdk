/* eslint-disable import/no-unresolved */
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

export const ViewMembersModal = ({ onClose, channel, members, moderators }) => {
  const modArns = moderators.map((m) => m.Moderator.Arn);

  const channelMembers = members.map((m) => {
    if (modArns.indexOf(m.Member.Arn) >= 0) {
<<<<<<< HEAD
      return { name: m.Member.Name, role: "Moderator", arn: m.Member.Arn };
    }
    return { name: m.Member.Name, role: "Member", arn: m.Member.Arn };
=======
      return { name: m.Member.Name, role: 'Moderator', arn: m.Member.Arn };
    }
    return { name: m.Member.Name, role: 'Member', arn: m.Member.Arn };
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  });

  const sortedMembers = channelMembers.sort((a, b) =>
    a.role.length > b.role.length ? -1 : 1
  );

  const memberListItems = sortedMembers.map((m) => (
    <li key={m.arn} className="row">
      <div className="name">{m.name}</div>
      <div className="role">{m.role}</div>
    </li>
  ));

  return (
    <Modal onClose={onClose} className="view-members">
      <ModalHeader title={`${channel.Name} members`} className="modal-header" />
      <ModalBody className="main-section">
        <ul className="list">
          <li className="list-header row">
            <div className="name">Name</div>
            <div className="role">Role</div>
          </li>
          {memberListItems}
        </ul>
      </ModalBody>
      <ModalButtonGroup
        primaryButtons={[
          <ModalButton label="OK" variant="primary" closesModal />,
        ]}
      />
    </Modal>
  );
};

export default ViewMembersModal;
