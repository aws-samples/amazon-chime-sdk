// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { createRoot } from 'react-dom/client';
import React from 'react';

import './style.css';
import App from './app';

window.addEventListener('load', () => {
  const container = document.getElementById('root') as HTMLElement;
  const root = createRoot(container);
  root.render(<App />);
});
