import React, { ReactNode, useContext, useEffect, useState } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { Auth } from '@aws-amplify/auth';
import { ICredentials } from '@aws-amplify/core';
import { Provider } from '@aws-sdk/types';

import Config from '../utils/Config';
import SignInSignUp from '../components/SignInSignUp';
import { AccountType } from '../constants';

interface AuthValue {
  accountType: AccountType;
  appInstanceUserArn: string;
  // TODO: Remove "credentials" when removing AWS SDK v2 dependency in MessagingProvider.
  credentials: ICredentials;
  getIdToken: Provider<string>,
  signOut: (data?: Record<string | number | symbol, any>) => void;
  user: ReturnType<typeof useAuthenticator>['user'];
}

const AuthContext = React.createContext<AuthValue | undefined>(undefined);

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return value;
}

export default function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const { route, user, signOut } = useAuthenticator((context) => [context.route]);
  const [credentials, setCredentials] = useState<{
    credentials: ICredentials,
    getIdToken: Provider<string>,
  }>();

  useEffect(() => {
    if (route === 'authenticated') {
      (async () => {
        setCredentials({
          credentials: Auth.essentialCredentials(await Auth.currentCredentials()),
          getIdToken: async (): Promise<string> => {
            return (await Auth.currentSession()).getIdToken().getJwtToken();
          },
        });
      })();
    } else if (route === 'signOut') {
      setCredentials(undefined); 
    }
  }, [route]);

  if (route === 'authenticated' && credentials) {
    const value: AuthValue = {
      accountType: user.attributes?.['custom:accountType'] as AccountType,
      appInstanceUserArn: `${Config.AppInstanceArn}/user/${user.username}`,
      credentials: credentials.credentials,
      getIdToken: credentials.getIdToken,
      signOut,
      user,
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  } else {
    return <SignInSignUp />;
  }
}
