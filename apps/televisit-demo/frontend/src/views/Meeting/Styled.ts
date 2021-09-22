// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';

interface Props {
  showNav: boolean;
  showRoster: boolean;
  showChat: boolean;
  showTranscript: boolean;
}

export const StyledLayout = styled.main<Props>`
  height: 100vh;
  width: 100%;

  display: grid;

  .video-content {
    grid-area: content;
  }

  ${({ showNav, showRoster, showChat, showTranscript }) => {
    if (showNav && showRoster) {
      return `
        grid-template-columns: auto auto 1fr;
        grid-template-areas: 'nav roster content';
      `;
    }

    if (showNav && showChat) {
      return `
        grid-template-columns: auto 1fr 2fr;
        grid-template-areas: 'nav chat content';
      `;
    }

    if (showNav && showTranscript) {
      return `
        grid-template-columns: auto 1fr 2fr;
        grid-template-areas: 'nav transcript content';
      `;
    }

    if (showNav) {
      return `
        grid-template-columns: auto 1fr;
        grid-template-areas: 'nav content';
      `;
    }

    if (showChat) {
      return `
        grid-template-columns: 1fr 2fr;
        grid-template-areas: 'chat content';
      `;
    }

    if (showRoster) {
      return `
        grid-template-columns: auto 1fr;
        grid-template-areas: 'roster content';
      `;
    }

    if (showTranscript) {
      return `
        grid-template-columns: 1fr 2fr;
        grid-template-areas: 'transcript content';
      `;
    }

    return `
      grid-template-columns: 1fr;
      grid-template-areas: 'content';
    `;
  }}

  .nav {
    grid-area: nav;
  }

  .chat {
    grid-area: chat;
    z-index: 2;
  }

  .roster {
    grid-area: roster;
    z-index: 2;
  }

  .transcript {
    grid-area: transcript;
    z-index: 2;
  }

  @media screen and (min-width: 769px) {
    .mobile-toggle {
      display: none;
    }
  }

  @media screen and (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-areas: 'content';

    .nav {
      grid-area: unset;
      position: fixed;
    }

    .chat {
      grid-area: unset;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      max-width: 160px;
    }

    .roster {
      grid-area: unset;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      max-width: 160px;
    }

    .transcript {
      grid-area: unset;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      max-width: 160px;
    }
  }

  @media screen and (max-width: 460px) {
    .chat {
      max-width: 100%;
    }

    .roster {
      max-width: 100%;
    }

    .transcript {
      max-width: 100%;
    }
  }
`;

export const StyledContent = styled.div`
  position: relative;
  grid-area: content;
  height: 100%;
  display: flex;
  flex-direction: column;

  .videos {
    flex: 1;
  }

  .controls {
    position: absolute;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
  }

  @media screen and (max-width: 768px) {
    .controls {
      position: static;
      transform: unset;
    }
  }
`;
