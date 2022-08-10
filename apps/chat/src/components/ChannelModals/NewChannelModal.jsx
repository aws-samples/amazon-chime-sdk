// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useEffect, useState } from 'react';

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalButtonGroup,
  ModalButton,
  Input,
  Label,
  RadioGroup,
  PrimaryButton,
  useNotificationDispatch,
} from 'amazon-chime-sdk-component-library-react';

import './NewChannelModal.css';
import { useAuthContext } from '../../providers/AuthProvider';

export const NewChannelModal = ({ onClose, onCreateChannel }) => {
  const [name, setName] = useState('');
  const [privacy, setPrivacy] = useState('PRIVATE');
  const [pushNotifications, setPushNotifications] = useState('OFF');
  const [mode, setMode] = useState('RESTRICTED');
  const [channelType, setChannelType] = useState('STANDARD');
  const [maximumSubChannels, setMaximumSubChannels] = useState(2);
  const minMaximumSubChannels = '2';
  const minTargetMembershipsPerSubChannel = '2';
  const maxTargetMembershipsPerSubChannel = '1000';
  const [
    targetMembershipsPerSubChannel,
    setTargetMembershipsPerSubChannel,
  ] = useState(4);
  const [minimumMembershipPercentage, setScaleInMinimumMemberships] = useState(
    40
  );
  const [userName, setUserName] = useState('');
  const { member } = useAuthContext();

  const onNameChange = (e) => {
    setName(e.target.value);
  };

  const onPrivacyChange = (e) => {
    setPrivacy(e.target.value);
    if(e.target.value == 'PUBLIC'){
      setMode('RESTRICTED');
    }
  };

  const onPushNotificationsChange = (e) => {
    setPushNotifications(e.target.value);
  };

  const onModeChange = (e) => {
    setMode(e.target.value);
  };

  const onChannelTypeChange = (e) => {
    setChannelType(e.target.value);
    if(e.target.value == 'ELASTIC'){
      setMode('RESTRICTED');
    }
  };

  const onMaximumSubChannelsChange = (e) => {
    setMaximumSubChannels(e.target.value);
  };
  const onScaleInMinimumMembershipsChange = (e) => {
    setScaleInMinimumMemberships(e.target.value);
  };

  const onTargetMembershipsPerSubChannelChange = (e) => {
    setTargetMembershipsPerSubChannel(e.target.value);
  };

  const onTestChannel = (
    e,
    name,
    mode,
    privacy,
    maximumSubChannels,
    targetMembershipsPerSubChannel,
    minimumMembershipPercentage
  ) => {
    if (channelType !== 'ELASTIC') {
      console.log('create standard channel');
      onCreateChannel(e, name, mode, privacy, null);
    } else {
      console.log('create elastic channel');
      onCreateChannel(
        e,
        name,
        mode,
        privacy,
        getElasticChannelConfig(
          maximumSubChannels,
          targetMembershipsPerSubChannel,
          minimumMembershipPercentage
        )
      );
    }
  };

  const getElasticChannelConfig = (
    maximumSubChannels,
    targetMembershipsPerSubChannel,
    minimumMembershipPercentage
  ) => {
    return {
      MaximumSubChannels: maximumSubChannels,
      TargetMembershipsPerSubChannel: targetMembershipsPerSubChannel,
      MinimumMembershipPercentage: minimumMembershipPercentage,
    };
  };

  return (
    <Modal size="lg" onClose={onClose}>
      <ModalHeader title="Add channel" />
      <ModalBody>
        <form
          onSubmit={(e) =>
            onTestChannel(
              e,
              name,
              mode,
              privacy,
              maximumSubChannels,
              targetMembershipsPerSubChannel,
              minimumMembershipPercentage
            )
          }
          id="new-channel-form"
        >
          <div className="ch-form-field-input">
            <Label className="lbl">Channel name</Label>
            <Input
              className="value"
              showClear={false}
              type="text"
              value={name}
              onChange={(e) => onNameChange(e)}
            />
          </div>
          <div className="ch-form-field-input">
            <Label className="lbl">Moderator</Label>
            <Label className="value">{member.username}</Label>
          </div>
          <div className="ch-form-field-input">
            <Label className="lbl">Privacy (cannot be changed)</Label>
            <div className="value ch-type-options">
              <RadioGroup
                options={[
                  { value: 'PRIVATE', label: 'Private' },
                  { value: 'PUBLIC', label: 'Public' },
                ]}
                value={privacy}
                onChange={(e) => onPrivacyChange(e)}
              />
            </div>
          </div>
          {privacy !== 'PUBLIC' && channelType === 'STANDARD' && (
            <div className="ch-form-field-input">
              <Label className="lbl">Mode</Label>
              <div className="value ch-mode-options">
                <RadioGroup
                  options={[
                    { value: 'RESTRICTED', label: 'Restricted' },
                    { value: 'UNRESTRICTED', label: 'Unrestricted' },
                  ]}
                  value={mode}
                  onChange={(e) => onModeChange(e)}
                />
              </div>
            </div>
          )}
          <div className="ch-form-field-input">
            <Label className="lbl">Channel Type</Label>
            <div className="value ch-channel-type-options">
              <RadioGroup
                options={[
                  { value: 'STANDARD', label: 'Standard' },
                  { value: 'ELASTIC', label: 'Elastic' },
                ]}
                value={channelType}
                onChange={(e) => onChannelTypeChange(e)}
              />
            </div>
          </div>
          {channelType !== 'STANDARD' && (
            <div>
              <div className="ch-form-field-input">
                <Label className="lbl">Maximum SubChannels</Label>
                <Input
                  className="value"
                  showClear={false}
                  type="number"
                  min={minMaximumSubChannels}
                  value={maximumSubChannels}
                  onChange={(e) => onMaximumSubChannelsChange(e)}
                />
              </div>
              <div className="ch-form-field-input">
                <Label className="lbl">Target Memberships Per SubChannel</Label>
                <Input
                  className="value"
                  showClear={false}
                  type="number"
                  min={minTargetMembershipsPerSubChannel}
                  max={maxTargetMembershipsPerSubChannel}
                  value={targetMembershipsPerSubChannel}
                  onChange={(e) => onTargetMembershipsPerSubChannelChange(e)}
                />
              </div>
              <div className="ch-form-field-input">
                <Label className="lbl">Scale-In Minimum Memberships(%) </Label>
                <Input
                  className="value"
                  showClear={false}
                  type="number"
                  max="40"
                  min="1"
                  value={minimumMembershipPercentage}
                  onChange={(e) => onScaleInMinimumMembershipsChange(e)}
                />
              </div>
            </div>
          )}
        </form>
      </ModalBody>
      <ModalButtonGroup
        primaryButtons={[
          <ModalButton
            label="Add"
            type="submit"
            form="new-channel-form"
            variant="primary"
          />,
          <ModalButton label="Cancel" closesModal variant="secondary" />,
        ]}
      />
    </Modal>
  );
};

export default NewChannelModal;
