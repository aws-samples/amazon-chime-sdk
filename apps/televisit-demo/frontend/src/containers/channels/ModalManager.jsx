// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import React from "react";
=======
import React from 'react';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
import {
  AddMemberModal,
  ManageMembersModal,
  DeleteChannelModal,
  NewChannelModal,
  LeaveChannelModal,
  ViewChannelDetailsModal,
  ViewMembersModal,
  EditChannelModal,
  BanModal,
  JoinMeetingModal,
<<<<<<< HEAD
} from "../../components/ChannelModals";
=======
} from '../../components/ChannelModals';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

const ModalManager = ({
  modal,
  setModal,
  activeChannel,
  meetingInfo,
  userId,
  onAddMember,
  handleChannelDeletion,
  handleJoinMeeting,
  handleMessageAll,
  handleDeleteMemberships,
  handlePickerChange,
  formatMemberships,
  activeChannelMemberships,
  selectedMembers,
  onCreateChannel,
  activeChannelModerators,
  handleLeaveChannel,
  banList,
  banUser,
  unbanUser,
}) => {
  if (!modal) {
    return null;
  }

  switch (modal) {
<<<<<<< HEAD
    case "AddMembers":
      return (
        <AddMemberModal
          onClose={() => setModal("")}
=======
    case 'AddMembers':
      return (
        <AddMemberModal
          onClose={() => setModal('')}
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
          channel={activeChannel}
          onSubmit={onAddMember}
          handlePickerChange={handlePickerChange}
          members={activeChannelMemberships}
        />
      );
<<<<<<< HEAD
    case "ManageMembers":
      return (
        <ManageMembersModal
          onClose={() => setModal("")}
=======
    case 'ManageMembers':
      return (
        <ManageMembersModal
          onClose={() => setModal('')}
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
          channel={activeChannel}
          userId={userId}
          handleDeleteMemberships={handleDeleteMemberships}
          handlePickerChange={handlePickerChange}
          members={formatMemberships(activeChannelMemberships)}
          selectedMembers={selectedMembers}
        />
      );
<<<<<<< HEAD
    case "NewChannel":
      return (
        <NewChannelModal
          onClose={() => setModal("")}
          onCreateChannel={onCreateChannel}
        />
      );
    case "ViewDetails":
      return (
        <ViewChannelDetailsModal
          onClose={() => setModal("")}
=======
    case 'NewChannel':
      return (
        <NewChannelModal
          onClose={() => setModal('')}
          onCreateChannel={onCreateChannel}
        />
      );
    case 'ViewDetails':
      return (
        <ViewChannelDetailsModal
          onClose={() => setModal('')}
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
          channel={activeChannel}
          moderators={activeChannelModerators}
        />
      );
<<<<<<< HEAD
    case "LeaveChannel":
      return (
        <LeaveChannelModal
          onClose={() => setModal("")}
=======
    case 'LeaveChannel':
      return (
        <LeaveChannelModal
          onClose={() => setModal('')}
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
          handleLeaveChannel={handleLeaveChannel}
          channel={activeChannel}
        />
      );
<<<<<<< HEAD
    case "ViewMembers":
      return (
        <ViewMembersModal
          onClose={() => setModal("")}
=======
    case 'ViewMembers':
      return (
        <ViewMembersModal
          onClose={() => setModal('')}
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
          channel={activeChannel}
          members={activeChannelMemberships}
          moderators={activeChannelModerators}
        />
      );
<<<<<<< HEAD
    case "EditChannel":
      return (
        <EditChannelModal
          onClose={() => setModal("")}
=======
    case 'EditChannel':
      return (
        <EditChannelModal
          onClose={() => setModal('')}
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
          channel={activeChannel}
          userId={userId}
        />
      );
<<<<<<< HEAD
    case "Ban":
      return (
        <BanModal
          onClose={() => setModal("")}
=======
    case 'Ban':
      return (
        <BanModal
          onClose={() => setModal('')}
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
          handlePickerChange={handlePickerChange}
          channel={activeChannel}
          members={activeChannelMemberships}
          moderators={activeChannelModerators}
          banList={banList}
          banUser={banUser}
          unbanUser={unbanUser}
        />
      );
<<<<<<< HEAD
    case "DeleteChannel":
      return (
        <DeleteChannelModal
          onClose={() => setModal("")}
=======
    case 'DeleteChannel':
      return (
        <DeleteChannelModal
          onClose={() => setModal('')}
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
          channel={activeChannel}
          handleChannelDeletion={handleChannelDeletion}
        />
      );
<<<<<<< HEAD
    case "JoinMeeting":
      return (
        <JoinMeetingModal
          onClose={() => setModal("")}
=======
    case 'JoinMeeting':
      return (
        <JoinMeetingModal
          onClose={() => setModal('')}
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
          meetingInfo={meetingInfo}
          handleJoinMeeting={handleJoinMeeting}
          handleMessageAll={handleMessageAll}
        />
      );
    default:
<<<<<<< HEAD
      console.log("Unknown modal type called");
=======
      console.log('Unknown modal type called');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
      return null;
  }
};

export default ModalManager;
