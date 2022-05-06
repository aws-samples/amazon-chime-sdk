// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';

import { StyledLayout } from './Styled';
import { VersionLabel } from '../../utils/VersionLabel';
import MeetingForm from '../../containers/MeetingForm';

const Home = () => (
  <StyledLayout>
    <MeetingForm />
    <VersionLabel />
  </StyledLayout>
);

export default Home;
