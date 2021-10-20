// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
const awsPath = "/Prod";
export const rootPath = window.location.href.includes(awsPath)
  ? `${awsPath}/`
  : "/";
=======
const awsPath = '/Prod';
export const rootPath = window.location.href.includes(awsPath)
  ? `${awsPath}/`
  : '/';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

const routes = {
  SIGNIN: `${rootPath}`,
  CHAT: `${rootPath}rooms`,
  DEVICE: `${rootPath}devices`,
  MEETING: `${rootPath}meeting`,
};

export default routes;
