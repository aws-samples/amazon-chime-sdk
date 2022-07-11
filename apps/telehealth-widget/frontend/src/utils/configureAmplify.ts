import { Amplify } from '@aws-amplify/core';
import Config from './Config';

const configureAmplify = (): void => {
  Amplify.configure({
    Auth: {
      identityPoolId: Config.CognitoIdentityPoolId,
      region: Config.Region,
      identityPoolRegion: Config.Region,
      userPoolId: Config.CognitoUserPoolId,
      userPoolWebClientId: Config.CognitoUserPoolClientId,
    },
  });
};

export default configureAmplify;
