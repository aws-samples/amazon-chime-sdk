/* eslint-disable import/no-unresolved */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useState, useEffect } from 'react';

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalButtonGroup,
  ModalButton,
} from 'amazon-chime-sdk-component-library-react';

import ContactPicker from '../ContactPicker';
import {
  listChannelFlows,
  associateChannelFlow
} from '../../api/ChimeAPI';

import './ChannelModals.css';
import appConfig from "../../Config";

export const ManageChannelFlowModal = ({
  onClose,
  channel,
  handlePickerChange,
  onSubmit,
  channelFlow
}) => {
  const [channelFlowList, setChannelFlowList] = useState([]);

  useEffect(() => {
    getAllChannelFlows();
  }, []);

  const getAllChannelFlows = async () => {
    let flows = [];
    try {
      flows = await listChannelFlows(appConfig.appInstanceArn);
    } catch (err) {
      console.error('ERROR', err);
    }
    const flowList = flows.map(flow => {
      return {
        label: flow.Name,
        value: flow.ChannelFlowArn
      };
    });
    if (channelFlow !== null && Object.keys(channelFlow).length !== 0) {
      flowList.splice(0, 0, { label: 'None', value: 'None' });
    }
    setChannelFlowList(flowList);
  };

  return (
    <Modal onClose={onClose} className="add-channel-flow">
      <ModalHeader title={`Manage channel flow for ${channel.Name}`} />
      <ModalBody className="modal-body">
        <div className="container" >
          <div className="row">
            <div className="key">Current Flow</div>
            <div className="value">
              {channel.ChannelFlowArn == null ?
                <span>
                  <span className="main">None</span>
                </span>
                :
                <span>
                  <span className="main">{channelFlow.Name}</span>
                  <span className="detail">   (adding a new flow will replace the current one)</span>
                </span>
              }
            </div>
          </div>
        </div>
        <ContactPicker onChange={handlePickerChange} options={channelFlowList} />
      </ModalBody>
      <ModalButtonGroup
        primaryButtons={[
          <ModalButton label="Save" onClick={onSubmit} variant="primary" />,
          <ModalButton label="Cancel" variant="secondary" closesModal />,
        ]}
      />
    </Modal>
  );
};

export default ManageChannelFlowModal;