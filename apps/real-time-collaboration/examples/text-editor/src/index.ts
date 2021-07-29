// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import * as Y from 'yjs';
import { Awareness } from 'y-protocols/awareness.js';
import { QuillBinding } from 'y-quill';
import Quill from 'quill';
import QuillCursors from 'quill-cursors';
import { v4 as uuid } from 'uuid';
import { uniqueNamesGenerator, starWars } from 'unique-names-generator';
import {
  MessagingProvider,
  getSearchParameterValue,
  updateUrl,
} from 'y-chime-messaging';
import tippy, { hideAll } from 'tippy.js';
import 'quill/dist/quill.snow.css';
import './index.css';
import 'tippy.js/dist/tippy.css';
import { appConfig } from './Config';

const getInitials = (name?: string): string => {
  if (!name?.trim()) {
    return '';
  }
  const [firstName, lastName = ''] = name.split(' ');
  return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
};

const syncParticipants = (awareness: Awareness, id: string): void => {
  const participantsElement: HTMLElement = document.querySelector('.participants')!;
  participantsElement.textContent = '';
  hideAll();

  // YJS uses the custom forEach.
  // eslint-disable-next-line unicorn/no-array-for-each
  awareness.getStates().forEach((state) => {
    if (state.user) {
      const { user } = state;

      const element = document.createElement('span');
      element.textContent = getInitials(user.name);
      element.style.backgroundColor = user.color;
      participantsElement.append(element);

      const tippyInstance = tippy(element, {
        content: `${user.name || 'Anonymous'}${user.id === id ? ' (you)' : ''}`,
        placement: 'bottom',
        animation: false,
      });
      (tippyInstance.popper.querySelector('.tippy-box') as HTMLElement).style.backgroundColor = user.color;
      (tippyInstance.popper.querySelector('.tippy-arrow') as HTMLElement).style.color = user.color;
    }
  });
};

const initAwareness = (awareness: Awareness): void => {
  const id = uuid();
  const name = new URLSearchParams(window.location.search).get('name');
  const colors = [
    '#1BA39C', '#1d781d', '#3498DB', '#008080', '#1f3a93', '#d252b2', '#A74165', '#4F5A65',
    '#AA8F00', '#FF4500', '#B11030', '#BF55EC', '#3A4D13', '#67809F', '#7E7E7E', '#634806',
  ];
  awareness.setLocalStateField('user', {
    id,
    name: name ? decodeURIComponent(name) : uniqueNamesGenerator({
      dictionaries: [starWars],
    }),
    color: colors[Math.floor(Math.random() * colors.length)],
  });
  awareness.on('change', () => {
    syncParticipants(awareness, id);
  });
  syncParticipants(awareness, id);
};

window.addEventListener('load', () => {
  const ydoc = new Y.Doc();
  const provider = new MessagingProvider(
    ydoc,
    appConfig.ApiGatewayUrl,
    appConfig.AppInstanceArn,
    appConfig.AdminUserArn,
    getSearchParameterValue("channel-arn", new URL(window.location.href).searchParams),
  );
  provider.on('connected', () => {
    updateUrl(provider);
  });

  const ytext = ydoc.getText('quill');

  Quill.register('modules/cursors', QuillCursors);
  const editor = new Quill('#editor', {
    modules: {
      cursors: true,
      toolbar: '#toolbar',
      history: {
        userOnly: true,
      },
    },
    placeholder: 'Type your text here',
    theme: 'snow',
  });

  // Required for binding
  // eslint-disable-next-line no-new
  new QuillBinding(ytext, editor, provider.awareness);
  initAwareness(provider.awareness);
});
