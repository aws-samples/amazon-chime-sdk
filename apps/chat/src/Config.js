// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const appConfig = {
  apiGatewayInvokeUrl:'',
  cognitoUserPoolId: '',
  cognitoAppClientId: '',
  cognitoIdentityPoolId: '',
  appInstanceArn: '',
  region: 'us-east-1',  // Only supported region for Amazon Chime SDK Messaging as of this writing
  attachments_s3_bucket_name: ''
};
export default appConfig;
