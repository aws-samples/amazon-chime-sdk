import { Flex, Modal, ModalBody, ModalButton, ModalButtonGroup, ModalHeader } from 'amazon-chime-sdk-component-library-react';
import React from 'react';
import CameraDevices from '../../components/DeviceSelection/CameraDevices';
import MicrophoneDevices from '../../components/DeviceSelection/MicrophoneDevices';
import SpeakerDevices from '../../components/DeviceSelection/SpeakerDevices';
import { StyledAudioGroup, StyledVideoGroup } from '../../components/DeviceSelection/Styled';
import { useAppState } from '../../providers/AppStateProvider';

const DeviceSetup: React.FC = () => {
  const { isDeviceSetupDisplayed, setIsDeviceSetupDisplayed } = useAppState();

  const handleClose = () => {
    setIsDeviceSetupDisplayed(false);
  };

  const DeviceSetup =
    <Modal size='lg' dismissible={false} onClose={handleClose}>
      <ModalHeader title='Setup Devices' />
      <ModalBody>
        <Flex layout='equal-columns'>
          <StyledAudioGroup>
            <MicrophoneDevices />
            <SpeakerDevices />
          </StyledAudioGroup>
          <StyledVideoGroup>
            <CameraDevices />
          </StyledVideoGroup>
        </Flex>
        <ModalButtonGroup
          primaryButtons={[
            <ModalButton
              onClick={handleClose}
              label='Confirm'
              variant='primary'
              key='confirm'
            />,
          ]}
        />
      </ModalBody>
    </Modal >;

  return isDeviceSetupDisplayed
    ? DeviceSetup
    : null;
};

export default DeviceSetup;