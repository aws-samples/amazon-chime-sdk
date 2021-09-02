// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import ReactDOM from 'react-dom';
import { ThemeProvider } from 'styled-components';
import {
  MeetingProvider,
  lightTheme
} from 'amazon-chime-sdk-component-library-react';
import Meeting from './components/Meeting';
import MeetingForm from './components/MeetingForm';

import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

window.addEventListener('load', () => {
  ReactDOM.render(
  <ThemeProvider theme={lightTheme}>
    <MeetingProvider>
      <MeetingForm />
      <Meeting/>
    </MeetingProvider>
  </ThemeProvider>
  , document.getElementById('root'));
});