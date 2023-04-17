// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import data from '../../../backend/appconfig.json';

const appConfigJson = Object.assign({}, ...data.map((x) => ({ [x.OutputKey]: x.OutputValue })));

export const appConfig = {
  ApiGatewayUrl: '' || appConfigJson.ApiGatewayUrl,
  AppInstanceArn: '' || appConfigJson.AppInstanceArn,
  AdminUserArn: '' || appConfigJson.AdminUserArn,
  AssetsS3BucketName: '' || appConfigJson.AssetsS3BucketName,
  CloudfrontEndpoint: '' || appConfigJson.CloudfrontEndpoint,
};
