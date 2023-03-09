// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import ReactDOM from 'react-dom';
import React from 'react';

import './style.css';
import SendingAudioFailedDemoApp from './SendingAudioFailedDemoApp';

window.addEventListener('load', () => {
  ReactDOM.render(<SendingAudioFailedDemoApp />, document.getElementById('root'));
});
