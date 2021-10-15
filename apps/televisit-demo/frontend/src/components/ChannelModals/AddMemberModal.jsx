/* eslint-disable import/no-unresolved */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useState, useEffect } from "react";

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalButtonGroup,
  ModalButton,
} from "amazon-chime-sdk-component-library-react";

import { createMemberArn } from "../../api/ChimeAPI";
import { useIdentityService } from "../../providers/IdentityProvider";
import { useAuthContext } from "../../providers/AuthProvider";
import ContactPicker from "../ContactPicker";
import { listAppInstanceUsers } from "../../api/ChimeAPI";

import "./ChannelModals.css";
import appConfig from "../../Config";

export const AddMemberModal = ({
  onClose,
  channel,
  handlePickerChange,
  onSubmit,
  members,
}) => {
  const [usersList, setUsersList] = useState([]);
  const identityClient = useIdentityService();
  const { useCognitoIdp } = useAuthContext();
  const { userId } = useAuthContext().member;

  const getUserAttributeByName = (user, attribute) => {
    try {
      return user.Attributes.filter((attr) => attr.Name === attribute)[0].Value;
    } catch (err) {
      throw new Error(`Failed at getUserAttributeByName() with error: ${err}`);
    }
  };

  const getAllUsersFromCognitoIdp = () => {
    identityClient
      .getUsers()
      .then((users) => {
        const list = users.map((user) => {
          if (getUserAttributeByName(user, "profile") !== "none") {
            return {
              label: user.Username,
              value: user.Attributes.filter(
                (attr) => attr.Name === "profile"
              )[0].Value,
            };
          }
          return false;
        });
        setUsersList(list);
      })
      .catch((err) => {
        throw new Error(
          `Failed at getAllUsersFromCognitoIdp() with error: ${err}`
        );
      });
  };

  const getAllUsersFromListAppInstanceUsers = () => {
    listAppInstanceUsers(appConfig.appInstanceArn, userId)
      .then((users) => {
        const list = users.map((user) => {
          return {
            label: user.Name,
            value: user.AppInstanceUserArn.split("/user/")[1],
          };
        });
        setUsersList(list);
      })
      .catch((err) => {
        throw new Error(
          `Failed at getAllUsersFromListAppInstanceUsers() with error: ${err}`
        );
      });
  };

  const getAllUsers = () => {
    // either approach works, but if you have an IDP it is likely other apps will use IDP to find users so why not reuse here
    if (useCognitoIdp) {
      return getAllUsersFromCognitoIdp();
    } else {
      return getAllUsersFromListAppInstanceUsers();
    }
  };

  useEffect(() => {
    if (!identityClient) return;
    if (useCognitoIdp) {
      identityClient.setupClient();
    }
    getAllUsers();
  }, [identityClient]);

  const memberArns = members.map((mem) => mem.Member.Arn);

  const nonmembers = usersList.filter((user) => {
    if (!user.value) {
      return false;
    }
    return memberArns.indexOf(createMemberArn(user.value)) === -1;
  });

  return (
    <Modal onClose={onClose} className="add-members">
      <ModalHeader title={`Add Members to ${channel.Name}`} />
      <ModalBody className="modal-body">
        <ContactPicker onChange={handlePickerChange} options={nonmembers} />
      </ModalBody>
      <ModalButtonGroup
        primaryButtons={[
          <ModalButton label="Add" onClick={onSubmit} variant="primary" />,
          <ModalButton label="Cancel" variant="secondary" closesModal />,
        ]}
      />
    </Modal>
  );
};

export default AddMemberModal;
