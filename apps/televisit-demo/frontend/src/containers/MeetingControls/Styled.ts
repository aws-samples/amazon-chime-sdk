// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

<<<<<<< HEAD
import styled from "styled-components";
=======
import styled from 'styled-components';
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1

interface StyledProps {
  active: boolean;
}

export const StyledControls = styled.div<StyledProps>`
<<<<<<< HEAD
  opacity: ${(props) => (props.active ? "1" : "0")};
=======
  opacity: ${props => (props.active ? '1' : '0')};
>>>>>>> fd93f5bbb41fc9082758a231d3888d823ddb8cc1
  transition: opacity 250ms ease;

  @media screen and (max-width: 768px) {
    opacity: 1;
  }

  .controls-menu {
    width: 100%;
    position: static;
  }
`;
