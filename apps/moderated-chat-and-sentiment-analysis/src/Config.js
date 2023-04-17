// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import data from '../backend/appconfig.json'
const appConfigJson = Object.assign({}, ...data.map((x) => ({[x.OutputKey]: x.OutputValue})));

const appConfig = {
  createUserApiGatewayURL: '' || appConfigJson.createUserApiGatewayURL,
  appInstanceArn: '' || appConfigJson.appInstanceArn,
  adminUserArn: '' || appConfigJson.adminUserArn,
  channelArn: '' || appConfigJson.channelArn,
  assetsS3BucketName: '' || appConfigJson.assetsS3BucketName,
  cloudfrontEndpoint: '' || appConfigJson.cloudfrontEndpoint,
};
export default appConfig;
