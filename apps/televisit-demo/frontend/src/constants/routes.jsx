// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

const awsPath = '/Prod';
export const rootPath = window.location.href.includes(awsPath)
  ? `${awsPath}/`
  : '/';

const routes = {
  SIGNIN: `${rootPath}`,
  CHAT: `${rootPath}rooms`,
  DEVICE: `${rootPath}devices`,
  MEETING: `${rootPath}meeting`,
};

export default routes;
