// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const awsPath = '/Prod';
export const rootPath = window.location.href.includes(awsPath)
  ? `${awsPath}/`
  : '/';

const routes = {
  SIGNIN: `${rootPath}`,
  CHAT: `${rootPath}rooms`,
};

export default routes;
