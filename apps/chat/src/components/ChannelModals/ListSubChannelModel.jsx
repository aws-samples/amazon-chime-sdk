// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useState, useEffect } from 'react';

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalButtonGroup,
  ModalButton,
  Checkbox,
} from 'amazon-chime-sdk-component-library-react';

import { useIdentityService } from '../../providers/IdentityProvider';
import { useAuthContext } from '../../providers/AuthProvider';
import { useChatChannelState } from '../../providers/ChatMessagesProvider';

import { listSubChannels } from '../../api/ChimeAPI';

import './ChannelModals.css';

export const ListSubChannelModel = ({
  onClose,
  channel,
  subChannelList,
  leaveSubChannel,
  joinSubChannel,
}) => {
  const [formatedSubChannelList, setFormatedSubChannelList] = useState([]);
  const identityClient = useIdentityService();
  const { useCognitoIdp, member: { userId } } = useAuthContext();
  const { subChannelIds } = useChatChannelState();

  const getAllSubChannelsForElasticChannel = () => {
    listSubChannels(channel.ChannelArn, userId, null)
      .then((subs) => {
        const list = subs.SubChannels.map((subChannel) => {
          return {
            SubChannelId: subChannel.SubChannelId,
            MembershipCount: subChannel.MembershipCount,
            joined: subChannelList.length
              ? subChannelList.findIndex((x) => {
                  if (x.SubChannelId == subChannel.SubChannelId) {
                    return true;
                  }
                }) != -1
              : false,
          };
        });
        setFormatedSubChannelList(list);
      })
      .catch((err) => {
        throw new Error(
          `Failed at getAllSubChannelsForElasticChannel() with error: ${err}`
        );
      });
  };

  useEffect(() => {
    if (!identityClient) return;
    if (useCognitoIdp) {
      identityClient.setupClient();
    }
    getAllSubChannelsForElasticChannel();
  }, [identityClient, useCognitoIdp]);

  const handleCheckClick = (e) => {
    const selected = formatedSubChannelList.filter(
      (subChannel) => subChannel && subChannel.SubChannelId == e.target.value
    )[0];
    const isJoined = selected.joined;
    if (isJoined) {
      leaveSubChannel(selected.SubChannelId);
    } else {
      joinSubChannel(selected.SubChannelId);
    }
    selected.joined = !isJoined;
  };

  const subChannelItems = formatedSubChannelList.map((subChannel) => (
    <div className="ban-row" key={subChannel.SubChannelId}>
      <span className="ban-row-name">{subChannel.SubChannelId}</span>
      <span className="ban-row-role">{subChannel.MembershipCount}</span>
      <span className="ban-row-check">
        <Checkbox
          value={subChannel.SubChannelId}
          checked={subChannel.joined}
          onChange={(e) => handleCheckClick(e)}
        />
      </span>
    </div>
  ));

  return (
    <Modal onClose={onClose}>
      <ModalHeader title={`Join SubChannels of ${channel.Name}`} />
      <ModalBody className="modal-body">
        <div className="ban-row subChannel-row-header">
          <span className="ban-row-name">Name</span>
          <span className="ban-row-role">Member Count</span>
          <span className="ban-row-check">Join</span>
        </div>
        <ul className="ban-users-list">{subChannelItems}</ul>
      </ModalBody>
      <ModalButtonGroup
        primaryButtons={[
          <ModalButton label="OK" variant="secondary" closesModal />,
        ]}
      />
    </Modal>
  );
};

export default ListSubChannelModel;
