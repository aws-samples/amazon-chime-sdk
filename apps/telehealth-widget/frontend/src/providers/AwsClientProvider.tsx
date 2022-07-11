import React, { useContext, ReactNode } from 'react';
import { ChimeSDKMessagingClient } from '@aws-sdk/client-chime-sdk-messaging';
import { ChimeSDKIdentityClient } from '@aws-sdk/client-chime-sdk-identity';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { LambdaClient } from '@aws-sdk/client-lambda';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';
import { SFNClient } from '@aws-sdk/client-sfn';

import Config from '../utils/Config';
import { useAuth } from './AuthProvider';

interface AwsClientValue {
  cognitoClient: CognitoIdentityProviderClient;
  identityClient: ChimeSDKIdentityClient;
  messagingClient: ChimeSDKMessagingClient;
  lambdaClient: LambdaClient;
  sfnClient: SFNClient;
}

const AwsClientContext = React.createContext<AwsClientValue | undefined>(undefined);

export function useAwsClient(): AwsClientValue {
  const value = useContext(AwsClientContext);
  if (!value) {
    throw new Error('AwsClient must be used within AwsClientProvider');
  }
  return value;
}

export default function AwsClientProvider({ children }: { children: ReactNode }) {
  const { getIdToken } = useAuth();
  const parameters = {
    region: Config.Region,
    credentials: fromCognitoIdentityPool({
      clientConfig: { region: Config.Region },
      identityPoolId: Config.CognitoIdentityPoolId,
      logins: {
        [`cognito-idp.${Config.Region}.amazonaws.com/${Config.CognitoUserPoolId}`]: getIdToken,
      },
    }),
  };
  const value = {
    cognitoClient: new CognitoIdentityProviderClient(parameters),
    identityClient: new ChimeSDKIdentityClient(parameters),
    messagingClient: new ChimeSDKMessagingClient(parameters),
    lambdaClient: new LambdaClient(parameters),
    sfnClient: new SFNClient(parameters),
  };
  return <AwsClientContext.Provider value={value}>{children}</AwsClientContext.Provider>;
}
