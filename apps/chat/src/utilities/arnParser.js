const arnParser = (arn) => {
  // Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

  const arnMap = [
    'arn',
    'aws',
    'service',
    'region',
    'namespace',
    'relativeId',
    'relativeValue',
  ];
  return arn.split(':').reduce(function (aggregator, piece, index) {
    aggregator[arnMap[index]] = piece;
    return aggregator;
  }, {});
};

export default arnParser;
