// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import Amplify from "@aws-amplify/core";
import appConfig from "../Config";
=======
import Amplify from '@aws-amplify/core';
import appConfig from '../Config';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

const configureAmplify = () => {
  Amplify.configure({
    Auth: {
      // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
      identityPoolId: appConfig.cognitoIdentityPoolId,
      // REQUIRED - Amazon Cognito Region
      region: appConfig.region,
      // OPTIONAL - Amazon Cognito Federated Identity Pool Region
      // Required only if it's different from Amazon Cognito Region
      identityPoolRegion: appConfig.region,
      // OPTIONAL - Amazon Cognito User Pool ID
      userPoolId: appConfig.cognitoUserPoolId,
      // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
<<<<<<< HEAD
      userPoolWebClientId: appConfig.cognitoAppClientId,
=======
      userPoolWebClientId: appConfig.cognitoAppClientId
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
    },
    Storage: {
      // REQUIRED - S3 bucket name for chat attachments
      bucket: appConfig.attachments_s3_bucket_name,
      // REQUIRED - Amazon S3 Region
      region: appConfig.region,
      // REQUIRED Amazon Cognito Identity Pool ID
<<<<<<< HEAD
      identityPoolId: appConfig.cognitoIdentityPoolId,
    },
=======
      identityPoolId: appConfig.cognitoIdentityPoolId
    }
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  });
};

export default configureAmplify;
