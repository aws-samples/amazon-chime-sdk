// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import data from './backend/serverless/appconfig.json'
const appConfigJson = Object.assign({}, ...data.map((x) => ({[x.OutputKey]: x.OutputValue})));

const appConfig = {
    apiGatewayInvokeUrl: '' || appConfigJson.apiGatewayInvokeUrl,
    cognitoUserPoolId: '' || appConfigJson.cognitoUserPoolId,
    cognitoAppClientId: '' || appConfigJson.cognitoAppClientId,
    cognitoIdentityPoolId: '' || appConfigJson.cognitoIdentityPoolId,
    appInstanceArn: '' || appConfigJson.appInstanceArn,
    region: 'us-east-1',  // Only supported region for Amazon Chime SDK Messaging as of this writing
    attachments_s3_bucket_name: '' || appConfigJson.attachmentsS3BucketName
};
export default appConfig;
