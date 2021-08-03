// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

'use strict';
const AWS = require('aws-sdk');
const response = require('cfn-response');
AWS.config.update({region: process.env.AWS_REGION});
const chime = new AWS.Chime({region: process.env.AWS_REGION});

exports.handler = async (event, context) => {
  console.log('Event: \n', event);
  console.log('Create Chime SDK App Instance');

  try {
    if (event["RequestType"] !== "Create") {
      await response.send(event, context, response.SUCCESS, {});
    }

    const dateNow = new Date();
    let chimeResponse;
    //create a chime app instance
    const params = {
      Name: 'AWSChimeMessagingSDKDemo-' + dateNow.getHours().toString() + dateNow.getMinutes().toString(),
    };
    chimeResponse = await chime.createAppInstance(
      params,
      function (err, data) {
        if (err) console.log(err, err.stack);
        // an error occurred
        else {
          console.log(data); // successful response
          return data;
        }
      }
    ).promise();

    //Create AppInstanceAdmin
    const createUserParams = {
      AppInstanceArn: chimeResponse.AppInstanceArn, /* required */
      AppInstanceUserId: 'ServiceUser', /* required */
      ClientRequestToken: dateNow.getHours().toString() + dateNow.getMinutes().toString(), /* required */
      Name: 'ServiceUser', /* required */
    };
    await chime.createAppInstanceUser(
      createUserParams,
      function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
          console.log(data);           // successful response
          chimeResponse.AdminUserArn = data.AppInstanceUserArn;
        }
      }
    ).promise();

    const createAdminParams = {
      AppInstanceAdminArn: chimeResponse.AdminUserArn, /* required */
      AppInstanceArn: chimeResponse.AppInstanceArn /* required */
    };
    await chime.createAppInstanceAdmin(
      createAdminParams,
      function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
          console.log(data);           // successful response
        }
      }
    ).promise();

    await response.send(event, context, response.SUCCESS, chimeResponse);
  } catch (error) {
    console.error("Failed to create AppInstance resources", error);
    await response.send(event, context, response.FAILED, {});
  }
};
