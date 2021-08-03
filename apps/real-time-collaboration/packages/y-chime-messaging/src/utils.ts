// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { MessagingProvider } from './messagingProvider';

export const updateUrl = (provider: MessagingProvider): void => {
  const channelArn = provider.getChannelArn() as string;
  const searchParameters = new URLSearchParams(window.location.search);

  if (!searchParameters.has('channel-arn') || searchParameters.get('channel-arn') !== channelArn) {
    searchParameters.set('channel-arn', encodeURIComponent(channelArn));
    window.history.replaceState({}, '', `${window.location.pathname}?${searchParameters.toString()}`);
    console.log(`Updated url. [channelArn=${channelArn}]`);
  }
};

export const getSearchParameterValue = (
  name: string,
  searchParameters: URLSearchParams,
): string | null => {
  if (searchParameters.has(name)) {
    return decodeURIComponent(searchParameters.get(name)!);
  }

  return null;
};
