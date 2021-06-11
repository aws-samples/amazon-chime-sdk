// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const appConfig = {
  credentialExchangeServiceApiGatewayInvokeUrl:'https://04uwvo64ui.execute-api.us-east-1.amazonaws.com/Stage/creds',
  cognitoUserPoolId: 'us-east-1_jMwiRisJj',
  cognitoAppClientId: '63arfmlcnbn4sc3djj7mkpkkmv',
  cognitoIdentityPoolId: 'us-east-1:e63c693f-afe6-435f-b072-1b5289ac8864',
  appInstanceArn: 'arn:aws:chime:us-east-1:946724017157:app-instance/5fb4007a-6363-4a0f-8480-cccdceb4892c',
  region: 'us-east-1',  // Only supported region for Amazon Chime SDK Messaging as of this writing
  attachments_s3_bucket_name: 'chimesdkmessagingdemo-chatattachmentsbucket-9loyk4e05o7x'
};
export default appConfig;
