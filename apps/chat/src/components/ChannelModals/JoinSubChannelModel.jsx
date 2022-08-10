import React, { useState, useEffect } from 'react';

import {
  Label,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalButtonGroup,
  ModalButton,
} from 'amazon-chime-sdk-component-library-react';

export const JoinSubChannelModel = ({ onClose, channel, joinSubChannel }) => {
  const [subChannelId, setSubChannelId] = useState("");
  const onSubChannelIdChange = (e) => {
    setSubChannelId(e.target.value);
  };
  return (
    <Modal onClose={onClose}>
      <ModalHeader title={`Join Sub channel in ${channel.Name}`} />
      <ModalBody>
        <div className="ch-form-field-input">
          <Label className="lbl">SubChannel Id</Label>
          <Input
            className="value"
            showClear={false}
            type="text"
            value={subChannelId}
            onChange={(e) => onSubChannelIdChange(e)}
          />
        </div>
      </ModalBody>
      <ModalButtonGroup
        primaryButtons={[
          <ModalButton
            label="Join"
            onClick={(e) => {
              joinSubChannel(subChannelId);
            }}
            variant="primary"
            closesModal
          />,
          <ModalButton label="Cancel" closesModal variant="secondary" />,
        ]}
      />
    </Modal>
  );
};

export default JoinSubChannelModel;
