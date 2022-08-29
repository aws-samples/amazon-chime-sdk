// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const awsPath = '/Prod';
export const rootPath: string = window.location.href.includes(awsPath)
  ? `${awsPath}/`
  : '/';

const routes = {
  BASE_URL: `${rootPath}`,
  HOME: `${rootPath}meeting/:meetingId?`,
  DEVICE: `${rootPath}devices`,
  USER_SELECT: `${rootPath}user-select`,
  LOBBY: `${rootPath}meeting/:meetingId?/lobby`
};

export default routes;
