// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const appConfig = {
  apiGatewayInvokeUrl:'https://qpik87xt5d.execute-api.us-east-1.amazonaws.com/Stage/',
  cognitoUserPoolId: 'us-east-1_gh1exTMft',
  cognitoAppClientId: '5gl5cgujescdvon81cchqkqrf7',
  cognitoIdentityPoolId: 'us-east-1:209669ce-49b3-4566-a38b-f1d2cac65f17',
  appInstanceArn: 'arn:aws:chime:us-east-1:946724017157:app-instance/49a93b15-d401-4d17-a111-f7c59d1b1298',
  region: 'us-east-1',  // Only supported region for Amazon Chime SDK Messaging as of this writing
  attachments_s3_bucket_name: 'chimesdkmessagingdemo-chatattachmentsbucket-davr97iqco15'
};
export default appConfig;
