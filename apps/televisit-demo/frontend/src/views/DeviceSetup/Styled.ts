// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import styled from "styled-components";
=======
import styled from 'styled-components';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

export const StyledLayout = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  max-width: 85rem;
  padding: 2rem;
  margin: auto;

  @media (max-width: 760px) {
    border-right: unset;
    align-items: unset;
    justify-content: unset;
  }
`;
