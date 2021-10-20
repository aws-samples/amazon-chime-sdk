// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import { MessageAttachment } from "amazon-chime-sdk-component-library-react";
import AttachmentService from "../../services/AttachmentService";
import arnParser from "../../utilities/arnParser";
import formatBytes from "../../utilities/formatBytes";
import appConfig from "../../Config";
=======
import React, { useEffect, useState } from 'react';
import { MessageAttachment } from 'amazon-chime-sdk-component-library-react';
import AttachmentService from '../../services/AttachmentService';
import arnParser from '../../utilities/arnParser';
import formatBytes from '../../utilities/formatBytes';
import appConfig from '../../Config';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

/**
 * Attachment Processor which provides MessageAttachment component with downloadUrl
 * @param {string} fileKey S3 bucket file key
 * @param {string} name File name or title
 * @param {number} [size=0] File byte size
 * @param {string} senderId AWS Cognito userId of the provided fileKey
 * @returns {MessageAttachment} MessageAttachment
 */
export const AttachmentProcessor = ({ fileKey, name, size = 0, senderId }) => {
<<<<<<< HEAD
  const [url, setUrl] = useState("");
=======
  const [url, setUrl] = useState('');
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

  useEffect(() => {
    async function getUrl() {
      const data = await AttachmentService.download(
        fileKey,
        `${appConfig.region}:${arnParser(senderId).relativeValue}`
      );
      setUrl(data);
    }
    getUrl();
  }, [fileKey, senderId]);

  return (
    <MessageAttachment name={name} downloadUrl={url} size={formatBytes(size)} />
  );
};

export default AttachmentProcessor;
