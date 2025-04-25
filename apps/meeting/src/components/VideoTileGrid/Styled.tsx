// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import styled from 'styled-components';

export const FeaturedArea = styled.div`
  grid-area: ft;
`;

export const ContentShareGrid = styled.div`
  display: grid;
  grid-template-rows: ${(props) => 'repeat(2, 1fr)'};
  grid-template-columns: ${(props) => '1fr'};
  gap: 4px;
  width: 100%;
  height: 100%;
`;
