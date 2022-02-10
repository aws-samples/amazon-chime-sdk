// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
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
  ManageChannelFlowModal,
  SetCustomStatusModal,
} from '../../components/ChannelModals';

const ModalManager = ({
  modal,
  setModal,
  activeChannel,
  meetingInfo,
  userId,
  onAddMember,
  onManageChannelFlow,
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
  activeChannelFlow,
  setCustomStatus,
}) => {
  if (!modal) {
    return null;
  }

  switch (modal) {
    case 'AddMembers':
      return (
        <AddMemberModal
          onClose={() => setModal('')}
          channel={activeChannel}
          onSubmit={onAddMember}
          handlePickerChange={handlePickerChange}
          members={activeChannelMemberships}
        />
      );
    case 'ManageMembers':
      return (
        <ManageMembersModal
          onClose={() => setModal('')}
          channel={activeChannel}
          userId={userId}
          handleDeleteMemberships={handleDeleteMemberships}
          handlePickerChange={handlePickerChange}
          members={formatMemberships(activeChannelMemberships)}
          selectedMembers={selectedMembers}
        />
      );
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
          channel={activeChannel}
          moderators={activeChannelModerators}
          channelFlow={activeChannelFlow}
        />
      );
    case 'LeaveChannel':
      return (
        <LeaveChannelModal
          onClose={() => setModal('')}
          handleLeaveChannel={handleLeaveChannel}
          channel={activeChannel}
        />
      );
    case 'ViewMembers':
      return (
        <ViewMembersModal
          onClose={() => setModal('')}
          channel={activeChannel}
          members={activeChannelMemberships}
          moderators={activeChannelModerators}
        />
      );
    case 'ManageChannelFlow':
      return (
        <ManageChannelFlowModal
          onClose={() => setModal('')}
          channel={activeChannel}
          handlePickerChange={handlePickerChange}
          onSubmit={onManageChannelFlow}
          channelFlow={activeChannelFlow}
        />
      );  
    case 'EditChannel':
      return (
        <EditChannelModal
          onClose={() => setModal('')}
          channel={activeChannel}
          userId={userId}
        />
      );
    case 'Ban':
      return (
        <BanModal
          onClose={() => setModal('')}
          handlePickerChange={handlePickerChange}
          channel={activeChannel}
          members={activeChannelMemberships}
          moderators={activeChannelModerators}
          banList={banList}
          banUser={banUser}
          unbanUser={unbanUser}
        />
      );
    case 'DeleteChannel':
      return (
        <DeleteChannelModal
          onClose={() => setModal('')}
          channel={activeChannel}
          handleChannelDeletion={handleChannelDeletion}
        />
      );
    case 'CustomStatus':
      return (
          <SetCustomStatusModal
              onClose={() => setModal('')}
              setCustomStatus={setCustomStatus}
          />
      );
    case 'JoinMeeting':
      return (
        <JoinMeetingModal
          onClose={() => setModal('')}
          meetingInfo={meetingInfo}
          handleJoinMeeting={handleJoinMeeting}
          handleMessageAll={handleMessageAll}
        />
      );
    default:
      console.log('Unknown modal type called');
      return null;
  }
};

export default ModalManager;
