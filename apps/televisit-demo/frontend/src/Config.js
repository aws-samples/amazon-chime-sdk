// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
<<<<<<< HEAD
const samOutputs = require("./sam-output.json");

const mappedOutputs = {};

for (let i = 0; i < samOutputs.length; i++) {
  mappedOutputs[samOutputs[i].OutputKey] = samOutputs[i].OutputValue;
=======
const samOutputs = require('./sam-output.json')

const mappedOutputs = {}

for (let i = 0; i < samOutputs.length; i++) {
  mappedOutputs[samOutputs[i].OutputKey] = samOutputs[i].OutputValue
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
}

const appConfig = {
  apiGatewayInvokeUrl: mappedOutputs.apiGatewayInvokeUrl,
  cognitoUserPoolId: mappedOutputs.cognitoUserPoolId,
  cognitoAppClientId: mappedOutputs.cognitoAppClientId,
  cognitoIdentityPoolId: mappedOutputs.cognitoIdentityPoolId,
  appInstanceArn: mappedOutputs.appInstanceArn,
<<<<<<< HEAD
  region: "us-east-1",
  attachments_s3_bucket_name: mappedOutputs.attachments_s3_bucket_name,
=======
  region: 'us-east-1',
  attachments_s3_bucket_name: mappedOutputs.attachments_s3_bucket_name
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
};
export default appConfig;
