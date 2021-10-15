// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const samOutputs = require("./sam-output.json");

const mappedOutputs = {};

for (let i = 0; i < samOutputs.length; i++) {
  mappedOutputs[samOutputs[i].OutputKey] = samOutputs[i].OutputValue;
}

const appConfig = {
  apiGatewayInvokeUrl: mappedOutputs.apiGatewayInvokeUrl,
  cognitoUserPoolId: mappedOutputs.cognitoUserPoolId,
  cognitoAppClientId: mappedOutputs.cognitoAppClientId,
  cognitoIdentityPoolId: mappedOutputs.cognitoIdentityPoolId,
  appInstanceArn: mappedOutputs.appInstanceArn,
  region: "us-east-1",
  attachments_s3_bucket_name: mappedOutputs.attachments_s3_bucket_name,
};
export default appConfig;
