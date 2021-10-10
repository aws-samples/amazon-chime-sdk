// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, {
  useState,
  useContext,
  useEffect,
  useRef,
  ReactNode
} from 'react';
import { useLocation } from 'react-router-dom';
import { useMeetingManager } from 'amazon-chime-sdk-component-library-react';
import { useAppState } from './AppStateProvider';
import {startTranscription} from '../api/ChimeAPI';

import routes from '../constants/routes';

export type NavigationContextType = {
  showNavbar: boolean;
  showRoster: boolean;
  showChat: boolean;
  showTranscript: boolean;
  showMetrics: boolean;
  toggleRoster: () => void;
  toggleChat: () => void;
  toggleNavbar: () => void;
  toggleTranscript: () => void;
  openRoster: () => void;
  closeRoster: () => void;
  openChat: () => void;
  closeChat: () => void;
  openNavbar: () => void;
  closeNavbar: () => void;
  toggleMetrics: () => void;
};

type Props = {
  children: ReactNode;
};

const NavigationContext = React.createContext<NavigationContextType | null>(
  null
);

const isDesktop = () => window.innerWidth > 768;

const NavigationProvider = ({ children }: Props) => {
  const [showNavbar, setShowNavbar] = useState(() => isDesktop());
  const [showRoster, setShowRoster] = useState(() => isDesktop());
  const [showChat, setShowChat] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const isDesktopView = useRef(isDesktop());

  const location = useLocation();
  const meetingManager = useMeetingManager();
  const { meetingId } = useAppState();

  useEffect(() => {
    if (location.pathname.includes(routes.MEETING)) {
      return () => {
        meetingManager.leave();
      };
    }
  }, [location.pathname]);

  useEffect(() => {
    const handler = () => {
      const isResizeDesktop = isDesktop();
      if (isDesktopView.current === isResizeDesktop) {
        return;
      }

      isDesktopView.current = isResizeDesktop;

      if (!isResizeDesktop) {
        setShowNavbar(false);
        setShowRoster(false);
        setShowChat(false);
        setShowTranscript(false);
      } else {
        setShowNavbar(true);
      }
    };

    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const toggleRoster = (): void => {
    setShowRoster(!showRoster);
    setShowChat(false);
    setShowTranscript(false);
  };

  const toggleChat = (): void => {
    setShowChat(!showChat);
    setShowRoster(false);
    setShowTranscript(false);
  };

  const toggleTranscript = (): void => {
    startTranscription(meetingId);
    setShowTranscript(!showTranscript);
    setShowRoster(false);
    setShowChat(false);
  };

  const toggleNavbar = (): void => {
    setShowNavbar(!showNavbar);
  };

  const toggleMetrics = () => {
    setShowMetrics(currentState => !currentState);
  };

  const openNavbar = (): void => {
    setShowNavbar(true);
  };

  const closeNavbar = (): void => {
    setShowNavbar(false);
  };

  const openRoster = (): void => {
    setShowRoster(true);
  };

  const closeRoster = (): void => {
    setShowRoster(false);
  };

  const openChat = (): void => {
    setShowChat(true);
  };

  const closeChat = (): void => {
    setShowChat(false);
  };

  const openTranscript = (): void => {
    setShowTranscript(true);
  };

  const closeTranscript = (): void => {
    setShowTranscript(false);
  };

  const providerValue = {
    showNavbar,
    showRoster,
    showChat,
    showTranscript,
    showMetrics,
    toggleRoster,
    toggleChat,
    toggleTranscript,
    toggleNavbar,
    toggleMetrics,
    openRoster,
    closeRoster,
    openChat,
    closeChat,
    openTranscript,
    closeTranscript,
    openNavbar,
    closeNavbar
  };
  return (
    <NavigationContext.Provider value={providerValue}>
      {children}
    </NavigationContext.Provider>
  );
};

const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw Error('Use useNavigation in NavigationProvider');
  }
  return context;
};

export { NavigationProvider, useNavigation };
