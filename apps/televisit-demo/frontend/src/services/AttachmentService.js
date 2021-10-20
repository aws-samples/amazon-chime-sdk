// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import Storage from "@aws-amplify/storage";
=======
import Storage from '@aws-amplify/storage';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

/**
 * @class AttachmentService
 *
 * @description can be used to upload, download and remove attachments
 */
class AttachmentService {
  /**
   * userLevel : private|protected|public
   */
<<<<<<< HEAD
  static userLevel = "protected";
=======
  static userLevel = 'protected';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

  /**
   * userUploadDir : Default prefix of upload directory
   */
<<<<<<< HEAD
  static userUploadDir = "uploadfiles";
=======
  static userUploadDir = 'uploadfiles';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

  /**
   * Upload file object to AWS S3 bucket using 'userLevel' defined within this class.
   * @param {object} fileObj File to be put in bucket
   * @returns {Promise} promise resolves to object on success
   */
<<<<<<< HEAD
  static async upload(fileObj) {
=======
  static async upload (fileObj) {
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    try {
      const response = await Storage.put(
        `${this.userUploadDir}/${fileObj.name}`,
        fileObj,
        {
          contentType: fileObj.type,
<<<<<<< HEAD
          level: this.userLevel,
=======
          level: this.userLevel
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
        }
      );

      return response;
    } catch (err) {
      throw new Error(`Failed to upload file! with error: ${err}`);
    }
  }

  /**
   * Get a presigned URL of the file or the object data
   *
   * @param {string} fileKey - key of the object
   * @param {string} userId - userId of the user who shared the attachment.
   * @return {Promise}- A promise resolves to either a presigned url or the object
   */
<<<<<<< HEAD
  static download(fileKey, userId) {
    return Storage.get(fileKey, {
      level: this.userLevel,
      identityId: userId,
=======
  static download (fileKey, userId) {
    return Storage.get(fileKey, {
      level: this.userLevel,
      identityId: userId
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    });
  }

  /**
   * Remove the object for specified key
   * @param {string} fileKey - key of the object
   * @return - Promise resolves upon successful removal of the object
   */
<<<<<<< HEAD
  static delete(fileKey) {
=======
  static delete (fileKey) {
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    return Storage.remove(fileKey, { level: this.userLevel });
  }
}

export default AttachmentService;
