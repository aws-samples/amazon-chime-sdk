/* eslint-disable import/no-extraneous-dependencies */
// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import AWS from "aws-sdk";
import Auth from "@aws-amplify/auth";
=======
import AWS from 'aws-sdk';
import Auth from '@aws-amplify/auth';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

/**
 * @class IdentityService
 */
export class IdentityService {
  /**
   * @param {region}  region AWS region.
   * @param {userPoolId} userPoolId Cognito User Pool Id.
   */
<<<<<<< HEAD
  constructor(region, userPoolId) {
=======
  constructor (region, userPoolId) {
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    this._userPoolId = userPoolId;
    this._region = region;
  }

<<<<<<< HEAD
  async getUsers(limit = 60) {
=======
  async getUsers (limit = 60) {
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    try {
      const users = await this._identityClient
        .listUsers({
          Limit: limit,
<<<<<<< HEAD
          UserPoolId: this._userPoolId,
=======
          UserPoolId: this._userPoolId
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
        })
        .promise();

      return users.Users;
    } catch (err) {
      throw new Error(err);
    }
  }

<<<<<<< HEAD
  async searchByName(name) {
=======
  async searchByName (name) {
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    try {
      const list = await this._identityClient
        .listUsers({
          Filter: `username ^= "${name}"`,
          Limit: 10,
<<<<<<< HEAD
          UserPoolId: this._userPoolId,
=======
          UserPoolId: this._userPoolId
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
        })
        .promise();

      return list.Users;
    } catch (err) {
      throw new Error(`Failed with error: ${err}`);
    }
  }

<<<<<<< HEAD
  async setupClient() {
=======
  async setupClient () {
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    const creds = await Auth.currentCredentials();
    if (!creds) return;

    this._identityClient = new AWS.CognitoIdentityServiceProvider({
      region: this._region,
<<<<<<< HEAD
      credentials: Auth.essentialCredentials(creds),
=======
      credentials: Auth.essentialCredentials(creds)
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    });
  }
}

export default IdentityService;
