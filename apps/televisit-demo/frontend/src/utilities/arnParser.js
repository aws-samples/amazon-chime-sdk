const arnParser = (arn) => {
  // Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
  // SPDX-License-Identifier: Apache-2.0

  const arnMap = [
<<<<<<< HEAD
    "arn",
    "aws",
    "service",
    "region",
    "namespace",
    "relativeId",
    "relativeValue",
  ];
  return arn.split(":").reduce(function (aggregator, piece, index) {
=======
    'arn',
    'aws',
    'service',
    'region',
    'namespace',
    'relativeId',
    'relativeValue'
  ];
  return arn.split(':').reduce(function (aggregator, piece, index) {
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    aggregator[arnMap[index]] = piece;
    return aggregator;
  }, {});
};

export default arnParser;
