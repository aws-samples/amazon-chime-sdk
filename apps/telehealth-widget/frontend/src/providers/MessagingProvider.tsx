import React, { useContext, ReactNode, useEffect, useState, useMemo } from 'react';
import {
  LogLevel,
  ConsoleLogger,
  DefaultMessagingSession,
  MessagingSessionConfiguration,
  MessagingSession,
  MessagingSessionObserver,
} from 'amazon-chime-sdk-js';
import { GetMessagingSessionEndpointCommand } from '@aws-sdk/client-chime-sdk-messaging';
import { v4 as uuidv4 } from 'uuid';

import { useAwsClient } from './AwsClientProvider';
import { useAuth } from './AuthProvider';

interface MessagingValue {
  // Suppose you open two or multiple browser tabs signing in to the same user.
  // Use the client ID in the "messagingSessionDidReceiveMessage" observer to determine
  // if a message comes from the same browser context.
  clientId: string;
  messagingSession?: MessagingSession;
}

const MessagingContext = React.createContext<MessagingValue | undefined>(undefined);

export function useMessaging(): MessagingValue {
  const value = useContext(MessagingContext);
  if (!value) {
    throw new Error('Messaging must be used within MessagingProvider');
  }
  return value;
}

export default function MessagingProvider({ children }: { children: ReactNode }) {
  const clientId = useMemo(() => uuidv4(), []);
  const { messagingClient } = useAwsClient();
  const { appInstanceUserArn, credentials } = useAuth();
  const [messagingSession, setMessagingSession] = useState<MessagingSession>();

  useEffect(() => {
    let messagingSession: MessagingSession;
    let observer: MessagingSessionObserver;

    (async () => {
      const data = await messagingClient.send(new GetMessagingSessionEndpointCommand({}));

      const configuration = new MessagingSessionConfiguration(
        appInstanceUserArn,
        null,
        data.Endpoint!.Url!,
        messagingClient,
      );
      messagingSession = new DefaultMessagingSession(
        configuration,
        new ConsoleLogger('MessagingSession', LogLevel.WARN)
      );
      observer = {
        messagingSessionDidStart: () => {
          setMessagingSession(messagingSession);
        },
        messagingSessionDidStop: () => {
          setMessagingSession(undefined);
        },
      };
      messagingSession.addObserver(observer);
      messagingSession.start();
    })();

    return () => {
      messagingSession?.removeObserver(observer);
      messagingSession?.stop();
    };
  }, [appInstanceUserArn, credentials, messagingClient]);

  const value = {
    clientId,
    messagingSession,
  };
  return <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>;
}
